'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useFarmerOffers } from '@/hooks/api/use-farmer-management'
import type { OfferStatus } from '@/types/api/offers'

const STATUS_LABELS: Record<OfferStatus, string> = {
  active: 'Aktif',
  draft: 'Draf',
  sold_out: 'Habis',
  closed: 'Ditutup',
  expired: 'Kedaluwarsa',
}

export function FarmerOffersView() {
  const { data: offers = [], isLoading, isError } = useFarmerOffers()
  const [filter, setFilter] = useState<'all' | OfferStatus>('all')

  const filtered = filter === 'all' ? offers : offers.filter((offer) => offer.status === filter)

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-col gap-1'>
          <h1 className='type-h1 font-semibold text-foreground'>Penawaran Panen</h1>
          <p className='text-base text-muted-foreground'>
            Pantau stok tersedia, reservasi aktif, dan batas waktu setiap lot panen.
          </p>
        </div>

        <ToggleGroup
          value={[filter]}
          onValueChange={(values) => {
            const next = values[0] as 'all' | OfferStatus | undefined
            if (next) setFilter(next)
          }}
          variant='outline'
          size='sm'
        >
          <ToggleGroupItem value='all'>Semua ({offers.length})</ToggleGroupItem>
          <ToggleGroupItem value='active'>Aktif</ToggleGroupItem>
          <ToggleGroupItem value='draft'>Draf</ToggleGroupItem>
          <ToggleGroupItem value='closed'>Ditutup</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {isError && (
        <Alert variant='destructive'>
          <AlertCircle />
          <AlertDescription>Gagal memuat daftar penawaran panen Anda.</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <Skeleton className='h-44 w-full' />
          <Skeleton className='h-44 w-full' />
        </div>
      ) : filtered.length === 0 ? (
        <Empty className='border border-border bg-card'>
          <EmptyHeader>
            <EmptyTitle>Tidak ada penawaran pada filter ini</EmptyTitle>
            <EmptyDescription>
              Ubah filter status untuk melihat penawaran panen lainnya.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {filtered.map((offer) => (
            <Card key={offer.id}>
              <CardHeader>
                <div className='flex items-start justify-between gap-2'>
                  <div className='flex flex-col gap-1'>
                    <CardTitle>{offer.commodityName}</CardTitle>
                    <CardDescription>{offer.pickupAddressArea}</CardDescription>
                  </div>
                  <Badge variant={offer.status === 'active' ? 'default' : 'secondary'}>
                    {STATUS_LABELS[offer.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className='grid grid-cols-2 gap-3 text-sm'>
                <div>
                  <p className='text-muted-foreground'>Harga per kg</p>
                  <p className='font-mono font-semibold text-foreground'>
                    Rp {offer.pricePerKg.toLocaleString('id-ID')}
                  </p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Stok tersedia</p>
                  <p className='font-mono font-semibold text-foreground'>
                    {offer.availableStockKg.toLocaleString('id-ID')} kg
                  </p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Direservasi / Terjual</p>
                  <p className='font-mono text-foreground'>
                    {offer.reservedStockKg} kg / {offer.soldStockKg} kg
                  </p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Batas pesan</p>
                  <p className='text-foreground'>
                    {new Date(offer.orderDeadline).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </CardContent>
              {offer.status !== 'draft' && (
                <CardFooter>
                  <Button
                    variant='outline'
                    nativeButton={false}
                    render={<Link href={`/pasar/penawaran/${offer.id}`} />}
                  >
                    Lihat di Pasar Panen
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
