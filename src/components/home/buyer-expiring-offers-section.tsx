'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { useSelectedLocation } from '@/components/providers/location-provider'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'
import { Skeleton } from '@/components/ui/skeleton'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useExpiringOffers } from '@/hooks/api/use-offers'
import type { Offer } from '@/types/api/offers'
import { BuyerExpiringOfferCard, type ShareButtonState } from './buyer-expiring-offer-card'
import {
  buildExpiringCatalogHref,
  buildOfferDetailHref,
  calculateStraightLineDistanceKm,
  getLocationCoordinates,
  getOfferCountdownState,
} from './offer-card-helpers'

type ExpiringQuickFilter = 'semua' | 'under-3h' | 'dynamic' | 'sayuran' | 'buah'

const quickFilterOptions: ReadonlyArray<{ value: ExpiringQuickFilter; label: string }> = [
  { value: 'semua', label: 'Semua' },
  { value: 'under-3h', label: 'Kurang dari 3 jam' },
  { value: 'dynamic', label: 'Harga turun terjadwal' },
  { value: 'sayuran', label: 'Sayuran' },
  { value: 'buah', label: 'Buah' },
]

const THREE_HOURS_MS = 3 * 60 * 60 * 1000

function isExpiringFilter(value: string | undefined): value is ExpiringQuickFilter {
  return (
    value === 'semua' ||
    value === 'under-3h' ||
    value === 'dynamic' ||
    value === 'sayuran' ||
    value === 'buah'
  )
}

function OfferCardSkeleton() {
  return (
    <div className='flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm'>
      <div className='flex flex-col gap-4'>
        <div className='flex items-start justify-between gap-3'>
          <div className='flex flex-1 flex-col gap-2'>
            <Skeleton className='h-4 w-36' />
            <Skeleton className='h-6 w-48' />
          </div>
          <Skeleton className='h-7 w-24 rounded-lg' />
        </div>
        <div className='flex items-end justify-between gap-3'>
          <div className='flex flex-col gap-2'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-4 w-28' />
          </div>
          <div className='flex flex-col items-end gap-1.5'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-6 w-28' />
          </div>
        </div>
      </div>
      <div className='mt-4 flex items-center justify-between border-t border-border pt-3.5'>
        <Skeleton className='h-4 w-40' />
        <Skeleton className='size-8 rounded-lg' />
      </div>
    </div>
  )
}

export function BuyerExpiringOffersSection() {
  const { selectedLocation } = useSelectedLocation()
  const { data: offers, isPending, isError, refetch } = useExpiringOffers()

  const [activeFilter, setActiveFilter] = useState<ExpiringQuickFilter>('semua')
  const [nowMs, setNowMs] = useState<number | null>(null)
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [shareStates, setShareStates] = useState<Record<string, ShareButtonState>>({})
  const [liveAnnouncement, setLiveAnnouncement] = useState('')

  const shareTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const lastAnnouncementRef = useRef('')
  const expiredIdsRef = useRef<Set<string>>(new Set())
  const hasInteractedCarouselRef = useRef(false)

  const announcePolite = useCallback((message: string) => {
    const nextMessage = message === lastAnnouncementRef.current ? `${message}\u00A0` : message
    lastAnnouncementRef.current = nextMessage
    setLiveAnnouncement(nextMessage)
  }, [])

  useEffect(() => {
    const updateNow = () => setNowMs(Date.now())
    updateNow()
    const intervalId = setInterval(updateNow, 1000)
    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const timers = shareTimersRef.current
    return () => {
      timers.forEach((timerId) => clearTimeout(timerId))
      timers.clear()
    }
  }, [])

  const referenceCoordinates = useMemo(
    () => getLocationCoordinates(selectedLocation),
    [selectedLocation]
  )

  const filteredOffers = useMemo(() => {
    const items = offers ?? []
    return items.filter((offer) => {
      if (activeFilter === 'semua') return true
      if (activeFilter === 'dynamic') return Boolean(offer.dynamicPriceRule)
      if (activeFilter === 'sayuran') return offer.category.toLowerCase() === 'sayuran'
      if (activeFilter === 'buah') return offer.category.toLowerCase() === 'buah'
      if (activeFilter === 'under-3h') {
        if (nowMs === null) return true
        const state = getOfferCountdownState(offer.orderDeadline, nowMs)
        return !state.isExpired && state.remainingMs <= THREE_HOURS_MS
      }
      return true
    })
  }, [offers, activeFilter, nowMs])

  useEffect(() => {
    if (nowMs === null || !offers) return
    for (const offer of offers) {
      const state = getOfferCountdownState(offer.orderDeadline, nowMs)
      if (state.isExpired && !expiredIdsRef.current.has(offer.id)) {
        expiredIdsRef.current.add(offer.id)
        announcePolite(`Batas pemesanan untuk ${offer.commodityName} telah berakhir.`)
      }
    }
  }, [offers, nowMs, announcePolite])

  useEffect(() => {
    if (!carouselApi) return
    const handleSettle = () => {
      if (!hasInteractedCarouselRef.current) {
        hasInteractedCarouselRef.current = true
        return
      }
      const currentSlide = carouselApi.selectedScrollSnap() + 1
      const totalSlides = carouselApi.scrollSnapList().length
      if (totalSlides > 0) {
        announcePolite(`Menampilkan penawaran ${currentSlide} dari ${totalSlides}.`)
      }
    }
    carouselApi.on('settle', handleSettle)
    return () => {
      carouselApi.off('settle', handleSettle)
    }
  }, [carouselApi, announcePolite])

  function handleFilterChange(nextValues: string[]) {
    const next = nextValues[0]
    if (isExpiringFilter(next)) {
      setActiveFilter(next)
      hasInteractedCarouselRef.current = false
      carouselApi?.scrollTo(0)
    }
  }

  function handleResetFilter() {
    setActiveFilter('semua')
    hasInteractedCarouselRef.current = false
    carouselApi?.scrollTo(0)
  }

  const handleShareOffer = useCallback(
    async (offer: Offer) => {
      const detailPath = buildOfferDetailHref(offer.id)
      const shareUrl =
        typeof window !== 'undefined' ? `${window.location.origin}${detailPath}` : detailPath

      const existingTimer = shareTimersRef.current.get(offer.id)
      if (existingTimer) {
        clearTimeout(existingTimer)
      }

      try {
        if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
          throw new Error('Clipboard unavailable')
        }
        await navigator.clipboard.writeText(shareUrl)
        setShareStates((prev) => ({ ...prev, [offer.id]: 'copied' }))
        announcePolite(`Tautan ${offer.commodityName} disalin.`)
      } catch {
        setShareStates((prev) => ({ ...prev, [offer.id]: 'failed' }))
        announcePolite(`Gagal menyalin tautan ${offer.commodityName}.`)
      }

      const timerId = setTimeout(() => {
        setShareStates((prev) => ({ ...prev, [offer.id]: 'idle' }))
        shareTimersRef.current.delete(offer.id)
      }, 2200)
      shareTimersRef.current.set(offer.id, timerId)
    },
    [announcePolite]
  )

  const allExpiringHref = buildExpiringCatalogHref(selectedLocation)

  return (
    <section className='w-full bg-primary/8 text-foreground'>
      <div className='mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-9 sm:px-6 sm:py-11 lg:px-8'>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
            <div className='flex flex-col gap-1.5'>
              <h2 id='expiring-offers-heading' className='type-h2 text-foreground'>
                Penawaran segera ditutup hari ini
              </h2>
              <p className='max-w-[62ch] text-base leading-relaxed text-muted-foreground'>
                Urutan dari batas pesan terdekat, dengan jarak garis lurus dari{' '}
                {selectedLocation.label}.
              </p>
            </div>

            <Link
              href={allExpiringHref}
              className='inline-flex min-h-10 w-fit items-center rounded-md px-2 py-1.5 text-base font-semibold text-primary transition-opacity pointer-coarse:min-h-11 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
            >
              Lihat semua penawaran
            </Link>
          </div>

          <ToggleGroup
            variant='default'
            spacing={2}
            value={[activeFilter]}
            onValueChange={handleFilterChange}
            aria-label='Saring penawaran segera ditutup'
            className='flex max-w-full flex-wrap items-center gap-2'
          >
            {quickFilterOptions.map((option) => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                className='chip-toggle px-4 py-2'
              >
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <p role='status' aria-live='polite' className='sr-only'>
          {liveAnnouncement}
        </p>

        {isPending ? (
          <div
            role='status'
            aria-label='Memuat daftar penawaran segera ditutup'
            className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
          >
            <OfferCardSkeleton />
            <OfferCardSkeleton />
            <OfferCardSkeleton />
          </div>
        ) : isError ? (
          <Alert className='border-border bg-card text-card-foreground'>
            <AlertCircle aria-hidden='true' />
            <AlertTitle>Gagal memuat penawaran</AlertTitle>
            <AlertDescription className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <span>Periksa koneksi internet Anda lalu muat ulang.</span>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => refetch()}
                className='w-fit'
              >
                <RefreshCw data-icon='inline-start' aria-hidden='true' />
                Muat ulang
              </Button>
            </AlertDescription>
          </Alert>
        ) : filteredOffers.length === 0 ? (
          <div className='flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm sm:flex-row sm:items-center'>
            <div className='flex flex-col gap-1'>
              <h3 className='text-lg leading-snug font-semibold text-foreground'>
                Belum ada penawaran yang cocok dengan filter ini
              </h3>
              <p className='max-w-[60ch] text-base leading-relaxed text-muted-foreground'>
                Reset filter untuk melihat semua penawaran, atau pasang permintaan di Papan
                Kebutuhan Pangan.
              </p>
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              {activeFilter !== 'semua' && (
                <Button type='button' variant='default' size='sm' onClick={handleResetFilter}>
                  Reset filter
                </Button>
              )}
              <Button
                variant='outline'
                size='sm'
                nativeButton={false}
                render={<Link href='/papan-kebutuhan' />}
              >
                Pasang kebutuhan pangan
              </Button>
            </div>
          </div>
        ) : (
          <Carousel
            opts={{ align: 'start', containScroll: 'trimSnaps' }}
            setApi={setCarouselApi}
            aria-labelledby='expiring-offers-heading'
            className='w-full'
          >
            <CarouselPrevious
              variant='outline'
              className='left-2 z-20 border-border bg-card text-foreground shadow-md hover:bg-muted disabled:pointer-events-none disabled:opacity-0 xl:-left-5'
            />
            <CarouselNext
              variant='outline'
              className='right-2 z-20 border-border bg-card text-foreground shadow-md hover:bg-muted disabled:pointer-events-none disabled:opacity-0 xl:-right-5'
            />

            <CarouselContent className='py-2'>
              {filteredOffers.map((offer, index) => {
                const offerCoordinates =
                  typeof offer.latitude === 'number' && typeof offer.longitude === 'number'
                    ? { lat: offer.latitude, lng: offer.longitude }
                    : null
                const distanceKm =
                  referenceCoordinates && offerCoordinates
                    ? calculateStraightLineDistanceKm(referenceCoordinates, offerCoordinates)
                    : null

                return (
                  <CarouselItem
                    key={offer.id}
                    aria-label={`${index + 1} dari ${filteredOffers.length}`}
                    className='basis-[88%] sm:basis-[47%] lg:basis-[31.5%]'
                  >
                    <BuyerExpiringOfferCard
                      offer={offer}
                      nowMs={nowMs}
                      distanceKm={distanceKm}
                      shareState={shareStates[offer.id] ?? 'idle'}
                      onShare={handleShareOffer}
                    />
                  </CarouselItem>
                )
              })}
            </CarouselContent>
          </Carousel>
        )}

        <p className='max-w-[72ch] text-sm leading-relaxed text-muted-foreground'>
          Semua harga berlaku per kilogram dengan ambil mandiri. Petani membuka alamat lengkap
          setelah pesanan terkonfirmasi, dan harga dinamis turun mengikuti jadwal yang petani atur.
        </p>
      </div>
    </section>
  )
}
