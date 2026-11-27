'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { AlertCircle, ExternalLink, MoreHorizontal, Pencil } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { useFarmerOffers, useToggleFeaturedOffer } from '@/hooks/api/use-farmer-management'
import type { FarmerStoreSettings } from '@/types/api/farmer-management'
import type { Offer, OfferStatus } from '@/types/api/offers'
import { createFarmerColumnHelper, FarmerDataTable } from './farmer-data-table'

const columnHelper = createFarmerColumnHelper<Offer>()

const STATUS_LABELS: Record<OfferStatus, string> = {
  active: 'Aktif',
  draft: 'Draf',
  sold_out: 'Habis',
  closed: 'Ditutup',
  expired: 'Kedaluwarsa',
}

export function StoreShowcaseTable({ settings }: { settings: FarmerStoreSettings }) {
  const { data: offers = [], isLoading, isError } = useFarmerOffers()
  const toggleFeatured = useToggleFeaturedOffer()
  const featuredIds = useMemo(() => settings.featuredOfferIds ?? [], [settings.featuredOfferIds])

  const columns = useMemo(
    () => [
      columnHelper.accessor('commodityName', {
        id: 'commodityName',
        header: 'Komoditas',
        meta: { label: 'Komoditas' },
        cell: (info) => {
          const offer = info.row.original
          return (
            <div className='flex min-w-0 flex-col gap-0.5'>
              <span className='font-medium text-foreground'>{offer.commodityName}</span>
              <span className='text-meta text-muted-foreground'>{offer.pickupAddressArea}</span>
            </div>
          )
        },
      }),
      columnHelper.accessor('category', {
        header: 'Kategori',
        meta: { label: 'Kategori', nowrap: true },
      }),
      columnHelper.accessor('pricePerKg', {
        header: 'Harga/kg',
        meta: { label: 'Harga/kg', nowrap: true, align: 'end' },
        cell: (info) => (
          <span className='font-mono font-medium tabular-nums'>
            Rp {info.getValue().toLocaleString('id-ID')}
          </span>
        ),
      }),
      columnHelper.accessor('availableStockKg', {
        header: 'Stok tersedia',
        meta: { label: 'Stok tersedia', nowrap: true, align: 'end' },
        cell: (info) => (
          <span className='font-mono tabular-nums'>
            {info.getValue().toLocaleString('id-ID')} kg
          </span>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        meta: { label: 'Status', nowrap: true },
        cell: (info) => {
          const status = info.getValue()
          return (
            <Badge variant={status === 'active' ? 'default' : 'secondary'}>
              {STATUS_LABELS[status]}
            </Badge>
          )
        },
      }),
      columnHelper.display({
        id: 'featured',
        header: 'Unggulan',
        meta: { label: 'Unggulan' },
        cell: (info) => {
          const offer = info.row.original
          const isFeatured = featuredIds.includes(offer.id)
          const disabled =
            offer.status !== 'active' ||
            toggleFeatured.isPending ||
            (!isFeatured && featuredIds.length >= 6)
          return (
            <div className='flex items-center gap-2'>
              <Switch
                checked={isFeatured}
                disabled={disabled}
                aria-label={`Tandai ${offer.commodityName} sebagai unggulan`}
                onCheckedChange={(checked) =>
                  toggleFeatured.mutate({ offerId: offer.id, featured: checked })
                }
              />
              <span className='text-meta text-muted-foreground'>
                {isFeatured ? 'Tampil' : 'Biasa'}
              </span>
            </div>
          )
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Aksi',
        meta: { label: 'Aksi' },
        cell: (info) => {
          const offer = info.row.original
          return (
            <div className='flex items-center gap-1.5'>
              <Button
                variant='outline'
                size='icon-sm'
                nativeButton={false}
                aria-label={`Sunting ${offer.commodityName}`}
                title='Sunting'
                render={<Link href={`/dashboard/penawaran/${offer.id}`} />}
              >
                <Pencil aria-hidden='true' />
              </Button>
              {offer.status !== 'draft' && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        type='button'
                        variant='outline'
                        size='icon-sm'
                        aria-label={`Aksi lainnya untuk ${offer.commodityName}`}
                        title='Aksi lainnya'
                      />
                    }
                  >
                    <MoreHorizontal aria-hidden='true' />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align='end'
                    sideOffset={8}
                    collisionPadding={12}
                    className='w-52 max-w-[calc(100vw-1.5rem)]'
                  >
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        className='min-h-11 sm:min-h-9'
                        render={<Link href={`/pasar/penawaran/${offer.id}`} />}
                      >
                        <ExternalLink className='icon-sm' aria-hidden='true' />
                        <span>Pasar Panen</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )
        },
      }),
    ],
    [featuredIds, toggleFeatured]
  )

  if (isError) {
    return (
      <Alert variant='destructive'>
        <AlertCircle />
        <AlertDescription>Gagal memuat daftar etalase toko.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className='flex flex-col gap-4'>
      {toggleFeatured.isError && (
        <Alert variant='destructive'>
          <AlertCircle />
          <AlertDescription>{toggleFeatured.error.message}</AlertDescription>
        </Alert>
      )}

      <FarmerDataTable
        data={isLoading ? [] : offers}
        columns={columns}
        caption={`Daftar penawaran di etalase toko (${featuredIds.length}/6 unggulan)`}
        rowHeaderColumnId='commodityName'
        searchPlaceholder='Cari komoditas di etalase...'
        searchAriaLabel='Cari komoditas etalase toko'
        emptyTitle='Belum ada penawaran di etalase'
        emptyDescription='Buat penawaran panen agar komoditas muncul di etalase toko.'
        emptyAction={
          <Button nativeButton={false} render={<Link href='/dashboard/penawaran/baru' />}>
            Buat penawaran
          </Button>
        }
      />
    </div>
  )
}
