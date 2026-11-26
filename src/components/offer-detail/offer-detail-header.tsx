'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  Check,
  ChevronRight,
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
  formatFarmerDisplayName,
  formatPricePerKg,
  formatWeightKg,
  getCommodityConditionMeta,
  type DynamicPriceSummary,
  type OfferCountdownState,
} from '@/components/home/offer-card-helpers'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getCategoryMeta, normalizeCategorySlug } from '@/lib/data/categories'
import { buildFarmerStoreHref } from '@/lib/data/farmer-store-helpers'
import { formatHarvestAgeLabel } from '@/lib/data/offer-detail-helpers'
import { cn } from '@/lib/utils'
import type { CommodityCondition, Offer } from '@/types/api/offers'

const conditionIcons: Record<CommodityCondition, LucideIcon> = {
  ripe_urgent: Flame,
  grade_b: Scale,
  surplus: Layers,
  imperfect_shape: Shapes,
}

interface OfferDetailBreadcrumbProps {
  offer: Offer
}

export function OfferDetailBreadcrumb({ offer }: OfferDetailBreadcrumbProps) {
  const categorySlug = normalizeCategorySlug(offer.category)
  const categoryMeta = categorySlug ? getCategoryMeta(categorySlug) : null

  return (
    <div className='flex flex-wrap items-center justify-between gap-2'>
      <nav aria-label='Breadcrumb'>
        <ol className='flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground'>
          <li>
            <Link
              href='/'
              className='rounded-sm py-1 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
            >
              Beranda
            </Link>
          </li>
          <li aria-hidden='true' className='flex items-center'>
            <ChevronRight className='size-4' />
          </li>
          <li>
            <Link
              href='/pasar'
              className='rounded-sm py-1 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
            >
              Pasar
            </Link>
          </li>
          {categoryMeta && (
            <>
              <li aria-hidden='true' className='flex items-center'>
                <ChevronRight className='size-4' />
              </li>
              <li>
                <Link
                  href={categoryMeta.href}
                  className='rounded-sm py-1 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
                >
                  {categoryMeta.label}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden='true' className='flex items-center'>
            <ChevronRight className='size-4' />
          </li>
          <li>
            <span aria-current='page' className='font-medium text-foreground'>
              {offer.commodityName}
            </span>
          </li>
        </ol>
      </nav>

      <Link
        href='/pasar'
        className='inline-flex min-h-10 items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
      >
        <ArrowLeft className='size-4' aria-hidden='true' />
        <span>Kembali ke katalog</span>
      </Link>
    </div>
  )
}

interface OfferDetailHeaderProps {
  offer: Offer
  nowMs: number | null
  distanceLabel: string | null
  countdown: OfferCountdownState | null
  priceSummary: DynamicPriceSummary
  isUnavailable: boolean
  isFavorite: boolean
  shareState: ShareButtonState
  onToggleFavorite: (offer: Offer) => void
  onShare: (offer: Offer) => void
}

export function OfferDetailHeader({
  offer,
  nowMs,
  distanceLabel,
  countdown,
  priceSummary,
  isUnavailable,
  isFavorite,
  shareState,
  onToggleFavorite,
  onShare,
}: OfferDetailHeaderProps) {
  const conditionMeta = getCommodityConditionMeta(offer.condition)
  const ConditionIcon = conditionIcons[offer.condition]
  const farmerDisplayName = formatFarmerDisplayName(offer.farmerName)
  const surplusReason = offer.surplusReason?.trim()

  return (
    <div className='flex min-w-0 flex-col gap-4'>
      <div className='flex flex-wrap items-center gap-2'>
        <Badge
          variant='outline'
          className={cn(
            'border-border bg-background',
            offer.condition === 'ripe_urgent'
              ? 'border-destructive/40 text-destructive'
              : 'text-foreground'
          )}
        >
          <ConditionIcon data-icon='inline-start' aria-hidden='true' />
          <span>{conditionMeta.shortLabel}</span>
        </Badge>

        {isUnavailable ? (
          <Badge variant='outline' className='border-border bg-muted text-foreground'>
            <Lock data-icon='inline-start' aria-hidden='true' />
            <span>{offer.availableStockKg <= 0 ? 'Stok habis' : 'Ditutup'}</span>
          </Badge>
        ) : (
          countdown && (
            <Badge variant={countdown.urgency === 'critical' ? 'destructive' : 'secondary'}>
              <Clock data-icon='inline-start' aria-hidden='true' />
              <time dateTime={offer.orderDeadline} className='tabular-nums'>
                {countdown.label}
              </time>
            </Badge>
          )
        )}
      </div>

      <div className='flex flex-col gap-2'>
        <h1 className='text-[clamp(1.5rem,1.2rem+1.1vw,2rem)] leading-tight font-bold text-foreground'>
          {offer.commodityName}
        </h1>

        <div className='flex flex-wrap items-baseline gap-x-3 gap-y-1'>
          <p
            className={cn(
              'text-2xl leading-tight font-bold tabular-nums',
              priceSummary.hasDropped ? 'text-destructive' : 'text-primary'
            )}
          >
            {formatPricePerKg(offer.pricePerKg)}
          </p>
          {priceSummary.hasDropped && priceSummary.originalPriceFormatted && (
            <span className='text-sm text-muted-foreground line-through tabular-nums'>
              {priceSummary.originalPriceFormatted}/kg
            </span>
          )}
          {priceSummary.scheduleHint && (
            <span className='text-xs font-medium text-muted-foreground'>
              {priceSummary.scheduleHint}
            </span>
          )}
        </div>
      </div>

      {surplusReason && (
        <p className='max-w-[60ch] text-sm leading-relaxed text-muted-foreground'>
          {surplusReason}
        </p>
      )}

      <dl className='grid grid-cols-1 gap-2.5 text-sm sm:grid-cols-2'>
        <div className='flex items-start gap-2 text-foreground'>
          <MapPin className='mt-0.5 size-4 shrink-0 text-primary' aria-hidden='true' />
          <div className='min-w-0'>
            <dt className='sr-only'>Lokasi ambil</dt>
            <dd className='font-medium'>
              {offer.pickupAddressArea}
              {distanceLabel && (
                <span className='font-normal text-muted-foreground tabular-nums'>
                  {' '}
                  ({distanceLabel})
                </span>
              )}
            </dd>
          </div>
        </div>

        <div className='flex items-start gap-2 text-foreground'>
          <Sprout className='mt-0.5 size-4 shrink-0 text-primary' aria-hidden='true' />
          <div className='min-w-0'>
            <dt className='sr-only'>Petani</dt>
            <dd className='truncate'>
              <Link
                href={buildFarmerStoreHref(offer.farmerId)}
                className='rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
              >
                {farmerDisplayName}
              </Link>
            </dd>
          </div>
        </div>

        <div className='flex items-start gap-2 text-muted-foreground'>
          <Scale className='mt-0.5 size-4 shrink-0 text-primary' aria-hidden='true' />
          <div className='min-w-0'>
            <dt className='sr-only'>Stok tersedia</dt>
            <dd className='tabular-nums'>Tersedia {formatWeightKg(offer.availableStockKg)}</dd>
          </div>
        </div>

        <div className='flex items-start gap-2 text-muted-foreground'>
          <Clock className='mt-0.5 size-4 shrink-0 text-primary' aria-hidden='true' />
          <div className='min-w-0'>
            <dt className='sr-only'>Waktu panen</dt>
            <dd className='tabular-nums'>{formatHarvestAgeLabel(offer.harvestDate, nowMs)}</dd>
          </div>
        </div>
      </dl>

      <div className='flex flex-wrap items-center gap-2 pt-1'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          aria-pressed={isFavorite}
          onClick={() => onToggleFavorite(offer)}
          className='rounded-full'
        >
          <Heart
            data-icon='inline-start'
            aria-hidden='true'
            className={cn(isFavorite && 'fill-destructive text-destructive')}
          />
          <span>{isFavorite ? 'Tersimpan' : 'Simpan'}</span>
        </Button>

        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => onShare(offer)}
          className='rounded-full'
        >
          {shareState === 'copied' ? (
            <Check data-icon='inline-start' aria-hidden='true' className='text-primary' />
          ) : (
            <Share2 data-icon='inline-start' aria-hidden='true' />
          )}
          <span>
            {shareState === 'copied'
              ? 'Tautan disalin'
              : shareState === 'failed'
                ? 'Gagal menyalin'
                : 'Bagikan'}
          </span>
        </Button>
      </div>
    </div>
  )
}
