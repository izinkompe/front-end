'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { DashboardPageHeader } from './dashboard-page-header'
import {
  AlertCircle,
  Copy,
  ExternalLink,
  Link2,
  MoreHorizontal,
  PackageCheck,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { useCurrentUser } from '@/hooks/api/use-auth'
import { useCloseFarmerOffer, useFarmerOffers } from '@/hooks/api/use-farmer-management'
import type { CommodityCondition, Offer, OfferStatus } from '@/types/api/offers'
import { DashboardFilterSelect } from './dashboard-filter-select'
import { createFarmerColumnHelper, FarmerDataTable } from './farmer/farmer-data-table'
import { FarmerVerificationBanner } from './farmer/farmer-verification-banner'
import { OfferStockSheet } from './farmer/offer-stock-sheet'

const columnHelper = createFarmerColumnHelper<Offer>()

const STATUS_LABELS: Record<OfferStatus, string> = {
  active: 'Aktif',
  draft: 'Draf',
  sold_out: 'Habis',
  closed: 'Ditutup',
  expired: 'Kedaluwarsa',
}

const CONDITION_LABELS: Record<CommodityCondition, string> = {
  surplus: 'Surplus panen',
  grade_b: 'Grade B segar',
  imperfect_shape: 'Bentuk tidak seragam',
  ripe_urgent: 'Matang segera olah',
}

export function FarmerOffersView() {
  const { data: user } = useCurrentUser()
  const { data: offers = [], isLoading, isError } = useFarmerOffers()
  const closeOffer = useCloseFarmerOffer()
  const [filter, setFilter] = useState<'all' | OfferStatus>('all')
  const [stockTarget, setStockTarget] = useState<Offer | null>(null)
  const [closeTarget, setCloseTarget] = useState<Offer | null>(null)
  const [announcement, setAnnouncement] = useState<string | null>(null)

  const filtered = useMemo(
    () => (filter === 'all' ? offers : offers.filter((offer) => offer.status === filter)),
    [filter, offers]
  )

  function handleCopyPublicLink(offer: Offer) {
    if (typeof window === 'undefined' || !navigator.clipboard) return
    const url = `${window.location.origin}/pasar/penawaran/${encodeURIComponent(offer.id)}`
    void navigator.clipboard.writeText(url).then(() => {
      setAnnouncement(`Tautan publik ${offer.commodityName} disalin ke papan klip.`)
    })
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('commodityName', {
        id: 'commodityName',
        header: 'Komoditas & Kebun',
        meta: { label: 'Komoditas & Kebun' },
        cell: (info) => {
          const offer = info.row.original
          return (
            <div className='flex min-w-0 flex-col gap-0.5'>
              <span className='font-medium text-foreground'>{offer.commodityName}</span>
              <span className='text-meta text-muted-foreground'>{offer.pickupAddressArea}</span>
              {offer.estimatedPortionNote && (
                <span className='text-meta text-muted-foreground'>
                  {offer.estimatedPortionNote}
                </span>
              )}
            </div>
          )
        },
      }),
      columnHelper.accessor('condition', {
        header: 'Kondisi',
        meta: { label: 'Kondisi' },
        cell: (info) => {
          const offer = info.row.original
          return (
            <div className='flex flex-col gap-0.5'>
              <span className='text-foreground'>{CONDITION_LABELS[offer.condition]}</span>
              <span className='text-meta text-muted-foreground'>
                Panen {new Date(offer.harvestDate).toLocaleDateString('id-ID')}
              </span>
            </div>
          )
        },
      }),
      columnHelper.accessor('pricePerKg', {
        header: 'Harga/kg',
        meta: { label: 'Harga/kg', nowrap: true, align: 'end' },
        cell: (info) => {
          const offer = info.row.original
          return (
            <div className='flex flex-col items-end gap-0.5'>
              <span className='font-mono font-semibold text-foreground tabular-nums'>
                Rp {offer.pricePerKg.toLocaleString('id-ID')}
              </span>
              {offer.dynamicPriceRule && <Badge variant='outline'>Harga dinamis</Badge>}
            </div>
          )
        },
      }),
      columnHelper.accessor('availableStockKg', {
        header: 'Stok (kg)',
        meta: { label: 'Stok (kg)', align: 'end' },
        cell: (info) => {
          const offer = info.row.original
          return (
            <div className='flex flex-col items-end gap-0.5 font-mono tabular-nums'>
              <span className='font-semibold text-foreground'>
                Tersedia {offer.availableStockKg.toLocaleString('id-ID')} kg
              </span>
              <span className='text-meta text-muted-foreground'>
                Pesan {offer.reservedStockKg.toLocaleString('id-ID')} · Terjual{' '}
                {offer.soldStockKg.toLocaleString('id-ID')}
              </span>
            </div>
          )
        },
      }),
      columnHelper.accessor('orderDeadline', {
        header: 'Batas pesan',
        meta: { label: 'Batas pesan', nowrap: true },
        cell: (info) => {
          const offer = info.row.original
          return (
            <div className='flex flex-col gap-0.5'>
              <span className='text-foreground tabular-nums'>
                {new Date(offer.orderDeadline).toLocaleDateString('id-ID')}
              </span>
              <span className='text-meta text-muted-foreground'>
                {offer.pickupScheduleSlots.length} slot jadwal
              </span>
            </div>
          )
        },
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
                render={<Link href={`/dashboard/penawaran/${encodeURIComponent(offer.id)}`} />}
              >
                <Pencil aria-hidden='true' />
              </Button>
              {offer.status === 'active' && (
                <Button
                  type='button'
                  variant='outline'
                  size='icon-sm'
                  aria-label={`Tutup ${offer.commodityName}`}
                  title='Tutup penawaran'
                  className='text-destructive hover:text-destructive'
                  onClick={() => setCloseTarget(offer)}
                >
                  <Trash2 aria-hidden='true' />
                </Button>
              )}
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
                      onClick={() => setStockTarget(offer)}
                    >
                      <PackageCheck className='icon-sm' aria-hidden='true' />
                      <span>Koreksi stok</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className='min-h-11 sm:min-h-9'
                      render={
                        <Link
                          href={`/dashboard/penawaran/baru?copyFrom=${encodeURIComponent(offer.id)}`}
                        />
                      }
                    >
                      <Copy className='icon-sm' aria-hidden='true' />
                      <span>Salin draf</span>
                    </DropdownMenuItem>
                    {offer.status === 'active' && (
                      <DropdownMenuItem
                        className='min-h-11 sm:min-h-9'
                        onClick={() => handleCopyPublicLink(offer)}
                      >
                        <Link2 className='icon-sm' aria-hidden='true' />
                        <span>Salin tautan</span>
                      </DropdownMenuItem>
                    )}
                    {offer.status !== 'draft' && (
                      <DropdownMenuItem
                        className='min-h-11 sm:min-h-9'
                        render={<Link href={`/pasar/penawaran/${encodeURIComponent(offer.id)}`} />}
                      >
                        <ExternalLink className='icon-sm' aria-hidden='true' />
                        <span>Pasar Panen</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      }),
    ],
    []
  )

  return (
    <div className='flex flex-col gap-6'>
      <DashboardPageHeader
        title='Penawaran Panen'
        actions={
          <Button nativeButton={false} render={<Link href='/dashboard/penawaran/baru' />}>
            <Plus data-icon='inline-start' aria-hidden='true' />
            <span>Buat penawaran</span>
          </Button>
        }
      />

      <FarmerVerificationBanner isVerified={user?.isVerifiedFarmer} context='offers' />

      {announcement && (
        <Alert role='status' aria-live='polite'>
          <AlertDescription>{announcement}</AlertDescription>
        </Alert>
      )}

      {isError && (
        <Alert variant='destructive'>
          <AlertCircle />
          <AlertDescription>Gagal memuat daftar penawaran panen Anda.</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <Skeleton className='h-72 w-full' />
      ) : (
        <FarmerDataTable
          data={filtered}
          columns={columns}
          caption='Daftar penawaran panen dan pengelolaan stok petani'
          rowHeaderColumnId='commodityName'
          searchPlaceholder='Cari komoditas atau wilayah...'
          searchAriaLabel='Cari penawaran panen'
          filterSlot={
            <DashboardFilterSelect
              ariaLabel='Filter status penawaran'
              value={filter}
              onValueChange={setFilter}
              options={[
                { value: 'all', label: `Semua status (${offers.length})` },
                { value: 'active', label: 'Aktif' },
                { value: 'draft', label: 'Draf' },
                { value: 'sold_out', label: 'Habis' },
                { value: 'closed', label: 'Ditutup' },
              ]}
            />
          }
          emptyTitle='Tidak ada penawaran pada filter ini'
          emptyDescription='Buat penawaran baru atau ubah filter status untuk melihat penawaran lainnya.'
          emptyAction={
            <Button nativeButton={false} render={<Link href='/dashboard/penawaran/baru' />}>
              Buat penawaran
            </Button>
          }
        />
      )}

      <OfferStockSheet
        offer={stockTarget}
        onOpenChange={(open) => {
          if (!open) setStockTarget(null)
        }}
        onSaved={() => setAnnouncement('Koreksi stok dan kondisi penawaran disimpan.')}
      />

      <AlertDialog
        open={Boolean(closeTarget)}
        onOpenChange={(open) => {
          if (!open) setCloseTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tutup penawaran ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Penawaran yang ditutup tidak lagi tampil di katalog pembeli, sementara pesanan aktif
              tetap dilanjutkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Kembali</AlertDialogCancel>
            <AlertDialogAction
              variant='destructive'
              disabled={closeOffer.isPending}
              onClick={() => {
                if (!closeTarget) return
                closeOffer.mutate(closeTarget.id, {
                  onSuccess: () => {
                    setAnnouncement(`Penawaran ${closeTarget.commodityName} ditutup.`)
                    setCloseTarget(null)
                  },
                })
              }}
            >
              {closeOffer.isPending && <Spinner data-icon='inline-start' />}
              <span>Tutup penawaran</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
