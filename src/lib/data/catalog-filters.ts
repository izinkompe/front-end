import { formatPickupDateIso, type BuyerDeadlineOption } from '@/components/home/hero-search-params'
import {
  calculateStraightLineDistanceKm,
  getOfferCountdownState,
  type Coordinates,
} from '@/components/home/offer-card-helpers'
import { matchesOfferCategory, type BuyerCategorySlug } from '@/lib/data/categories'
import type { Offer } from '@/types/api/offers'
import type { CatalogFilterState } from './catalog-params'

export * from './catalog-params'

export interface CatalogOfferItem {
  offer: Offer
  distanceKm: number | null
  isExpired: boolean
}

export interface CatalogResultSummary {
  count: number
  totalAvailableStockKg: number
}

export interface CatalogBatchResult<T> {
  visibleItems: T[]
  hasMore: boolean
  remainingCount: number
}

export const INITIAL_CATALOG_BATCH_SIZE = 6
export const CATALOG_BATCH_STEP = 6

const THREE_HOURS_MS = 3 * 60 * 60 * 1000
const SIX_HOURS_MS = 6 * 60 * 60 * 1000

function getOfferDistanceKm(offer: Offer, referenceCoordinates: Coordinates | null): number | null {
  if (
    !referenceCoordinates ||
    typeof offer.latitude !== 'number' ||
    typeof offer.longitude !== 'number'
  ) {
    return null
  }
  return calculateStraightLineDistanceKm(referenceCoordinates, {
    lat: offer.latitude,
    lng: offer.longitude,
  })
}

function matchesDeadlineWindow(
  orderDeadlineIso: string,
  deadlineWindow: BuyerDeadlineOption,
  nowMs: number | null
): boolean {
  if (deadlineWindow === 'semua' || nowMs === null) {
    return true
  }

  const countdown = getOfferCountdownState(orderDeadlineIso, nowMs)
  if (countdown.isExpired) {
    return false
  }

  if (deadlineWindow === '3h') {
    return countdown.remainingMs <= THREE_HOURS_MS
  }

  if (deadlineWindow === '6h') {
    return countdown.remainingMs <= SIX_HOURS_MS
  }

  const todayIso = formatPickupDateIso(new Date(nowMs))
  const deadlineDate = new Date(orderDeadlineIso)
  if (Number.isNaN(deadlineDate.getTime())) {
    return false
  }
  return formatPickupDateIso(deadlineDate) === todayIso
}

export function filterAndSortCatalogOffers(
  offers: ReadonlyArray<Offer>,
  state: CatalogFilterState,
  referenceCoordinates: Coordinates | null,
  nowMs: number | null,
  fixedCategory?: BuyerCategorySlug
): CatalogOfferItem[] {
  const effectiveCategory = fixedCategory ?? state.category
  const normalizedQuery = state.q.trim().toLowerCase()
  const maxRadiusKm = state.radiusKm ? Number(state.radiusKm) : null

  const filtered: CatalogOfferItem[] = []

  for (const offer of offers) {
    if (offer.status !== 'active' || offer.availableStockKg <= 0) {
      continue
    }

    if (effectiveCategory !== 'semua' && !matchesOfferCategory(offer.category, effectiveCategory)) {
      continue
    }

    if (normalizedQuery.length > 0) {
      const haystack =
        `${offer.commodityName} ${offer.pickupAddressArea} ${offer.farmerName}`.toLowerCase()
      if (!haystack.includes(normalizedQuery)) {
        continue
      }
    }

    if (state.conditions.length > 0 && !state.conditions.includes(offer.condition)) {
      continue
    }

    if (state.minPrice !== null && offer.pricePerKg < state.minPrice) {
      continue
    }

    if (state.maxPrice !== null && offer.pricePerKg > state.maxPrice) {
      continue
    }

    if (state.minStockKg !== null && offer.availableStockKg < state.minStockKg) {
      continue
    }

    if (state.dynamicOnly && !offer.dynamicPriceRule) {
      continue
    }

    if (
      state.pickupDate &&
      !offer.pickupScheduleSlots.some(
        (slot) => slot.date === state.pickupDate && slot.isAvailable !== false
      )
    ) {
      continue
    }

    if (!matchesDeadlineWindow(offer.orderDeadline, state.deadlineWindow, nowMs)) {
      continue
    }

    const distanceKm = getOfferDistanceKm(offer, referenceCoordinates)
    if (maxRadiusKm !== null && (distanceKm === null || distanceKm > maxRadiusKm)) {
      continue
    }

    const isExpired =
      nowMs !== null ? getOfferCountdownState(offer.orderDeadline, nowMs).isExpired : false

    filtered.push({
      offer,
      distanceKm,
      isExpired,
    })
  }

  return filtered.sort((a, b) => {
    if (a.isExpired !== b.isExpired) {
      return a.isExpired ? 1 : -1
    }

    if (state.sort === 'expiring') {
      const deadlineDiff = Date.parse(a.offer.orderDeadline) - Date.parse(b.offer.orderDeadline)
      if (deadlineDiff !== 0) return deadlineDiff
    } else if (state.sort === 'price_asc') {
      const priceDiff = a.offer.pricePerKg - b.offer.pricePerKg
      if (priceDiff !== 0) return priceDiff
    } else if (state.sort === 'stock_desc') {
      const stockDiff = b.offer.availableStockKg - a.offer.availableStockKg
      if (stockDiff !== 0) return stockDiff
    } else if (state.sort === 'newest') {
      const harvestDiff = Date.parse(b.offer.harvestDate) - Date.parse(a.offer.harvestDate)
      if (harvestDiff !== 0) return harvestDiff
    }

    const aDist = a.distanceKm ?? Number.POSITIVE_INFINITY
    const bDist = b.distanceKm ?? Number.POSITIVE_INFINITY
    if (aDist !== bDist) {
      return aDist - bDist
    }

    return Date.parse(a.offer.orderDeadline) - Date.parse(b.offer.orderDeadline)
  })
}

export function summarizeCatalogResults(
  items: ReadonlyArray<CatalogOfferItem>
): CatalogResultSummary {
  let totalAvailableStockKg = 0
  for (const item of items) {
    totalAvailableStockKg += item.offer.availableStockKg
  }
  return {
    count: items.length,
    totalAvailableStockKg: Math.round(totalAvailableStockKg * 1000) / 1000,
  }
}

export function sliceCatalogBatch<T>(
  items: ReadonlyArray<T>,
  visibleCount: number
): CatalogBatchResult<T> {
  const safeCount = Math.max(0, Math.floor(visibleCount))
  const visibleItems = items.slice(0, safeCount)
  const remainingCount = Math.max(0, items.length - visibleItems.length)
  return {
    visibleItems,
    hasMore: remainingCount > 0,
    remainingCount,
  }
}
