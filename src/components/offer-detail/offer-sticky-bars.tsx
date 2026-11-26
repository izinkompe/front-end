'use client'

import Link from 'next/link'
import { ArrowLeft, Check, Heart, Share2 } from 'lucide-react'
import type { ShareButtonState } from '@/components/home/buyer-expiring-offer-card'
import { formatPricePerKg, formatWeightKg } from '@/components/home/offer-card-helpers'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Offer } from '@/types/api/offers'

interface OfferStickyBarsProps {
  offer: Offer
  showDesktopSticky: boolean
  isUnavailable: boolean
  hasDroppedPrice: boolean
  isFavorite: boolean
  shareState: ShareButtonState
  onToggleFavorite: (offer: Offer) => void
  onShare: (offer: Offer) => void
  onOpenMobileSheet: () => void
  onScrollToReservation: () => void
}

export function OfferStickyBars({
  offer,
  showDesktopSticky,
  isUnavailable,
  hasDroppedPrice,
  isFavorite,
  shareState,
  onToggleFavorite,
  onShare,
  onOpenMobileSheet,
  onScrollToReservation,
}: OfferStickyBarsProps) {
  return (
    <>
      {showDesktopSticky && (
        <div className='fixed inset-x-0 top-[109px] z-30 hidden lg:block'>
          <div className='bg-background/95 shadow-[0_4px_12px_rgb(0_0_0/0.08)] backdrop-blur-sm'>
            <div className='mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-8'>
              <div className='flex min-w-0 items-center gap-3'>
                <Button
                  variant='ghost'
                  size='sm'
                  nativeButton={false}
                  render={<Link href='/pasar' />}
                  className='shrink-0'
                >
                  <ArrowLeft data-icon='inline-start' aria-hidden='true' />
                  <span>Katalog</span>
                </Button>
                <p className='truncate text-base font-bold text-foreground'>
                  {offer.commodityName}
                </p>
              </div>

              <div className='flex shrink-0 items-center gap-3'>
                <div className='text-right'>
                  <p
                    className={cn(
                      'text-base font-bold tabular-nums',
                      hasDroppedPrice ? 'text-destructive' : 'text-primary'
                    )}
                  >
                    {formatPricePerKg(offer.pricePerKg)}
                  </p>
                  <p className='text-xs text-muted-foreground tabular-nums'>
                    Sisa {formatWeightKg(offer.availableStockKg)}
                  </p>
                </div>

                <Button size='sm' disabled={isUnavailable} onClick={onScrollToReservation}>
                  {isUnavailable ? 'Tidak tersedia' : 'Pesan sekarang'}
                </Button>

                <Button
                  type='button'
                  variant='ghost'
                  size='icon-sm'
                  aria-pressed={isFavorite}
                  aria-label={
                    isFavorite
                      ? `Hapus ${offer.commodityName} dari favorit`
                      : `Simpan ${offer.commodityName} ke favorit`
                  }
                  onClick={() => onToggleFavorite(offer)}
                >
                  <Heart
                    aria-hidden='true'
                    className={cn(isFavorite && 'fill-destructive text-destructive')}
                  />
                </Button>

                <Button
                  type='button'
                  variant='ghost'
                  size='icon-sm'
                  aria-label={`Bagikan tautan ${offer.commodityName}`}
                  onClick={() => onShare(offer)}
                >
                  {shareState === 'copied' ? (
                    <Check aria-hidden='true' className='text-primary' />
                  ) : (
                    <Share2 aria-hidden='true' />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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

          <Button
            size='lg'
            disabled={isUnavailable}
            onClick={onOpenMobileSheet}
            className='shrink-0'
          >
            {isUnavailable ? 'Tidak tersedia' : 'Pesan sekarang'}
          </Button>
        </div>
      </div>
    </>
  )
}
