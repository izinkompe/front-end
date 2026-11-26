'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  AlertCircle,
  Check,
  Clock,
  Flame,
  Heart,
  Layers,
  Lock,
  MapPin,
  Scale,
  Shapes,
  Share2,
  Sprout,
  type LucideIcon,
} from 'lucide-react'
import type { ShareButtonState } from '@/components/home/buyer-expiring-offer-card'
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
  getSafeOfferPhotoUrl,
} from '@/components/home/offer-card-helpers'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { buildFarmerStoreHref } from '@/lib/data/farmer-store-helpers'
import { cn } from '@/lib/utils'
import type { CommodityCondition, Offer } from '@/types/api/offers'

const conditionIcons: Record<CommodityCondition, LucideIcon> = {
  ripe_urgent: Flame,
  grade_b: Scale,
  surplus: Layers,
  imperfect_shape: Shapes,
}

interface CatalogOfferCardProps {
  offer: Offer
  distanceKm: number | null
  nowMs: number | null
  priorityImage: boolean
  isFavorite: boolean
  shareState: ShareButtonState
  layout?: 'grid' | 'row'
  onToggleFavorite: (offer: Offer) => void
  onShare: (offer: Offer) => void
}

export function CatalogOfferCard({
  offer,
  distanceKm,
  nowMs,
  priorityImage,
  isFavorite,
  shareState,
  layout = 'grid',
  onToggleFavorite,
  onShare,
}: CatalogOfferCardProps) {
  const photoUrl = getSafeOfferPhotoUrl(offer.photos)
  const conditionMeta = getCommodityConditionMeta(offer.condition)
  const ConditionIcon = conditionIcons[offer.condition]
  const priceSummary = getDynamicPriceSummary(offer.pricePerKg, offer.dynamicPriceRule)
  const farmerDisplayName = formatFarmerDisplayName(offer.farmerName)
  const farmerHref = buildFarmerStoreHref(offer.farmerId)
  const nextPickupSlot = formatNextPickupSlot(offer.pickupScheduleSlots)
  const detailHref = buildOfferDetailHref(offer.id)
  const distanceLabel = distanceKm === null ? null : formatStraightLineDistance(distanceKm)

  const countdown = nowMs !== null ? getOfferCountdownState(offer.orderDeadline, nowMs) : null
  const isExpired = Boolean(countdown?.isExpired)
  const showUrgentCountdown =
    countdown !== null &&
    !countdown.isExpired &&
    (countdown.urgency === 'critical' || countdown.urgency === 'soon')

  const isRow = layout === 'row'

  const mediaNode = (
    <div
      className={cn(
        'relative overflow-hidden bg-muted',
        isRow ? 'aspect-4/3 w-full shrink-0 sm:w-52 md:w-56' : 'aspect-4/3 w-full'
      )}
    >
      {photoUrl ? (
        <Image
          src={photoUrl}
          alt={`${offer.commodityName} dari ${offer.pickupAddressArea}`}
          fill
          sizes={
            isRow
              ? '(max-width: 640px) 100vw, 224px'
              : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw'
          }
          loading={priorityImage ? 'eager' : 'lazy'}
          fetchPriority={priorityImage ? 'high' : undefined}
          className={cn('object-cover', isExpired && 'opacity-65 grayscale-25')}
        />
      ) : (
        <div
          aria-hidden='true'
          className='flex size-full items-center justify-center bg-muted text-muted-foreground'
        >
          <Sprout className='size-8' />
        </div>
      )}

      {!isRow && (
        <div className='absolute top-3 left-3 z-1'>
          {isExpired ? (
            <Badge variant='outline' className='border-border bg-background/95 text-foreground'>
              <Lock data-icon='inline-start' aria-hidden='true' />
              <span>Ditutup</span>
            </Badge>
          ) : showUrgentCountdown && countdown ? (
            <Badge
              variant={countdown.urgency === 'critical' ? 'outline' : 'default'}
              className={cn(
                countdown.urgency === 'critical' &&
                  'border-destructive/40 bg-background/95 font-semibold text-destructive'
              )}
            >
              <Clock data-icon='inline-start' aria-hidden='true' />
              <time dateTime={offer.orderDeadline} className='tabular-nums'>
                {countdown.label}
              </time>
            </Badge>
          ) : (
            <Badge
              variant='outline'
              className={cn(
                'border-border bg-background/95',
                offer.condition === 'ripe_urgent'
                  ? 'border-destructive/40 text-destructive'
                  : 'text-foreground'
              )}
            >
              <ConditionIcon data-icon='inline-start' aria-hidden='true' />
              <span>{conditionMeta.shortLabel}</span>
            </Badge>
          )}
        </div>
      )}

      {isRow && (isExpired || showUrgentCountdown) && (
        <div className='absolute top-2.5 left-2.5 z-1'>
          {isExpired ? (
            <Badge variant='outline' className='border-border bg-background/95 text-foreground'>
              <Lock data-icon='inline-start' aria-hidden='true' />
              <span>Ditutup</span>
            </Badge>
          ) : (
            countdown && (
              <Badge
                variant={countdown.urgency === 'critical' ? 'outline' : 'default'}
                className={cn(
                  countdown.urgency === 'critical' &&
                    'border-destructive/40 bg-background/95 font-semibold text-destructive'
                )}
              >
                <Clock data-icon='inline-start' aria-hidden='true' />
                <time dateTime={offer.orderDeadline} className='tabular-nums'>
                  {countdown.label}
                </time>
              </Badge>
            )
          )}
        </div>
      )}

      <Button
        type='button'
        variant='secondary'
        size='icon-sm'
        aria-pressed={isFavorite}
        aria-label={
          isFavorite
            ? `Hapus ${offer.commodityName} dari favorit`
            : `Simpan ${offer.commodityName} ke favorit`
        }
        onClick={() => onToggleFavorite(offer)}
        className='absolute top-2.5 right-2.5 z-1 rounded-full bg-background/90 text-foreground shadow-xs hover:bg-background'
      >
        <Heart
          aria-hidden='true'
          className={cn(isFavorite && 'fill-destructive text-destructive')}
        />
      </Button>
    </div>
  )

  const shareButtonNode = (
    <div className='flex shrink-0 items-center gap-1'>
      {shareState !== 'idle' && (
        <span
          aria-hidden='true'
          className={cn(
            'text-xs font-medium',
            shareState === 'copied' ? 'text-primary' : 'text-destructive'
          )}
        >
          {shareState === 'copied' ? 'Disalin' : 'Gagal'}
        </span>
      )}
      <Button
        type='button'
        variant='ghost'
        size='icon-sm'
        onClick={() => onShare(offer)}
        aria-label={`Bagikan tautan ${offer.commodityName}`}
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
  )

  if (isRow) {
    return (
      <article
        className={cn(
          '@container relative flex flex-col overflow-hidden rounded-2xl border border-border text-card-foreground shadow-xs transition-shadow sm:flex-row',
          isExpired
            ? 'bg-muted/60'
            : 'bg-card has-[a.catalog-card-link:hover]:border-foreground/30 has-[a.catalog-card-link:hover]:shadow-md has-[a.catalog-card-link:focus-visible]:outline-2 has-[a.catalog-card-link:focus-visible]:outline-offset-2 has-[a.catalog-card-link:focus-visible]:outline-ring'
        )}
      >
        {mediaNode}

        <div className='flex min-w-0 flex-1 flex-col justify-between gap-3 p-4'>
          <div className='flex flex-col gap-1.5'>
            <div className='flex items-center justify-between gap-2'>
              <div className='flex min-w-0 flex-wrap items-center gap-2'>
                <Badge
                  variant='outline'
                  className={cn(
                    'rounded-md border-border px-2 py-0.5 text-xs',
                    offer.condition === 'ripe_urgent'
                      ? 'border-destructive/40 text-destructive'
                      : 'text-foreground'
                  )}
                >
                  <ConditionIcon data-icon='inline-start' aria-hidden='true' />
                  <span>{conditionMeta.shortLabel}</span>
                </Badge>
                <span
                  className={cn(
                    'text-sm font-medium tabular-nums',
                    offer.availableStockKg <= 35 ? 'text-destructive' : 'text-muted-foreground'
                  )}
                >
                  Sisa {formatWeightKg(offer.availableStockKg)}
                </span>
              </div>

              {shareButtonNode}
            </div>

            <h3 className='line-clamp-2 text-lg leading-snug font-bold text-foreground'>
              {isExpired ? (
                <span>{offer.commodityName}</span>
              ) : (
                <Link
                  href={detailHref}
                  className='catalog-card-link underline-offset-4 outline-none hover:underline after:absolute after:inset-0 after:content-[""]'
                >
                  {offer.commodityName}
                </Link>
              )}
            </h3>

            <p className='flex min-w-0 items-center gap-1.5 text-sm font-medium text-foreground'>
              <MapPin className='size-4 shrink-0 text-muted-foreground' aria-hidden='true' />
              <span className='truncate'>{offer.pickupAddressArea}</span>
              {distanceLabel && (
                <span className='shrink-0 font-normal text-muted-foreground tabular-nums'>
                  ({distanceLabel})
                </span>
              )}
            </p>

            <div className='flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground'>
              <span className='tabular-nums'>Ambil: {nextPickupSlot}</span>
              <Link
                href={farmerHref}
                className='relative z-1 inline-flex items-center gap-1.5 truncate underline-offset-4 hover:text-foreground hover:underline'
              >
                <Sprout className='size-3.5 shrink-0 text-primary' aria-hidden='true' />
                <span className='truncate'>{farmerDisplayName}</span>
              </Link>
            </div>
          </div>

          <div className='flex flex-wrap items-end justify-between gap-2 pt-1'>
            <div>
              {isExpired ? (
                <span className='text-sm font-medium text-destructive'>Batas pesan berakhir</span>
              ) : (
                priceSummary.scheduleHint && (
                  <span className='text-xs text-muted-foreground tabular-nums'>
                    {priceSummary.scheduleHint}
                  </span>
                )
              )}
            </div>

            <div className='flex flex-col items-end text-right'>
              {priceSummary.hasDropped && priceSummary.originalPriceFormatted && (
                <span className='text-xs text-muted-foreground line-through tabular-nums'>
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
            </div>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article
      className={cn(
        '@container relative flex h-full flex-col overflow-hidden rounded-2xl border border-border text-card-foreground shadow-sm transition-shadow',
        isExpired
          ? 'bg-muted/60'
          : 'bg-card has-[a.catalog-card-link:hover]:border-foreground/30 has-[a.catalog-card-link:hover]:shadow-md has-[a.catalog-card-link:focus-visible]:outline-2 has-[a.catalog-card-link:focus-visible]:outline-offset-2 has-[a.catalog-card-link:focus-visible]:outline-ring'
      )}
    >
      {mediaNode}

      <div className='flex flex-1 flex-col justify-between gap-4 p-4'>
        <div className='flex flex-col gap-3'>
          <header className='flex flex-col gap-1'>
            <p className='flex min-w-0 items-center gap-1 text-sm text-muted-foreground'>
              <MapPin className='size-4 shrink-0' aria-hidden='true' />
              <span className='truncate'>{offer.pickupAddressArea}</span>
              {distanceLabel && <span className='shrink-0 tabular-nums'>({distanceLabel})</span>}
            </p>
            <h3 className='line-clamp-2 text-lg leading-snug font-bold text-foreground'>
              {isExpired ? (
                <span>{offer.commodityName}</span>
              ) : (
                <Link
                  href={detailHref}
                  className='catalog-card-link underline-offset-4 outline-none hover:underline after:absolute after:inset-0 after:content-[""]'
                >
                  {offer.commodityName}
                </Link>
              )}
            </h3>
          </header>

          <div className='flex items-end justify-between gap-2'>
            <div className='flex min-w-0 flex-col gap-0.5'>
              <span className='text-sm font-medium text-foreground tabular-nums'>
                Sisa {formatWeightKg(offer.availableStockKg)}
              </span>
              <span className='truncate text-sm text-muted-foreground tabular-nums'>
                Ambil: {nextPickupSlot}
              </span>
              {isExpired && (
                <span className='text-sm font-medium text-destructive'>Batas pesan berakhir</span>
              )}
            </div>

            <div className='flex shrink-0 flex-col items-end text-right'>
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
                <span className='text-sm text-muted-foreground tabular-nums'>
                  {priceSummary.scheduleHint}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-3'>
          <Separator />
          <footer className='flex items-center justify-between gap-2'>
            <Link
              href={farmerHref}
              className='relative z-1 flex min-w-0 items-center gap-2 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline'
            >
              <Sprout className='size-4 shrink-0 text-primary' aria-hidden='true' />
              <span className='truncate'>{farmerDisplayName}</span>
            </Link>

            {shareButtonNode}
          </footer>
        </div>
      </div>
    </article>
  )
}
