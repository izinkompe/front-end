'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, Clock, RefreshCw } from 'lucide-react'
import { BuyerAuthDialog } from '@/components/auth/buyer-auth-dialog'
import type { ShareButtonState } from '@/components/home/buyer-expiring-offer-card'
import {
  buildOfferDetailHref,
  calculateStraightLineDistanceKm,
  formatStraightLineDistance,
  getDynamicPriceSummary,
  getLocationCoordinates,
  getOfferCountdownState,
} from '@/components/home/offer-card-helpers'
import { GlobalFooter } from '@/components/layout/global-footer'
import { useSelectedLocation } from '@/components/providers/location-provider'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useCurrentUser } from '@/hooks/api/use-auth'
import { useOfferDetail, useOffers } from '@/hooks/api/use-offers'
import { getRelatedOffers, getSafeOfferPhotoUrls } from '@/lib/data/offer-detail-helpers'
import type { Offer } from '@/types/api/offers'
import type { Order } from '@/types/api/orders'
import { OfferDetailGallery } from './offer-detail-gallery'
import { OfferDetailHeader } from './offer-detail-header'
import { OfferDetailSections } from './offer-detail-sections'
import { OfferDetailSkeleton } from './offer-detail-skeleton'
import { OfferOrderSuccessDialog, OfferReservationForm } from './offer-reservation-form'
import { OfferSimilarCarousel } from './offer-similar-carousel'
import { OfferStickyBars } from './offer-sticky-bars'

interface OfferDetailViewProps {
  offerId: string
}

export function OfferDetailView({ offerId }: OfferDetailViewProps) {
  const { selectedLocation } = useSelectedLocation()
  const { data: currentUser } = useCurrentUser()
  const { data: offer, isPending, isError, error, refetch } = useOfferDetail(offerId)
  const { data: allOffers = [] } = useOffers()

  const [nowMs, setNowMs] = useState<number | null>(null)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set())
  const [shareStates, setShareStates] = useState<Record<string, ShareButtonState>>({})
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [mobileReserveOpen, setMobileReserveOpen] = useState(false)
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null)
  const [showStickySummary, setShowStickySummary] = useState(false)
  const [activeSectionId, setActiveSectionId] = useState('ringkasan')
  const [liveAnnouncement, setLiveAnnouncement] = useState('')

  const headerSentinelRef = useRef<HTMLDivElement | null>(null)
  const shareTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const lastAnnouncementRef = useRef('')

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

  useEffect(() => {
    const sentinel = headerSentinelRef.current
    if (!sentinel || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickySummary(!entry.isIntersecting)
      },
      { threshold: 0 }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [offer?.id])

  const sectionAnchors = useMemo(() => {
    if (!offer) return []
    const items = [{ id: 'ringkasan', label: 'Ringkasan' }]
    if (offer.dynamicPriceRule) {
      items.push({ id: 'harga', label: 'Harga dinamis' })
    }
    items.push({ id: 'lokasi', label: 'Lokasi dan jadwal' })
    items.push({ id: 'petani', label: 'Petani' })
    return items
  }, [offer])

  useEffect(() => {
    if (!offer || typeof IntersectionObserver === 'undefined') return

    const sectionElements = sectionAnchors
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el))

    if (sectionElements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSectionId(entry.target.id)
          }
        }
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
    )

    for (const section of sectionElements) {
      observer.observe(section)
    }
    return () => observer.disconnect()
  }, [offer, sectionAnchors])

  const referenceCoordinates = useMemo(
    () => getLocationCoordinates(selectedLocation),
    [selectedLocation]
  )

  const relatedOffers = useMemo(() => {
    if (!offer) return []
    return getRelatedOffers(offer, allOffers, referenceCoordinates, nowMs, 8)
  }, [allOffers, nowMs, offer, referenceCoordinates])

  const handleToggleFavorite = useCallback(
    (targetOffer: Offer) => {
      if (!currentUser) {
        setAuthDialogOpen(true)
        return
      }
      setFavoriteIds((prev) => {
        const next = new Set(prev)
        if (next.has(targetOffer.id)) {
          next.delete(targetOffer.id)
          announcePolite(`${targetOffer.commodityName} dihapus dari favorit.`)
        } else {
          next.add(targetOffer.id)
          announcePolite(`${targetOffer.commodityName} disimpan ke favorit.`)
        }
        return next
      })
    },
    [announcePolite, currentUser]
  )

  const handleShareOffer = useCallback(
    async (targetOffer: Offer) => {
      const detailPath = buildOfferDetailHref(targetOffer.id)
      const shareUrl =
        typeof window !== 'undefined' ? `${window.location.origin}${detailPath}` : detailPath

      const existingTimer = shareTimersRef.current.get(targetOffer.id)
      if (existingTimer) {
        clearTimeout(existingTimer)
      }

      try {
        if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
          throw new Error('Clipboard unavailable')
        }
        await navigator.clipboard.writeText(shareUrl)
        setShareStates((prev) => ({ ...prev, [targetOffer.id]: 'copied' }))
        announcePolite(`Tautan ${targetOffer.commodityName} disalin.`)
      } catch {
        setShareStates((prev) => ({ ...prev, [targetOffer.id]: 'failed' }))
        announcePolite(`Gagal menyalin tautan ${targetOffer.commodityName}.`)
      }

      const timerId = setTimeout(() => {
        setShareStates((prev) => ({ ...prev, [targetOffer.id]: 'idle' }))
        shareTimersRef.current.delete(targetOffer.id)
      }, 2200)
      shareTimersRef.current.set(targetOffer.id, timerId)
    },
    [announcePolite]
  )

  if (isPending) {
    return (
      <>
        <OfferDetailSkeleton />
        <GlobalFooter />
      </>
    )
  }

  if (isError || !offer) {
    const isNotFound = error && 'status' in error && error.status === 404
    return (
      <>
        <div className='mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-12 sm:px-6 lg:px-8'>
          <Alert className='border-border bg-card text-card-foreground'>
            <AlertCircle aria-hidden='true' />
            <AlertTitle>
              {isNotFound ? 'Penawaran komoditas tidak ditemukan' : 'Gagal memuat detail panen'}
            </AlertTitle>
            <AlertDescription className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <span>
                {isNotFound
                  ? 'Penawaran mungkin sudah ditutup atau tautan tidak valid.'
                  : 'Periksa koneksi internet Anda lalu muat ulang halaman ini.'}
              </span>
              <div className='flex flex-wrap gap-2'>
                {!isNotFound && (
                  <Button type='button' variant='outline' size='sm' onClick={() => refetch()}>
                    <RefreshCw data-icon='inline-start' aria-hidden='true' />
                    Muat ulang
                  </Button>
                )}
                <Button size='sm' nativeButton={false} render={<Link href='/pasar' />}>
                  Kembali ke katalog
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
        <GlobalFooter />
      </>
    )
  }

  const photoUrls = getSafeOfferPhotoUrls(offer.photos)
  const priceSummary = getDynamicPriceSummary(offer.pricePerKg, offer.dynamicPriceRule)

  const offerCoordinates =
    typeof offer.latitude === 'number' && typeof offer.longitude === 'number'
      ? { lat: offer.latitude, lng: offer.longitude }
      : null
  const distanceKm =
    referenceCoordinates && offerCoordinates
      ? calculateStraightLineDistanceKm(referenceCoordinates, offerCoordinates)
      : null
  const distanceLabel = distanceKm === null ? null : formatStraightLineDistance(distanceKm)

  const countdown = nowMs !== null ? getOfferCountdownState(offer.orderDeadline, nowMs) : null
  const isExpired = Boolean(countdown?.isExpired)
  const isUnavailable = isExpired || offer.status !== 'active' || offer.availableStockKg <= 0
  const isFavorite = favoriteIds.has(offer.id)
  const shareState = shareStates[offer.id] ?? 'idle'

  return (
    <div className='offer-sticky-parent flex flex-1 flex-col'>
      <p role='status' aria-live='polite' className='sr-only'>
        {liveAnnouncement}
      </p>

      <OfferStickyBars
        offer={offer}
        showDesktopSticky={showStickySummary}
        isUnavailable={isUnavailable}
        hasDroppedPrice={priceSummary.hasDropped}
        isFavorite={isFavorite}
        shareState={shareState}
        onToggleFavorite={handleToggleFavorite}
        onShare={handleShareOffer}
        onOpenMobileSheet={() => setMobileReserveOpen(true)}
        onScrollToReservation={() => {
          document.getElementById('panel-reservasi')?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
          document.getElementById('offer-order-desktop-weight')?.focus()
        }}
      />

      <div className='mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:py-8 lg:pb-12'>
        <div ref={headerSentinelRef}>
          <OfferDetailHeader
            offer={offer}
            nowMs={nowMs}
            distanceLabel={distanceLabel}
            countdown={countdown}
            isUnavailable={isUnavailable}
            isFavorite={isFavorite}
            shareState={shareState}
            onToggleFavorite={handleToggleFavorite}
            onShare={handleShareOffer}
          />
        </div>

        <OfferDetailGallery
          commodityName={offer.commodityName}
          areaLabel={offer.pickupAddressArea}
          photoUrls={photoUrls}
          isUnavailable={isUnavailable}
        />

        <div className='grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_420px]'>
          <OfferDetailSections
            offer={offer}
            locationLabel={selectedLocation.label}
            distanceLabel={distanceLabel}
            sectionAnchors={sectionAnchors}
            activeSectionId={activeSectionId}
            onSelectSection={setActiveSectionId}
          />

          <aside
            id='panel-reservasi'
            aria-label='Formulir reservasi stok'
            className='hidden scroll-mt-44 p-px lg:sticky lg:top-43 lg:flex lg:max-h-[calc(100dvh-11.25rem)] lg:flex-col lg:gap-3 lg:self-start lg:overflow-y-auto'
          >
            <Card size='sm' className='shrink-0 shadow-sm'>
              <CardContent>
                <OfferReservationForm
                  offer={offer}
                  isExpired={isExpired}
                  currentUser={currentUser}
                  onRequireAuth={() => setAuthDialogOpen(true)}
                  onOrderCreated={(order) => setCreatedOrder(order)}
                  idPrefix='offer-order-desktop'
                />
              </CardContent>
            </Card>

            {!isUnavailable &&
              (countdown?.urgency === 'critical' || countdown?.urgency === 'soon') && (
                <Alert className='shrink-0 border-border bg-secondary text-secondary-foreground'>
                  <Clock aria-hidden='true' />
                  <AlertTitle>Batas pemesanan segera berakhir</AlertTitle>
                  <AlertDescription>
                    Sisa waktu {countdown.label}. Pesanan otomatis dikunci saat batas pesan habis.
                  </AlertDescription>
                </Alert>
              )}
          </aside>
        </div>

        <OfferSimilarCarousel
          items={relatedOffers}
          nowMs={nowMs}
          favoriteIds={favoriteIds}
          shareStates={shareStates}
          onToggleFavorite={handleToggleFavorite}
          onShare={handleShareOffer}
          isCurrentUnavailable={isUnavailable}
        />
      </div>

      <Sheet open={mobileReserveOpen} onOpenChange={setMobileReserveOpen}>
        <SheetContent side='bottom' className='max-h-[90dvh] overflow-y-auto rounded-t-2xl p-5'>
          <SheetHeader className='p-0 pr-10'>
            <SheetTitle>Reservasi {offer.commodityName}</SheetTitle>
            <SheetDescription>
              Pilih berat pesanan dan slot ambil mandiri di {offer.pickupAddressArea}.
            </SheetDescription>
          </SheetHeader>

          <OfferReservationForm
            offer={offer}
            isExpired={isExpired}
            currentUser={currentUser}
            onRequireAuth={() => {
              setMobileReserveOpen(false)
              setAuthDialogOpen(true)
            }}
            onOrderCreated={(order) => {
              setMobileReserveOpen(false)
              setCreatedOrder(order)
            }}
            idPrefix='offer-order-mobile'
          />
        </SheetContent>
      </Sheet>

      <BuyerAuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />

      <OfferOrderSuccessDialog
        order={createdOrder}
        onOpenChange={(open) => {
          if (!open) {
            setCreatedOrder(null)
          }
        }}
      />

      <GlobalFooter />
    </div>
  )
}
