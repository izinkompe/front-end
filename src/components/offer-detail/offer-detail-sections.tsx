'use client'

import type { MouseEvent } from 'react'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  Flame,
  Layers,
  Scale,
  Shapes,
  Sprout,
  type LucideIcon,
} from 'lucide-react'
import {
  formatPlainRupiah,
  formatWeightKg,
  getCommodityConditionMeta,
} from '@/components/home/offer-card-helpers'
import { Button } from '@/components/ui/button'
import {
  formatDateTimeId,
  formatPickupSlotLabel,
  getDynamicPriceScheduleSteps,
} from '@/lib/data/offer-detail-helpers'
import { buildFarmerStoreHref } from '@/lib/data/farmer-store-helpers'
import { getOfferPriceSchedule } from '@/lib/data/offer-price-schedule'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { CommodityCondition, Offer } from '@/types/api/offers'
import { OfferAreaMap } from './offer-area-map'

const conditionIcons: Record<CommodityCondition, LucideIcon> = {
  ripe_urgent: Flame,
  grade_b: Scale,
  surplus: Layers,
  imperfect_shape: Shapes,
}

export interface SectionAnchorItem {
  id: string
  label: string
}

interface OfferDetailSectionsProps {
  offer: Offer
  nowMs: number | null
  locationLabel: string
  distanceLabel: string | null
  sectionAnchors: ReadonlyArray<SectionAnchorItem>
  activeSectionId: string
  onSelectSection: (id: string) => void
}

export function OfferDetailSections({
  offer,
  nowMs,
  locationLabel,
  distanceLabel,
  sectionAnchors,
  activeSectionId,
  onSelectSection,
}: OfferDetailSectionsProps) {
  const conditionMeta = getCommodityConditionMeta(offer.condition)
  const ConditionIcon = conditionIcons[offer.condition]
  const nextDropAt = nowMs === null ? null : getOfferPriceSchedule(offer, nowMs).nextDropAt
  const minutesToDrop =
    nowMs !== null && nextDropAt !== null ? Math.ceil((nextDropAt - nowMs) / 60_000) : null
  const dynamicStages = getDynamicPriceScheduleSteps(offer.pricePerKg, offer.dynamicPriceRule)

  const surplusText =
    offer.surplusReason?.trim() ||
    `${conditionMeta.label}. Siap diambil mandiri langsung dari kebun di ${offer.pickupAddressArea}.`
  const isLongSurplusText = surplusText.length > 160

  function handleSectionClick(event: MouseEvent<HTMLAnchorElement>, sectionId: string) {
    event.preventDefault()
    onSelectSection(sectionId)
    const target = document.getElementById(sectionId)
    if (!target) return
    const prefersReducedMotion =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    })
    target.focus({ preventScroll: true })
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${sectionId}`)
    }
  }

  return (
    <div className='flex min-w-0 flex-col gap-10'>
      <nav
        aria-label='Bagian halaman detail komoditas'
        className='offer-scrollspy-nav scroll-strip sticky top-16 z-20 -mx-4 border-b border-border/80 bg-background/95 px-4 py-2.5 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0'
      >
        {sectionAnchors.map((anchor) => {
          const isActive = activeSectionId === anchor.id
          return (
            <a
              key={anchor.id}
              href={`#${anchor.id}`}
              aria-current={isActive ? 'true' : 'false'}
              onClick={(event) => handleSectionClick(event, anchor.id)}
              className={cn(
                'inline-flex min-h-10 shrink-0 items-center rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors pointer-coarse:min-h-11 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                isActive
                  ? 'target-current bg-secondary font-semibold text-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {anchor.label}
            </a>
          )
        })}
      </nav>

      <section
        id='ringkasan'
        tabIndex={-1}
        className='flex scroll-mt-32 flex-col gap-5 outline-none'
      >
        <h2 className='type-h2 text-foreground'>Kondisi dan ringkasan panen</h2>

        {isLongSurplusText ? (
          <details className='group max-w-[65ch]'>
            <summary className='cursor-pointer text-base leading-relaxed font-medium text-foreground underline underline-offset-4'>
              Lihat penjelasan kondisi panen lengkap
            </summary>
            <p className='mt-2 text-base leading-relaxed text-muted-foreground'>{surplusText}</p>
          </details>
        ) : (
          <p className='max-w-[65ch] text-base leading-relaxed text-foreground'>{surplusText}</p>
        )}

        <dl className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div className='flex items-start gap-3 rounded-xl bg-muted/45 p-4'>
            <ConditionIcon className='mt-0.5 size-5 shrink-0 text-primary' aria-hidden='true' />
            <div className='flex flex-col gap-0.5'>
              <dt className='text-sm text-muted-foreground'>Kondisi fisik</dt>
              <dd className='text-base font-medium text-foreground'>{conditionMeta.label}</dd>
            </div>
          </div>

          <div className='flex items-start gap-3 rounded-xl bg-muted/45 p-4'>
            <Calendar className='mt-0.5 size-5 shrink-0 text-primary' aria-hidden='true' />
            <div className='flex flex-col gap-0.5'>
              <dt className='text-sm text-muted-foreground'>Waktu panen</dt>
              <dd className='text-base font-medium text-foreground tabular-nums'>
                {formatDateTimeId(offer.harvestDate)}
              </dd>
            </div>
          </div>

          <div className='flex items-start gap-3 rounded-xl bg-muted/45 p-4'>
            <Scale className='mt-0.5 size-5 shrink-0 text-primary' aria-hidden='true' />
            <div className='flex flex-col gap-0.5'>
              <dt className='text-sm text-muted-foreground'>Status stok</dt>
              <dd className='text-base font-medium text-foreground tabular-nums'>
                Tersedia {formatWeightKg(offer.availableStockKg)}, direservasi{' '}
                {formatWeightKg(offer.reservedStockKg)}, terjual {formatWeightKg(offer.soldStockKg)}
              </dd>
            </div>
          </div>

          <div className='flex items-start gap-3 rounded-xl bg-muted/45 p-4'>
            <Clock className='mt-0.5 size-5 shrink-0 text-primary' aria-hidden='true' />
            <div className='flex flex-col gap-0.5'>
              <dt className='text-sm text-muted-foreground'>Batas pemesanan</dt>
              <dd className='text-base font-medium text-foreground tabular-nums'>
                {formatDateTimeId(offer.orderDeadline)}
              </dd>
            </div>
          </div>
        </dl>
      </section>

      {offer.dynamicPriceRule && (
        <section id='harga' tabIndex={-1} className='flex scroll-mt-32 flex-col gap-4 outline-none'>
          <h2 className='type-h2 text-foreground'>Jadwal harga dinamis</h2>

          <p className='max-w-[65ch] text-base leading-relaxed text-muted-foreground'>
            Harga awal {formatPlainRupiah(offer.dynamicPriceRule.startPrice)}/kg turun{' '}
            {formatPlainRupiah(offer.dynamicPriceRule.dropAmount)} setiap{' '}
            {offer.dynamicPriceRule.dropIntervalHours} jam hingga batas minimal{' '}
            {formatPlainRupiah(offer.dynamicPriceRule.minPrice)}/kg. Harga pesanan dikunci saat
            reservasi dibuat.
          </p>

          {minutesToDrop !== null && (
            <Badge variant='secondary' className='w-fit'>
              Harga turun dalam{' '}
              {minutesToDrop >= 60 ? Math.floor(minutesToDrop / 60) + ' jam ' : ''}
              {minutesToDrop % 60 ? (minutesToDrop % 60) + ' menit' : ''}
            </Badge>
          )}

          <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
            {dynamicStages.map((stage) => (
              <div
                key={stage.stepNumber}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm',
                  stage.status === 'current'
                    ? 'border-primary bg-primary/8 font-semibold text-foreground'
                    : stage.status === 'passed'
                      ? 'border-border bg-muted/35 text-muted-foreground'
                      : 'border-border bg-card text-foreground'
                )}
              >
                <div className='flex flex-col gap-0.5'>
                  <span>
                    {stage.hoursFromStart === 0 ? 'Harga awal' : `+${stage.hoursFromStart} jam`}
                  </span>
                  <span className='text-sm text-muted-foreground'>
                    {stage.status === 'current'
                      ? 'Berlaku sekarang'
                      : stage.status === 'passed'
                        ? 'Sudah lewat'
                        : 'Tahap berikutnya'}
                  </span>
                </div>
                <span
                  className={cn(
                    'text-base font-bold tabular-nums',
                    stage.status === 'passed' && 'line-through'
                  )}
                >
                  {stage.priceFormatted}/kg
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section id='lokasi' tabIndex={-1} className='flex scroll-mt-32 flex-col gap-5 outline-none'>
        <h2 className='type-h2 text-foreground'>Lokasi dan jadwal ambil mandiri</h2>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]'>
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-1.5'>
              <p className='text-base font-semibold text-foreground'>{offer.pickupAddressArea}</p>
              {distanceLabel && (
                <p className='text-sm text-muted-foreground tabular-nums'>
                  Jarak garis lurus dari {locationLabel}: {distanceLabel}
                </p>
              )}
              <p className='text-sm leading-relaxed text-muted-foreground'>
                Alamat lengkap dan patokan titik pengambilan terbuka setelah Anda membuat reservasi.
              </p>
            </div>

            <div className='flex flex-col gap-2'>
              <h3 className='type-h4 text-foreground'>Slot jadwal pengambilan</h3>
              <ul className='flex flex-col gap-2'>
                {offer.pickupScheduleSlots.map((slot) => {
                  const available = slot.isAvailable !== false
                  return (
                    <li
                      key={slot.id}
                      className={cn(
                        'flex items-center justify-between gap-2 rounded-xl border border-border px-3.5 py-2.5 text-sm tabular-nums',
                        available ? 'bg-card text-foreground' : 'bg-muted/50 text-muted-foreground'
                      )}
                    >
                      <span>{formatPickupSlotLabel(slot)}</span>
                      <span
                        className={cn(
                          'text-sm font-medium',
                          available ? 'text-primary' : 'text-muted-foreground'
                        )}
                      >
                        {available ? 'Tersedia' : 'Penuh'}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          <OfferAreaMap
            areaLabel={offer.pickupAddressArea}
            distanceLabel={distanceLabel}
            latitude={offer.latitude}
            longitude={offer.longitude}
          />
        </div>
      </section>

      <section id='petani' tabIndex={-1} className='flex scroll-mt-32 flex-col gap-4 outline-none'>
        <h2 className='type-h2 text-foreground'>Petani pengelola panen</h2>

        <div className='flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-3.5'>
            <span
              aria-hidden='true'
              className='flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'
            >
              <Sprout className='size-6' />
            </span>
            <div className='flex flex-col gap-0.5'>
              <Link
                href={buildFarmerStoreHref(offer.farmerId)}
                className='text-base font-bold text-foreground underline-offset-4 hover:underline'
              >
                {offer.farmerName}
              </Link>
              <p className='text-sm text-muted-foreground'>
                {offer.category}, {offer.pickupAddressArea}
              </p>
            </div>
          </div>

          <Button
            variant='outline'
            size='sm'
            nativeButton={false}
            render={<Link href={buildFarmerStoreHref(offer.farmerId)} />}
          >
            Lihat profil kebun
          </Button>
        </div>
      </section>
    </div>
  )
}
