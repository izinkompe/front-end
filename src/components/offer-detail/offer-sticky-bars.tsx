'use client'

import { formatPricePerKg, formatWeightKg } from '@/components/home/offer-card-helpers'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Offer } from '@/types/api/offers'

interface OfferStickyBarsProps {
  offer: Offer
  isUnavailable: boolean
  hasDroppedPrice: boolean
  onOpenMobileSheet: () => void
}

export function OfferStickyBars({
  offer,
  isUnavailable,
  hasDroppedPrice,
  onOpenMobileSheet,
}: OfferStickyBarsProps) {
  return (
    <div className='fixed inset-x-0 bottom-0 z-30 bg-background/95 px-4 py-3 shadow-[0_-4px_16px_rgb(0_0_0/0.08)] backdrop-blur-sm lg:hidden'>
      <div className='mx-auto flex max-w-7xl items-center justify-between gap-3'>
        <div className='min-w-0'>
          <p
            className={cn(
              'text-lg leading-tight font-bold tabular-nums',
              hasDroppedPrice ? 'text-destructive' : 'text-primary'
            )}
          >
            {formatPricePerKg(offer.pricePerKg)}
          </p>
          <p className='truncate text-xs text-muted-foreground tabular-nums'>
            {offer.availableStockKg > 0
              ? `Sisa ${formatWeightKg(offer.availableStockKg)}`
              : 'Stok habis'}
          </p>
        </div>

        <Button size='lg' disabled={isUnavailable} onClick={onOpenMobileSheet} className='shrink-0'>
          {isUnavailable ? 'Tidak tersedia' : 'Pesan sekarang'}
        </Button>
      </div>
    </div>
  )
}
