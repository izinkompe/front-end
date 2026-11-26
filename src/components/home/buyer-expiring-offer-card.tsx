'use client'

import Link from 'next/link'
import { AlertCircle, Check, Clock, Lock, Share2, Sprout } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { Offer } from '@/types/api/offers'
import {
  buildOfferDetailHref,
  formatFarmerDisplayName,
  formatNextPickupSlot,
  formatPricePerKg,
  formatStraightLineDistance,
  formatWeightKg,
  getCommodityConditionMeta,
  getDynamicPriceSummary,
  getOfferCountdownState,
} from './offer-card-helpers'

export type ShareButtonState = 'idle' | 'copied' | 'failed'

interface BuyerExpiringOfferCardProps {
  offer: Offer
  nowMs: number | null
  distanceKm: number | null
  shareState: ShareButtonState
  onShare: (offer: Offer) => void
}

export function BuyerExpiringOfferCard({
  offer,
  nowMs,
  distanceKm,
  shareState,
  onShare,
}: BuyerExpiringOfferCardProps) {
  const countdown =
    nowMs === null
      ? {
          remainingMs: 1,
          isExpired: false,
          urgency: 'soon' as const,
          label: 'Segera ditutup',
        }
      : getOfferCountdownState(offer.orderDeadline, nowMs)

  const priceSummary = getDynamicPriceSummary(offer.pricePerKg, offer.dynamicPriceRule)
  const conditionMeta = getCommodityConditionMeta(offer.condition)
  const farmerDisplayName = formatFarmerDisplayName(offer.farmerName)
  const nextPickupSlot = formatNextPickupSlot(offer.pickupScheduleSlots)
  const detailHref = buildOfferDetailHref(offer.id)
  const distanceLabel = distanceKm === null ? null : formatStraightLineDistance(distanceKm)

  const badgeVariant = countdown.isExpired
    ? 'outline'
    : countdown.urgency === 'critical'
      ? 'destructive'
      : 'default'

  return (
    <article
      className={cn(
        'relative flex h-full flex-col justify-between rounded-2xl border border-border p-5 text-card-foreground shadow-sm transition-shadow',
        countdown.isExpired
          ? 'bg-muted/60'
          : 'bg-card has-[a.offer-card-link:hover]:border-foreground/30 has-[a.offer-card-link:hover]:shadow-md has-[a.offer-card-link:focus-visible]:outline-2 has-[a.offer-card-link:focus-visible]:outline-offset-2 has-[a.offer-card-link:focus-visible]:outline-ring'
      )}
    >
      <div className='flex flex-col gap-4'>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0 flex-1'>
            <p className='flex min-w-0 items-center gap-1 text-sm text-muted-foreground'>
              <span className='truncate'>{offer.pickupAddressArea}</span>
              {distanceLabel && <span className='shrink-0 tabular-nums'>({distanceLabel})</span>}
            </p>
            <h3 className='mt-1 line-clamp-2 text-lg leading-snug font-bold text-foreground'>
              {countdown.isExpired ? (
                <span>{offer.commodityName}</span>
              ) : (
                <Link
                  href={detailHref}
                  className='offer-card-link underline-offset-4 outline-none hover:underline after:absolute after:inset-0 after:content-[""]'
                >
                  {offer.commodityName}
                </Link>
              )}
            </h3>
          </div>

          <Badge
            variant={badgeVariant}
            className='shrink-0 rounded-lg px-2.5 py-1 text-sm font-semibold'
          >
            {countdown.isExpired ? (
              <Lock data-icon='inline-start' aria-hidden='true' />
            ) : (
              <Clock data-icon='inline-start' aria-hidden='true' />
            )}
            {countdown.isExpired ? (
              <span>Ditutup</span>
            ) : (
              <time dateTime={offer.orderDeadline} className='tabular-nums'>
                {countdown.label}
              </time>
            )}
          </Badge>
        </div>

        <div className='flex items-end justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-1'>
            <p className='text-sm text-muted-foreground'>Ambil mandiri</p>
            <p className='text-sm font-semibold text-foreground tabular-nums'>
              Sisa {formatWeightKg(offer.availableStockKg)}
            </p>
            <p className='text-sm text-muted-foreground tabular-nums'>{nextPickupSlot}</p>
            {countdown.isExpired && (
              <p className='mt-0.5 text-sm font-medium text-destructive'>Batas pesan berakhir</p>
            )}
          </div>

          <div className='flex shrink-0 flex-col items-end text-right'>
            <span className='text-sm text-muted-foreground'>
              {priceSummary.hasDynamicRule ? 'Harga dinamis' : 'Harga per kg'}
            </span>
            {priceSummary.hasDropped && priceSummary.originalPriceFormatted && (
              <span className='text-sm text-muted-foreground line-through tabular-nums'>
                {priceSummary.originalPriceFormatted}
              </span>
            )}
            <p
              className={cn(
                'text-lg leading-tight font-bold tabular-nums',
                priceSummary.hasDropped ? 'text-destructive' : 'text-primary'
              )}
            >
              {formatPricePerKg(offer.pricePerKg)}
            </p>
            {priceSummary.scheduleHint && (
              <span className='mt-0.5 text-sm text-muted-foreground tabular-nums'>
                {priceSummary.scheduleHint}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className='mt-4 flex flex-col gap-3'>
        <Separator />
        <footer className='flex items-center justify-between gap-2'>
          <div className='flex min-w-0 items-center gap-2 text-sm text-muted-foreground'>
            <Sprout className='size-4 shrink-0 text-primary' aria-hidden='true' />
            <span className='truncate'>
              {farmerDisplayName}, {conditionMeta.shortLabel}
            </span>
          </div>

          <div className='flex shrink-0 items-center gap-1.5'>
            <span
              aria-hidden='true'
              className={cn(
                'text-sm font-medium transition-opacity duration-150',
                shareState === 'copied'
                  ? 'text-primary opacity-100'
                  : shareState === 'failed'
                    ? 'text-destructive opacity-100'
                    : 'pointer-events-none opacity-0'
              )}
            >
              {shareState === 'copied' ? 'Disalin' : shareState === 'failed' ? 'Gagal' : ''}
            </span>
            <Button
              type='button'
              variant='ghost'
              size='icon-sm'
              onClick={() => onShare(offer)}
              aria-label={`Bagikan tautan ${offer.commodityName}`}
              data-copied={shareState === 'copied' ? '' : undefined}
              data-failed={shareState === 'failed' ? '' : undefined}
              className='relative z-1 text-muted-foreground hover:text-foreground'
            >
              {shareState === 'copied' ? (
                <Check aria-hidden='true' className='text-primary' />
              ) : shareState === 'failed' ? (
                <AlertCircle aria-hidden='true' className='text-destructive' />
              ) : (
                <Share2 aria-hidden='true' />
              )}
            </Button>
          </div>
        </footer>
      </div>
    </article>
  )
}
