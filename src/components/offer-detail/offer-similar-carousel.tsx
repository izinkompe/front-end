'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { CatalogOfferCard } from '@/components/catalog/catalog-offer-card'
import type { ShareButtonState } from '@/components/home/buyer-expiring-offer-card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'
import type { RelatedOfferItem } from '@/lib/data/offer-detail-helpers'
import type { Offer } from '@/types/api/offers'

interface OfferSimilarCarouselProps {
  items: ReadonlyArray<RelatedOfferItem>
  nowMs: number | null
  favoriteIds: ReadonlySet<string>
  shareStates: Record<string, ShareButtonState>
  onToggleFavorite: (offer: Offer) => void
  onShare: (offer: Offer) => void
  isCurrentUnavailable?: boolean
}

export function OfferSimilarCarousel({
  items,
  nowMs,
  favoriteIds,
  shareStates,
  onToggleFavorite,
  onShare,
  isCurrentUnavailable = false,
}: OfferSimilarCarouselProps) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [liveAnnouncement, setLiveAnnouncement] = useState('')
  const hasInteractedRef = useRef(false)
  const lastAnnouncementRef = useRef('')

  const announcePolite = useCallback((message: string) => {
    const nextMessage = message === lastAnnouncementRef.current ? `${message}\u00A0` : message
    lastAnnouncementRef.current = nextMessage
    setLiveAnnouncement(nextMessage)
  }, [])

  useEffect(() => {
    if (!carouselApi) return
    const handleSettle = () => {
      if (!hasInteractedRef.current) {
        hasInteractedRef.current = true
        return
      }
      const currentSlide = carouselApi.selectedScrollSnap() + 1
      const totalSlides = carouselApi.scrollSnapList().length
      if (totalSlides > 0) {
        announcePolite(`Menampilkan penawaran sejenis ${currentSlide} dari ${totalSlides}.`)
      }
    }
    carouselApi.on('settle', handleSettle)
    return () => {
      carouselApi.off('settle', handleSettle)
    }
  }, [carouselApi, announcePolite])

  if (items.length === 0) return null

  return (
    <section aria-labelledby='similar-offers-heading' className='flex flex-col gap-5'>
      <div className='flex flex-wrap items-baseline justify-between gap-2'>
        <h2
          id='similar-offers-heading'
          className='text-xl leading-snug font-bold text-foreground sm:text-2xl'
        >
          {isCurrentUnavailable ? 'Alternatif komoditas sejenis' : 'Komoditas sejenis lainnya'}
        </h2>

        <Link
          href='/pasar'
          className='inline-flex min-h-10 items-center rounded-md px-2 py-1 text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
        >
          Jelajahi katalog
        </Link>
      </div>

      <p role='status' aria-live='polite' className='sr-only'>
        {liveAnnouncement}
      </p>

      <Carousel
        opts={{ align: 'start', containScroll: 'trimSnaps' }}
        setApi={setCarouselApi}
        aria-labelledby='similar-offers-heading'
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

        <CarouselContent className='py-1'>
          {items.map(({ offer, distanceKm }, index) => (
            <CarouselItem
              key={offer.id}
              aria-label={`${index + 1} dari ${items.length}`}
              className='basis-[85%] sm:basis-[47%] lg:basis-[31.5%] xl:basis-[24.25%]'
            >
              <CatalogOfferCard
                offer={offer}
                distanceKm={distanceKm}
                nowMs={nowMs}
                priorityImage={false}
                isFavorite={favoriteIds.has(offer.id)}
                shareState={shareStates[offer.id] ?? 'idle'}
                layout='grid'
                onToggleFavorite={onToggleFavorite}
                onShare={onShare}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  )
}
