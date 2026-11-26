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
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useAdminOffers, useModerateAdminOffer } from '@/hooks/api/use-admin'
import type { OfferStatus } from '@/types/api/offers'

const STATUS_LABELS: Record<OfferStatus, string> = {
  active: 'Aktif',
  draft: 'Draf',
  sold_out: 'Habis',
  closed: 'Ditutup',
  expired: 'Kedaluwarsa',
}

export function AdminModerasiView() {
  const { data: offers = [], isLoading, isError } = useAdminOffers()
  const moderateOffer = useModerateAdminOffer()
  const [filter, setFilter] = useState<'all' | OfferStatus>('all')

  const filtered = filter === 'all' ? offers : offers.filter((offer) => offer.status === filter)

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-col gap-1'>
          <h1 className='font-heading text-2xl font-semibold text-foreground'>
            Moderasi Penawaran
          </h1>
          <p className='text-base text-muted-foreground'>
            Pantau penawaran aktif dari seluruh petani dan tutup penawaran yang bermasalah.
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
          <ToggleGroupItem value='closed'>Ditutup</ToggleGroupItem>
          <ToggleGroupItem value='draft'>Draf</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {isError && (
        <Alert variant='destructive'>
          <AlertCircle />
          <AlertDescription>Gagal memuat daftar penawaran untuk moderasi.</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <Skeleton className='h-44 w-full' />
          <Skeleton className='h-44 w-full' />
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {filtered.map((offer) => (
            <Card key={offer.id}>
              <CardHeader>
                <div className='flex items-start justify-between gap-2'>
                  <div className='flex flex-col gap-1'>
                    <CardTitle>{offer.commodityName}</CardTitle>
                    <CardDescription>
                      {offer.farmerName} · {offer.pickupAddressArea}
                    </CardDescription>
                  </div>
                  <Badge variant={offer.status === 'active' ? 'default' : 'secondary'}>
                    {STATUS_LABELS[offer.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className='grid grid-cols-3 gap-3 text-sm'>
                <div>
                  <p className='text-muted-foreground'>Harga/kg</p>
                  <p className='font-mono font-medium text-foreground'>
                    Rp {offer.pricePerKg.toLocaleString('id-ID')}
                  </p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Stok sisa</p>
                  <p className='font-mono font-medium text-foreground'>
                    {offer.availableStockKg} kg
                  </p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Terjual</p>
                  <p className='font-mono font-medium text-foreground'>{offer.soldStockKg} kg</p>
                </div>
              </CardContent>
              <CardFooter className='flex flex-wrap items-center justify-between gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  nativeButton={false}
                  render={<Link href={`/pasar/penawaran/${offer.id}`} />}
                >
                  Lihat publik
                </Button>
                {(offer.status === 'active' || offer.status === 'closed') && (
                  <Button
                    variant={offer.status === 'active' ? 'destructive' : 'default'}
                    size='sm'
                    disabled={moderateOffer.isPending}
                    onClick={() =>
                      moderateOffer.mutate({
                        offerId: offer.id,
                        status: offer.status === 'active' ? 'closed' : 'active',
                      })
                    }
                  >
                    {moderateOffer.isPending && <Spinner data-icon='inline-start' />}
                    <span>
                      {offer.status === 'active' ? 'Tutup penawaran' : 'Aktifkan kembali'}
                    </span>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
