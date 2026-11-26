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
  getCommodityConditionMeta,
  type OfferCountdownState,
} from '@/components/home/offer-card-helpers'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getCategoryMeta, normalizeCategorySlug } from '@/lib/data/categories'
import { formatHarvestAgeLabel } from '@/lib/data/offer-detail-helpers'
import { cn } from '@/lib/utils'
import type { CommodityCondition, Offer } from '@/types/api/offers'

const conditionIcons: Record<CommodityCondition, LucideIcon> = {
  ripe_urgent: Flame,
  grade_b: Scale,
  surplus: Layers,
  imperfect_shape: Shapes,
}

interface OfferDetailHeaderProps {
  offer: Offer
  nowMs: number | null
  distanceLabel: string | null
  countdown: OfferCountdownState | null
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
  isUnavailable,
  isFavorite,
  shareState,
  onToggleFavorite,
  onShare,
}: OfferDetailHeaderProps) {
  const conditionMeta = getCommodityConditionMeta(offer.condition)
  const ConditionIcon = conditionIcons[offer.condition]
  const farmerDisplayName = formatFarmerDisplayName(offer.farmerName)
  const categorySlug = normalizeCategorySlug(offer.category)
  const categoryMeta = categorySlug ? getCategoryMeta(categorySlug) : null

  return (
    <div className='flex flex-col gap-4'>
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

      <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
        <div className='flex min-w-0 flex-1 flex-col gap-2.5'>
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

          <h1 className='text-[clamp(1.625rem,1.25rem+1.4vw,2.375rem)] leading-tight font-bold text-foreground'>
            {offer.commodityName}
          </h1>

          <div className='flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground'>
            <span className='inline-flex items-center gap-1.5 font-medium text-foreground'>
              <MapPin className='size-4 shrink-0 text-primary' aria-hidden='true' />
              <span>{offer.pickupAddressArea}</span>
              {distanceLabel && (
                <span className='font-normal text-muted-foreground tabular-nums'>
                  ({distanceLabel})
                </span>
              )}
            </span>

            <span className='inline-flex items-center gap-1.5'>
              <Sprout className='size-4 shrink-0 text-primary' aria-hidden='true' />
              <span>{farmerDisplayName}</span>
            </span>

            <span className='tabular-nums'>{formatHarvestAgeLabel(offer.harvestDate, nowMs)}</span>
          </div>
        </div>

        <div className='flex shrink-0 flex-wrap items-center gap-2'>
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
    </div>
  )
}
