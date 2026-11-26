import { z } from 'zod'
import {
  calculateStraightLineDistanceKm,
  getOfferCountdownState,
  type Coordinates,
} from '@/components/home/offer-card-helpers'
import { mainCategories, matchesOfferCategory, normalizeCategorySlug } from '@/lib/data/categories'
import type { CommodityCategory, FarmerType } from '@/types/api/auth'
import type { FarmerReview, FarmerReviewTopic } from '@/types/api/farmers'
import type { Offer } from '@/types/api/offers'

export const FarmerIdSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-zA-Z0-9_-]+$/)

export type FarmerStoreTab = 'penawaran' | 'ulasan'
export type FarmerOfferShowcaseId =
  'semua' | 'dinamis' | 'segera' | 'sayuran' | 'buah' | 'padi-biji' | 'rempah-umbi'

export type FarmerOfferSort = 'terdekat' | 'expiring' | 'termurah' | 'terbaru'
export type FarmerReviewSort = 'terbaru' | 'rating-tinggi' | 'rating-rendah' | 'membantu'

export interface FarmerOfferShowcaseItem {
  id: FarmerOfferShowcaseId
  label: string
  count: number
}

export interface FarmerOfferListItem {
  offer: Offer
  distanceKm: number | null
  isExpired: boolean
}

export interface FarmerReviewFilterState {
  withPhotoOnly: boolean
  ratings: number[]
  topics: FarmerReviewTopic[]
  sort: FarmerReviewSort
}

const SIX_HOURS_MS = 6 * 60 * 60 * 1000

const farmerTypeLabels: Record<FarmerType, string> = {
  individual: 'Petani Perorangan',
  poktan: 'Kelompok Tani',
  cooperative: 'Koperasi Tani',
}

const commodityCategoryLabels: Record<CommodityCategory, string> = {
  sayuran: 'Sayuran',
  buah: 'Buah',
  'padi-biji': 'Padi & Biji-bijian',
  'rempah-umbi': 'Rempah & Umbi',
  lainnya: 'Lainnya',
}

const reviewTopicLabels: Record<FarmerReviewTopic, string> = {
  freshness: 'Kesegaran panen',
  weight_accuracy: 'Akurasi timbangan',
  pickup_ease: 'Kemudahan pengambilan',
  condition_match: 'Kesesuaian kondisi',
}

export function buildFarmerStoreHref(farmerId: string, tab?: FarmerStoreTab): string {
  const parsed = FarmerIdSchema.safeParse(farmerId.trim())
  if (!parsed.success) {
    return '/pasar'
  }
  const basePath = `/petani/${encodeURIComponent(parsed.data)}`
  if (tab && tab !== 'penawaran') {
    return `${basePath}?tab=${tab}`
  }
  return basePath
}

export function getFarmerTypeLabel(farmerType: FarmerType): string {
  return farmerTypeLabels[farmerType]
}

export function getCommodityCategoryLabel(category: CommodityCategory): string {
  return commodityCategoryLabels[category]
}

export function getReviewTopicLabel(topic: FarmerReviewTopic): string {
  return reviewTopicLabels[topic]
}

export function getFarmInitials(farmName: string): string {
  const words = farmName
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0)
  if (words.length === 0) return 'PT'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0]}${words[1][0]}`.toUpperCase()
}

export function formatShortDateId(isoString: string): string {
  const parsed = new Date(isoString)
  if (Number.isNaN(parsed.getTime())) {
    return isoString
  }
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed)
}

export function formatJoinedMonthYearId(isoString: string): string {
  const parsed = new Date(isoString)
  if (Number.isNaN(parsed.getTime())) {
    return ''
  }
  return new Intl.DateTimeFormat('id-ID', {
    month: 'short',
    year: 'numeric',
  }).format(parsed)
}

function isOfferExpiringSoon(offer: Offer, nowMs: number | null): boolean {
  if (nowMs === null) return false
  const countdown = getOfferCountdownState(offer.orderDeadline, nowMs)
  return !countdown.isExpired && countdown.remainingMs <= SIX_HOURS_MS
}

export function buildFarmerShowcases(
  offers: ReadonlyArray<Offer>,
  nowMs: number | null
): FarmerOfferShowcaseItem[] {
  const activeOffers = offers.filter(
    (offer) => offer.status === 'active' && offer.availableStockKg > 0
  )

  const items: FarmerOfferShowcaseItem[] = [
    { id: 'semua', label: 'Semua Penawaran', count: activeOffers.length },
  ]

  const dynamicCount = activeOffers.filter((offer) => Boolean(offer.dynamicPriceRule)).length
  if (dynamicCount > 0) {
    items.push({ id: 'dinamis', label: 'Harga Dinamis', count: dynamicCount })
  }

  const expiringCount = activeOffers.filter((offer) => isOfferExpiringSoon(offer, nowMs)).length
  if (expiringCount > 0) {
    items.push({ id: 'segera', label: 'Segera Ditutup', count: expiringCount })
  }

  for (const cat of mainCategories) {
    const count = activeOffers.filter((offer) =>
      matchesOfferCategory(offer.category, cat.slug)
    ).length
    if (count > 0) {
      items.push({ id: cat.slug, label: cat.label, count })
    }
  }

  return items
}

export function filterAndSortFarmerOffers(
  offers: ReadonlyArray<Offer>,
  options: {
    showcase: FarmerOfferShowcaseId
    searchQuery: string
    sort: FarmerOfferSort
    referenceCoordinates: Coordinates | null
    nowMs: number | null
  }
): FarmerOfferListItem[] {
  const normalizedQuery = options.searchQuery.trim().toLowerCase()
  const result: FarmerOfferListItem[] = []

  for (const offer of offers) {
    if (offer.status !== 'active' || offer.availableStockKg <= 0) {
      continue
    }

    if (options.showcase === 'dinamis' && !offer.dynamicPriceRule) {
      continue
    }

    if (options.showcase === 'segera' && !isOfferExpiringSoon(offer, options.nowMs)) {
      continue
    }

    if (
      options.showcase !== 'semua' &&
      options.showcase !== 'dinamis' &&
      options.showcase !== 'segera' &&
      !matchesOfferCategory(offer.category, options.showcase)
    ) {
      continue
    }

    if (normalizedQuery) {
      const categorySlug = normalizeCategorySlug(offer.category)
      const haystack =
        `${offer.commodityName} ${offer.category} ${categorySlug ?? ''} ${offer.surplusReason ?? ''}`.toLowerCase()
      if (!haystack.includes(normalizedQuery)) {
        continue
      }
    }

    const distanceKm =
      options.referenceCoordinates &&
      typeof offer.latitude === 'number' &&
      typeof offer.longitude === 'number'
        ? calculateStraightLineDistanceKm(options.referenceCoordinates, {
            lat: offer.latitude,
            lng: offer.longitude,
          })
        : null

    const isExpired =
      options.nowMs !== null
        ? getOfferCountdownState(offer.orderDeadline, options.nowMs).isExpired
        : false

    result.push({ offer, distanceKm, isExpired })
  }

  result.sort((a, b) => {
    if (a.isExpired !== b.isExpired) {
      return a.isExpired ? 1 : -1
    }

    if (options.sort === 'termurah') {
      return a.offer.pricePerKg - b.offer.pricePerKg
    }

    if (options.sort === 'expiring') {
      return Date.parse(a.offer.orderDeadline) - Date.parse(b.offer.orderDeadline)
    }

    if (options.sort === 'terbaru') {
      return Date.parse(b.offer.createdAt) - Date.parse(a.offer.createdAt)
    }

    if (a.distanceKm !== null && b.distanceKm !== null && a.distanceKm !== b.distanceKm) {
      return a.distanceKm - b.distanceKm
    }
    return Date.parse(a.offer.orderDeadline) - Date.parse(b.offer.orderDeadline)
  })

  return result
}

export function filterAndSortFarmerReviews(
  reviews: ReadonlyArray<FarmerReview>,
  filters: FarmerReviewFilterState
): FarmerReview[] {
  const filtered = reviews.filter((review) => {
    if (filters.withPhotoOnly && review.photos.length === 0) {
      return false
    }
    if (filters.ratings.length > 0 && !filters.ratings.includes(review.rating)) {
      return false
    }
    if (
      filters.topics.length > 0 &&
      !filters.topics.some((topic) => review.topics.includes(topic))
    ) {
      return false
    }
    return true
  })

  return [...filtered].sort((a, b) => {
    if (filters.sort === 'rating-tinggi') {
      return b.rating - a.rating || Date.parse(b.createdAt) - Date.parse(a.createdAt)
    }
    if (filters.sort === 'rating-rendah') {
      return a.rating - b.rating || Date.parse(b.createdAt) - Date.parse(a.createdAt)
    }
    if (filters.sort === 'membantu') {
      return b.helpfulCount - a.helpfulCount || Date.parse(b.createdAt) - Date.parse(a.createdAt)
    }
    return Date.parse(b.createdAt) - Date.parse(a.createdAt)
  })
}
