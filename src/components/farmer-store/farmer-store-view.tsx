'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { BuyerAuthDialog } from '@/components/auth/buyer-auth-dialog'
import type { ShareButtonState } from '@/components/home/buyer-expiring-offer-card'
import { buildOfferDetailHref, getLocationCoordinates } from '@/components/home/offer-card-helpers'
import { useSelectedLocation } from '@/components/providers/location-provider'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCurrentUser } from '@/hooks/api/use-auth'
import { useOfferFavorites } from '@/hooks/api/use-favorites'
import {
  useFarmerReviews,
  useFarmerStore,
  useFarmerStoreOffers,
  useToggleFollowFarmer,
  useToggleReviewHelpful,
} from '@/hooks/api/use-farmer-store'
import {
  buildFarmerShowcases,
  buildFarmerStoreHref,
  filterAndSortFarmerOffers,
  filterAndSortFarmerReviews,
  type FarmerOfferShowcaseId,
  type FarmerOfferSort,
  type FarmerReviewFilterState,
  type FarmerStoreTab,
} from '@/lib/data/farmer-store-helpers'
import type { FarmerReviewTopic } from '@/types/api/farmers'
import type { Offer } from '@/types/api/offers'
import { FarmerOffersTab } from './farmer-offers-tab'
import { FarmerReviewsTab } from './farmer-reviews-tab'
import { FarmerStoreHeader } from './farmer-store-header'
import { FarmerStoreInfoDialog } from './farmer-store-info-dialog'
import { FarmerStoreSkeleton } from './farmer-store-skeleton'

interface FarmerStoreViewProps {
  farmerId: string
}

const VALID_SHOWCASES: ReadonlySet<string> = new Set([
  'semua',
  'dinamis',
  'segera',
  'sayuran',
  'buah',
  'padi-biji',
  'rempah-umbi',
])

export function FarmerStoreView({ farmerId }: FarmerStoreViewProps) {
  const searchParams = useSearchParams()
  const { selectedLocation } = useSelectedLocation()
  const { data: currentUser } = useCurrentUser()

  const {
    data: farmer,
    isPending: isFarmerPending,
    isError: isFarmerError,
    error: farmerError,
    refetch: refetchFarmer,
  } = useFarmerStore(farmerId)
  const { data: rawOffers = [] } = useFarmerStoreOffers(farmerId)
  const { data: reviewsPayload } = useFarmerReviews(farmerId)

  const followMutation = useToggleFollowFarmer(farmerId)
  const helpfulMutation = useToggleReviewHelpful(farmerId)

  const initialTab: FarmerStoreTab = searchParams.get('tab') === 'ulasan' ? 'ulasan' : 'penawaran'
  const rawEtalase = searchParams.get('etalase') ?? 'semua'
  const initialShowcase: FarmerOfferShowcaseId = VALID_SHOWCASES.has(rawEtalase)
    ? (rawEtalase as FarmerOfferShowcaseId)
    : 'semua'

  const [activeTab, setActiveTab] = useState<FarmerStoreTab>(initialTab)
  const [selectedShowcase, setSelectedShowcase] = useState<FarmerOfferShowcaseId>(initialShowcase)
  const [offerSearch, setOfferSearch] = useState('')
  const [offerSort, setOfferSort] = useState<FarmerOfferSort>('terdekat')
  const [reviewFilters, setReviewFilters] = useState<FarmerReviewFilterState>({
    withPhotoOnly: false,
    ratings: [],
    topics: [],
    sort: 'terbaru',
  })

  const [nowMs, setNowMs] = useState<number | null>(null)
  const [storeShareState, setStoreShareState] = useState<ShareButtonState>('idle')
  const [offerShareStates, setOfferShareStates] = useState<Record<string, ShareButtonState>>({})
  const [infoDialogOpen, setInfoDialogOpen] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [liveAnnouncement, setLiveAnnouncement] = useState('')

  const pendingFollowRef = useRef(false)
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
    if (pendingFollowRef.current && currentUser) {
      pendingFollowRef.current = false
      followMutation.mutate()
    }
  }, [currentUser, followMutation])

  const syncUrlParams = useCallback(
    (nextTab: FarmerStoreTab, nextShowcase: FarmerOfferShowcaseId) => {
      if (typeof window === 'undefined') return
      const params = new URLSearchParams(window.location.search)
      if (nextTab === 'penawaran') {
        params.delete('tab')
      } else {
        params.set('tab', nextTab)
      }
      if (nextShowcase === 'semua' || nextTab !== 'penawaran') {
        params.delete('etalase')
      } else {
        params.set('etalase', nextShowcase)
      }
      const query = params.toString()
      const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname
      window.history.replaceState(null, '', nextUrl)
    },
    []
  )

  const handleTabChange = (nextValue: string) => {
    const nextTab: FarmerStoreTab = nextValue === 'ulasan' ? 'ulasan' : 'penawaran'
    setActiveTab(nextTab)
    syncUrlParams(nextTab, selectedShowcase)
  }

  const handleShowcaseChange = (nextShowcase: FarmerOfferShowcaseId) => {
    setSelectedShowcase(nextShowcase)
    syncUrlParams(activeTab, nextShowcase)
  }

  const handleToggleFollow = () => {
    if (currentUser?.role !== 'buyer') {
      pendingFollowRef.current = true
      setAuthDialogOpen(true)
      return
    }
    followMutation.mutate(undefined, {
      onSuccess: (res) => {
        announcePolite(
          res.isFollowing
            ? `Berhasil mengikuti ${farmer?.farmName ?? 'petani'}`
            : `Berhenti mengikuti ${farmer?.farmName ?? 'petani'}`
        )
      },
    })
  }

  const scheduleShareReset = (key: string, resetFn: () => void) => {
    const existingTimer = shareTimersRef.current.get(key)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }
    const timerId = setTimeout(() => {
      resetFn()
      shareTimersRef.current.delete(key)
    }, 2200)
    shareTimersRef.current.set(key, timerId)
  }

  const handleShareStore = async () => {
    if (!farmer || typeof window === 'undefined') return
    const shareUrl = new URL(buildFarmerStoreHref(farmer.id), window.location.origin).toString()

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${farmer.farmName} | PanganTani`,
          text: `Lihat hasil panen surplus dari ${farmer.farmName} di ${farmer.areaName}`,
          url: shareUrl,
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
      }
      setStoreShareState('copied')
      announcePolite(`Tautan ${farmer.farmName} disalin`)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return
      }
      setStoreShareState('failed')
      announcePolite('Gagal menyalin tautan kebun')
    }

    scheduleShareReset('store-share', () => setStoreShareState('idle'))
  }

  const handleShareOffer = async (offer: Offer) => {
    if (typeof window === 'undefined') return
    const shareUrl = new URL(buildOfferDetailHref(offer.id), window.location.origin).toString()

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${offer.commodityName} | PanganTani`,
          text: `${offer.commodityName} di ${offer.pickupAddressArea}`,
          url: shareUrl,
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
      }
      setOfferShareStates((prev) => ({ ...prev, [offer.id]: 'copied' }))
      announcePolite(`Tautan ${offer.commodityName} disalin`)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return
      }
      setOfferShareStates((prev) => ({ ...prev, [offer.id]: 'failed' }))
      announcePolite('Gagal menyalin tautan penawaran')
    }

    scheduleShareReset(`offer-${offer.id}`, () => {
      setOfferShareStates((prev) => ({ ...prev, [offer.id]: 'idle' }))
    })
  }

  const { favoriteIds, toggleFavorite: handleToggleFavorite } = useOfferFavorites(
    () => setAuthDialogOpen(true),
    announcePolite
  )

  const referenceCoordinates = useMemo(
    () => getLocationCoordinates(selectedLocation),
    [selectedLocation]
  )

  const showcases = useMemo(() => buildFarmerShowcases(rawOffers, nowMs), [rawOffers, nowMs])

  const filteredOffers = useMemo(
    () =>
      filterAndSortFarmerOffers(rawOffers, {
        showcase: selectedShowcase,
        searchQuery: offerSearch,
        sort: offerSort,
        referenceCoordinates,
        nowMs,
      }),
    [rawOffers, selectedShowcase, offerSearch, offerSort, referenceCoordinates, nowMs]
  )

  const filteredReviews = useMemo(
    () => filterAndSortFarmerReviews(reviewsPayload?.reviews ?? [], reviewFilters),
    [reviewsPayload?.reviews, reviewFilters]
  )

  if (isFarmerPending) {
    return <FarmerStoreSkeleton />
  }

  if (isFarmerError || !farmer) {
    const isNotFound = farmerError && 'status' in farmerError && farmerError.status === 404
    return (
      <div className='mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-12 sm:px-6 lg:px-8'>
        <Alert className='border-border bg-card text-card-foreground'>
          <AlertCircle aria-hidden='true' />
          <AlertTitle>
            {isNotFound ? 'Profil kebun petani tidak ditemukan' : 'Gagal memuat profil kebun'}
          </AlertTitle>
          <AlertDescription className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <span>
              {isNotFound
                ? 'Akun kebun mungkin belum tersedia atau tautan tidak valid.'
                : 'Periksa koneksi internet Anda lalu muat ulang halaman ini.'}
            </span>
            <div className='flex flex-wrap gap-2'>
              {!isNotFound && (
                <Button type='button' variant='outline' size='sm' onClick={() => refetchFarmer()}>
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
    )
  }

  const summary = reviewsPayload?.summary ?? {
    averageRating: farmer.stats.averageRating,
    totalRatings: farmer.stats.totalRatings,
    totalReviews: farmer.stats.totalReviews,
    satisfactionPercent: farmer.stats.satisfactionPercent,
    breakdown: [5, 4, 3, 2, 1].map((stars) => ({ stars, count: 0 })),
    topicCounts: [
      { topic: 'freshness' as const, count: 0 },
      { topic: 'weight_accuracy' as const, count: 0 },
      { topic: 'pickup_ease' as const, count: 0 },
      { topic: 'condition_match' as const, count: 0 },
    ],
  }

  return (
    <div className='mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8'>
      <p role='status' aria-live='polite' className='sr-only'>
        {liveAnnouncement}
      </p>

      <FarmerStoreHeader
        farmer={farmer}
        isFollowPending={followMutation.isPending}
        shareState={storeShareState}
        onToggleFollow={handleToggleFollow}
        onOpenInfo={() => setInfoDialogOpen(true)}
        onShareStore={handleShareStore}
        onSelectReviewsTab={() => handleTabChange('ulasan')}
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className='gap-6'>
        <TabsList
          variant='line'
          aria-label='Bagian profil kebun petani'
          className='w-full justify-start gap-2 border-b border-border p-0'
        >
          <TabsTrigger value='penawaran' className='flex-none px-4 py-2.5 after:bottom-0'>
            Penawaran ({farmer.stats.activeOffersCount})
          </TabsTrigger>
          <TabsTrigger value='ulasan' className='flex-none px-4 py-2.5 after:bottom-0'>
            Ulasan ({summary.totalReviews})
          </TabsTrigger>
        </TabsList>

        <TabsContent value='penawaran'>
          <FarmerOffersTab
            farmName={farmer.farmName}
            showcases={showcases}
            selectedShowcase={selectedShowcase}
            searchQuery={offerSearch}
            sort={offerSort}
            items={filteredOffers}
            nowMs={nowMs}
            favoriteIds={favoriteIds}
            shareStates={offerShareStates}
            onSelectShowcase={handleShowcaseChange}
            onSearchChange={setOfferSearch}
            onSortChange={setOfferSort}
            onResetFilters={() => {
              handleShowcaseChange('semua')
              setOfferSearch('')
            }}
            onToggleFavorite={handleToggleFavorite}
            onShareOffer={handleShareOffer}
          />
        </TabsContent>

        <TabsContent value='ulasan'>
          <FarmerReviewsTab
            farmName={farmer.farmName}
            summary={summary}
            reviews={filteredReviews}
            filters={reviewFilters}
            helpfulPendingId={
              helpfulMutation.isPending ? (helpfulMutation.variables ?? null) : null
            }
            onToggleWithPhoto={(checked) =>
              setReviewFilters((prev) => ({ ...prev, withPhotoOnly: checked }))
            }
            onToggleRating={(stars) =>
              setReviewFilters((prev) => ({
                ...prev,
                ratings: prev.ratings.includes(stars)
                  ? prev.ratings.filter((item) => item !== stars)
                  : [...prev.ratings, stars],
              }))
            }
            onToggleTopic={(topic: FarmerReviewTopic) =>
              setReviewFilters((prev) => ({
                ...prev,
                topics: prev.topics.includes(topic)
                  ? prev.topics.filter((item) => item !== topic)
                  : [...prev.topics, topic],
              }))
            }
            onSortChange={(sort) => setReviewFilters((prev) => ({ ...prev, sort }))}
            onResetFilters={() =>
              setReviewFilters((prev) => ({
                ...prev,
                withPhotoOnly: false,
                ratings: [],
                topics: [],
              }))
            }
            onToggleHelpful={(reviewId) => helpfulMutation.mutate(reviewId)}
          />
        </TabsContent>
      </Tabs>

      <FarmerStoreInfoDialog
        farmer={farmer}
        open={infoDialogOpen}
        onOpenChange={setInfoDialogOpen}
      />

      <BuyerAuthDialog
        open={authDialogOpen}
        onOpenChange={(open) => {
          setAuthDialogOpen(open)
          if (!open && !currentUser) {
            pendingFollowRef.current = false
          }
        }}
      />
    </div>
  )
}
