'use client'

import Link from 'next/link'
import { X } from 'lucide-react'
import {
  buildOfferDetailHref,
  formatNextPickupSlot,
  formatPricePerKg,
  formatStraightLineDistance,
  formatWeightKg,
} from '@/components/home/offer-card-helpers'
import { Button } from '@/components/ui/button'
import type { CatalogOfferItem } from '@/lib/data/catalog-filters'
import { cn } from '@/lib/utils'

interface CatalogMapSelectedCardProps {
  item: CatalogOfferItem
  onClose: () => void
}

export function CatalogMapSelectedCard({ item, onClose }: CatalogMapSelectedCardProps) {
  return (
    <div className='absolute inset-x-3 bottom-3 z-[450] rounded-xl border border-border bg-card p-3.5 text-card-foreground shadow-lg'>
      <div className='flex items-start justify-between gap-2'>
        <div className='min-w-0 flex-1'>
          <p className='truncate text-xs text-muted-foreground tabular-nums'>
            {item.offer.pickupAddressArea}
            {item.distanceKm !== null ? ` (${formatStraightLineDistance(item.distanceKm)})` : ''}
          </p>
          <h3 className='mt-0.5 line-clamp-1 text-base font-bold text-foreground'>
            {item.offer.commodityName}
          </h3>
        </div>

        <Button
          type='button'
          variant='ghost'
          size='icon-xs'
          onClick={onClose}
          aria-label='Tutup pratinjau penawaran'
          className='shrink-0 text-muted-foreground hover:text-foreground'
        >
          <X aria-hidden='true' />
        </Button>
      </div>

      <div className='mt-2.5 flex flex-wrap items-end justify-between gap-3'>
        <div className='flex flex-col gap-0.5'>
          <span
            className={cn(
              'text-base font-bold tabular-nums',
              item.isExpired ? 'text-muted-foreground' : 'text-primary'
            )}
          >
            {formatPricePerKg(item.offer.pricePerKg)}
          </span>
          <span className='text-xs text-muted-foreground tabular-nums'>
            Sisa {formatWeightKg(item.offer.availableStockKg)}, ambil{' '}
            {formatNextPickupSlot(item.offer.pickupScheduleSlots)}
          </span>
        </div>

        {item.isExpired ? (
          <span className='text-xs font-medium text-destructive'>Batas pesan berakhir</span>
        ) : (
          <Button
            size='sm'
            nativeButton={false}
            render={<Link href={buildOfferDetailHref(item.offer.id)} />}
          >
            Lihat detail
          </Button>
        )}
      </div>
    </div>
  )
}
