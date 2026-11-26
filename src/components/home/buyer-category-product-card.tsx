'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Flame, Layers, MapPin, Scale, Shapes, Sprout, type LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { CommodityCondition, Offer } from '@/types/api/offers'
import {
  buildOfferDetailHref,
  formatFarmerDisplayName,
  formatNextPickupSlot,
  formatPricePerKg,
  formatStraightLineDistance,
  formatWeightKg,
  getCommodityConditionMeta,
  getDynamicPriceSummary,
  getSafeOfferPhotoUrl,
} from './offer-card-helpers'

const conditionIcons: Record<CommodityCondition, LucideIcon> = {
  ripe_urgent: Flame,
  grade_b: Scale,
  surplus: Layers,
  imperfect_shape: Shapes,
}

const conditionBadgeVariants: Record<
  CommodityCondition,
  'destructive' | 'secondary' | 'outline' | 'default'
> = {
  ripe_urgent: 'destructive',
  grade_b: 'secondary',
  surplus: 'secondary',
  imperfect_shape: 'outline',
}

interface BuyerCategoryProductCardProps {
  offer: Offer
  distanceKm: number | null
}

export function BuyerCategoryProductCard({ offer, distanceKm }: BuyerCategoryProductCardProps) {
  const photoUrl = getSafeOfferPhotoUrl(offer.photos)
  const conditionMeta = getCommodityConditionMeta(offer.condition)
  const ConditionIcon = conditionIcons[offer.condition]
  const conditionVariant = conditionBadgeVariants[offer.condition]
  const priceSummary = getDynamicPriceSummary(offer.pricePerKg, offer.dynamicPriceRule)
  const farmerDisplayName = formatFarmerDisplayName(offer.farmerName)
  const nextPickupSlot = formatNextPickupSlot(offer.pickupScheduleSlots)
  const detailHref = buildOfferDetailHref(offer.id)
  const distanceLabel = distanceKm === null ? null : formatStraightLineDistance(distanceKm)

  return (
    <article className='@container relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm transition-shadow has-[a.category-card-link:hover]:shadow-md has-[a.category-card-link:focus-visible]:outline-2 has-[a.category-card-link:focus-visible]:outline-offset-2 has-[a.category-card-link:focus-visible]:outline-ring'>
      {photoUrl ? (
        <Image
          src={photoUrl}
          alt={`${offer.commodityName} dari ${offer.pickupAddressArea}`}
          width={640}
          height={480}
          sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
          className='aspect-4/3 w-full bg-muted object-cover'
        />
      ) : (
        <div
          aria-hidden='true'
          className='flex aspect-4/3 w-full items-center justify-center bg-muted text-muted-foreground'
        >
          <Sprout className='size-8' />
        </div>
      )}

      <div className='flex flex-1 flex-col justify-between gap-4 p-4'>
        <div className='flex flex-col gap-3'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <Badge variant={conditionVariant} className='rounded-lg px-2.5 py-0.5 text-sm'>
              <ConditionIcon data-icon='inline-start' aria-hidden='true' />
              <span>{conditionMeta.shortLabel}</span>
            </Badge>
            <span className='text-sm font-medium text-muted-foreground tabular-nums'>
              Sisa {formatWeightKg(offer.availableStockKg)}
            </span>
          </div>

          <header className='flex flex-col gap-1'>
            <p className='flex min-w-0 items-center gap-1 text-sm text-muted-foreground'>
              <MapPin className='size-4 shrink-0' aria-hidden='true' />
              <span className='truncate'>{offer.pickupAddressArea}</span>
              {distanceLabel && <span className='shrink-0 tabular-nums'>({distanceLabel})</span>}
            </p>
            <h3 className='line-clamp-2 text-lg leading-snug font-bold text-foreground'>
              <Link
                href={detailHref}
                className='category-card-link outline-none after:absolute after:inset-0 after:content-[""]'
              >
                {offer.commodityName}
              </Link>
            </h3>
          </header>

          <div className='flex items-end justify-between gap-2 pt-0.5'>
            <div className='flex min-w-0 flex-col gap-0.5'>
              <span className='text-sm text-muted-foreground'>Ambil mandiri</span>
              <span className='truncate text-sm font-medium text-foreground tabular-nums'>
                {nextPickupSlot}
              </span>
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
          <footer className='flex items-center gap-2 text-sm text-muted-foreground'>
            <Sprout className='size-4 shrink-0 text-primary' aria-hidden='true' />
            <span className='truncate'>{farmerDisplayName}</span>
          </footer>
        </div>
      </div>
    </article>
  )
}
