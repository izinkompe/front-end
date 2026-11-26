'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { BuyerAuthDialog } from '@/components/auth/buyer-auth-dialog'
import type { ShareButtonState } from '@/components/home/buyer-expiring-offer-card'
import {
  buildOfferDetailHref,
  formatWeightKg,
  getLocationCoordinates,
} from '@/components/home/offer-card-helpers'
import { useSelectedLocation } from '@/components/providers/location-provider'
import { CommoditySearchInput } from '@/components/shared/commodity-search-input'
import { useHydrated } from '@/hooks/use-hydrated'
import { useOfferFavorites } from '@/hooks/api/use-favorites'
import { useOffers } from '@/hooks/api/use-offers'
import { getCategoryMeta, type BuyerCategorySlug } from '@/lib/data/categories'
import {
  CATALOG_BATCH_STEP,
  INITIAL_CATALOG_BATCH_SIZE,
  buildCatalogHref,
  clearAllCatalogFilters,
  countActiveCatalogFilters,
  filterAndSortCatalogOffers,
  getActiveFilterChips,
  parseCatalogSearchParams,
  resolveSelectedLocationFromParams,
  sliceCatalogBatch,
  summarizeCatalogResults,
  type CatalogFilterState,
} from '@/lib/data/catalog-filters'
import type { Offer } from '@/types/api/offers'
import { CatalogFilterSheet } from './catalog-filter-sheet'
import { CatalogScrollTopButton } from './catalog-scroll-top-button'
import { CatalogSplitView } from './catalog-split-view'
import {
  CatalogActiveFilterChips,
  CatalogBreadcrumb,
  CatalogLoadMoreFooter,
  CatalogStatusFallback,
} from './catalog-status-blocks'
import { CatalogToolbar } from './catalog-toolbar'

interface CatalogViewProps {
  fixedCategory?: BuyerCategorySlug
}

export function CatalogView({ fixedCategory }: CatalogViewProps) {
  const isHydrated = useHydrated()
  const searchParams = useSearchParams()
  const { selectedLocation, setSelectedLocation } = useSelectedLocation()
  const { data: offers, isPending, isError, refetch } = useOffers()
  const effectivePending = !isHydrated || isPending

  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [shareStates, setShareStates] = useState<Record<string, ShareButtonState>>({})
  const [nowMs, setNowMs] = useState<number | null>(null)
  const [liveAnnouncement, setLiveAnnouncement] = useState('')

  const shareTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const lastAnnouncementRef = useRef('')
  const appliedUrlLocationRef = useRef(false)

  const filterState = useMemo(() => {
    const rawParams: Record<string, string | string[] | undefined> = {}
    searchParams.forEach((value, key) => {
      const existing = rawParams[key]
      if (existing === undefined) {
        rawParams[key] = value
      } else if (Array.isArray(existing)) {
        existing.push(value)
      } else {
        rawParams[key] = [existing, value]
      }
    })
    return parseCatalogSearchParams(rawParams, fixedCategory)
  }, [fixedCategory, searchParams])

  const announcePolite = useCallback((message: string) => {
    const nextMessage = message === lastAnnouncementRef.current ? `${message}\u00A0` : message
    lastAnnouncementRef.current = nextMessage
    setLiveAnnouncement(nextMessage)
  }, [])

  useEffect(() => {
    if (appliedUrlLocationRef.current) return
    appliedUrlLocationRef.current = true
    const urlLocation = resolveSelectedLocationFromParams(
      filterState.provinceId,
      filterState.regionId
    )
    if (urlLocation) {
      setSelectedLocation(urlLocation)
    }
  }, [filterState.provinceId, filterState.regionId, setSelectedLocation])

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

  const updateFilterState = useCallback(
    (updater: (prev: CatalogFilterState) => CatalogFilterState) => {
      const next = updater(filterState)
      const nextHref = buildCatalogHref(
        {
          ...next,
          provinceId: selectedLocation.provinceId,
          regionId: selectedLocation.regionId,
        },
        fixedCategory
      )
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', nextHref)
      }
    },
    [filterState, fixedCategory, selectedLocation.provinceId, selectedLocation.regionId]
  )

  const referenceCoordinates = useMemo(
    () => getLocationCoordinates(selectedLocation),
    [selectedLocation]
  )

  const catalogItems = useMemo(
    () =>
      filterAndSortCatalogOffers(
        effectivePending ? [] : (offers ?? []),
        filterState,
        referenceCoordinates,
        nowMs,
        fixedCategory
      ),
    [effectivePending, offers, filterState, referenceCoordinates, nowMs, fixedCategory]
  )

  const summary = useMemo(() => summarizeCatalogResults(catalogItems), [catalogItems])
  const activeChips = useMemo(
    () => getActiveFilterChips(filterState, fixedCategory),
    [filterState, fixedCategory]
  )
  const activeFilterCount = countActiveCatalogFilters(filterState, fixedCategory)

  const categoryMeta = fixedCategory ? getCategoryMeta(fixedCategory) : null
  const pageTitle = categoryMeta
    ? `Panen ${categoryMeta.label.toLowerCase()}`
    : 'Eksplorasi panen surplus'

  const batchKey = useMemo(
    () =>
      buildCatalogHref(
        {
          ...filterState,
          view: 'row',
          provinceId: selectedLocation.provinceId,
          regionId: selectedLocation.regionId,
        },
        fixedCategory
      ),
    [filterState, fixedCategory, selectedLocation.provinceId, selectedLocation.regionId]
  )

  const [batchState, setBatchState] = useState<{ key: string; count: number }>({
    key: batchKey,
    count: INITIAL_CATALOG_BATCH_SIZE,
  })

  const visibleCount = batchState.key === batchKey ? batchState.count : INITIAL_CATALOG_BATCH_SIZE

  const { visibleItems, hasMore } = useMemo(
    () => sliceCatalogBatch(catalogItems, visibleCount),
    [catalogItems, visibleCount]
  )

  const handleLoadMore = useCallback(() => {
    setBatchState((prev) => {
      const currentCount = prev.key === batchKey ? prev.count : INITIAL_CATALOG_BATCH_SIZE
      return {
        key: batchKey,
        count: currentCount + CATALOG_BATCH_STEP,
      }
    })
  }, [batchKey])

  const handleEnsureOfferVisible = useCallback(
    (offerId: string) => {
      const targetIndex = catalogItems.findIndex((item) => item.offer.id === offerId)
      if (targetIndex < 0) return
      if (targetIndex + 1 > visibleCount) {
        setBatchState({
          key: batchKey,
          count: targetIndex + 1,
        })
      }
    },
    [batchKey, catalogItems, visibleCount]
  )

  const { favoriteIds, toggleFavorite: handleToggleFavorite } = useOfferFavorites(
    () => setAuthDialogOpen(true),
    announcePolite
  )

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

  function handleClearAllFilters() {
    updateFilterState((prev) => clearAllCatalogFilters(prev, fixedCategory))
  }

  const statusFallbackNode =
    effectivePending || isError || catalogItems.length === 0 ? (
      <CatalogStatusFallback
        isPending={effectivePending}
        isError={isError}
        itemCount={catalogItems.length}
        activeFilterCount={activeFilterCount}
        onRefetch={() => refetch()}
        onClearAll={handleClearAllFilters}
      />
    ) : null

  const loadMoreNode =
    !effectivePending && hasMore ? (
      <CatalogLoadMoreFooter
        visibleCount={visibleItems.length}
        totalCount={catalogItems.length}
        onLoadMore={handleLoadMore}
      />
    ) : null

  return (
    <div className='w-full bg-background text-foreground'>
      <p role='status' aria-live='polite' className='sr-only'>
        {liveAnnouncement}
      </p>

      <CatalogSplitView
        leftControls={
          <>
            <div className='flex flex-col gap-3'>
              <CatalogBreadcrumb categoryMeta={categoryMeta} />
              <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                <h1 className='text-[clamp(1.5rem,1.25rem+0.9vw,2rem)] leading-tight font-bold text-foreground'>
                  {pageTitle}
                </h1>
                <form
                  role='search'
                  onSubmit={(event) => event.preventDefault()}
                  aria-label='Cari komoditas panen'
                  className='w-full sm:w-72'
                >
                  <CommoditySearchInput
                    value={filterState.q}
                    onChange={(nextQuery) =>
                      updateFilterState((prev) => ({
                        ...prev,
                        q: nextQuery,
                      }))
                    }
                    placeholder='Cari tomat, buncis, mangga...'
                    ariaLabel='Cari nama komoditas atau wilayah'
                    className='min-h-11'
                  />
                </form>
              </div>
            </div>

            <CatalogToolbar
              state={filterState}
              fixedCategory={fixedCategory}
              activeFilterCount={activeFilterCount}
              onOpenFilterSheet={() => setFilterSheetOpen(true)}
              onStateChange={updateFilterState}
            />

            <CatalogActiveFilterChips
              chips={activeChips}
              onClearChip={updateFilterState}
              onClearAll={handleClearAllFilters}
            />

            <p className='text-sm leading-relaxed text-muted-foreground tabular-nums sm:text-base'>
              {effectivePending
                ? `Memuat penawaran dari ${selectedLocation.label}.`
                : `Ditemukan ${summary.count} penawaran (${formatWeightKg(summary.totalAvailableStockKg)}) dari ${selectedLocation.label}.`}
            </p>
          </>
        }
        listBodyFallback={statusFallbackNode}
        loadMoreSlot={loadMoreNode}
        cardLayout={filterState.view}
        visibleItems={visibleItems}
        mapItems={catalogItems}
        nowMs={nowMs}
        referenceCoordinates={referenceCoordinates}
        radiusKm={filterState.radiusKm}
        mapError={mapError}
        favoriteIds={favoriteIds}
        shareStates={shareStates}
        onRadiusChange={(nextRadius) =>
          updateFilterState((prev) => ({ ...prev, radiusKm: nextRadius }))
        }
        onEnsureOfferVisible={handleEnsureOfferVisible}
        onToggleFavorite={handleToggleFavorite}
        onShare={handleShareOffer}
        onMapFailure={(reason) => setMapError(reason)}
        onRetryMap={() => setMapError(null)}
      />

      <CatalogScrollTopButton splitActive={!mapError} />

      <CatalogFilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        state={filterState}
        fixedCategory={fixedCategory}
        onApply={(nextState) => updateFilterState(() => nextState)}
      />

      <BuyerAuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </div>
  )
}
