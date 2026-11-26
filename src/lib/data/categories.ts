import { z } from 'zod'
import {
  calculateStraightLineDistanceKm,
  type Coordinates,
} from '@/components/home/offer-card-helpers'
import type { SelectedLocation } from '@/lib/data/regions'
import type { Offer } from '@/types/api/offers'

export const BuyerCategorySlugSchema = z.enum(['sayuran', 'buah', 'padi-biji', 'rempah-umbi'])
export type BuyerCategorySlug = z.infer<typeof BuyerCategorySlugSchema>

export interface MainCategoryMeta {
  slug: BuyerCategorySlug
  label: string
  shortLabel: string
  examples: string
  href: string
  aliases: ReadonlyArray<string>
}

export interface CategoryOfferSummary {
  activeCount: number
  totalAvailableStockKg: number
  minPricePerKg: number | null
  maxPricePerKg: number | null
  uniqueAreas: string[]
}

const LocationParamSchema = z.object({
  provinceId: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9-]+$/),
  regionId: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9-]+$/)
    .nullable(),
})

export const mainCategories: ReadonlyArray<MainCategoryMeta> = [
  {
    slug: 'sayuran',
    label: 'Sayuran',
    shortLabel: 'Sayuran',
    examples: 'Tomat ceri, buncis, wortel, kol, sawi',
    href: '/pasar/sayuran',
    aliases: ['sayuran', 'sayur', 'sayur-mayur'],
  },
  {
    slug: 'buah',
    label: 'Buah',
    shortLabel: 'Buah',
    examples: 'Mangga, nanas madu, pisang, alpukat',
    href: '/pasar/buah',
    aliases: ['buah', 'buah-buahan'],
  },
  {
    slug: 'padi-biji',
    label: 'Padi & Biji-bijian',
    shortLabel: 'Padi & Biji',
    examples: 'Beras medium, jagung pipil, kacang tanah, kedelai',
    href: '/pasar/padi-biji',
    aliases: ['padi-biji', 'padi & biji-bijian', 'padi dan biji-bijian', 'beras & biji-bijian'],
  },
  {
    slug: 'rempah-umbi',
    label: 'Rempah & Umbi',
    shortLabel: 'Rempah & Umbi',
    examples: 'Ubi cilembu, kentang, bawang merah, jahe',
    href: '/pasar/rempah-umbi',
    aliases: ['rempah-umbi', 'rempah & umbi', 'rempah dan umbi', 'umbi & rempah'],
  },
]

export function getCategoryMeta(slug: BuyerCategorySlug): MainCategoryMeta {
  return mainCategories.find((category) => category.slug === slug) ?? mainCategories[0]
}

export function normalizeCategorySlug(value: string): BuyerCategorySlug | null {
  const normalized = value.trim().toLowerCase()
  if (!normalized) return null

  const matched = mainCategories.find(
    (category) =>
      category.slug === normalized ||
      category.label.toLowerCase() === normalized ||
      category.aliases.includes(normalized)
  )

  return matched ? matched.slug : null
}

export function matchesOfferCategory(offerCategory: string, targetCategory: string): boolean {
  const normalizedOffer = normalizeCategorySlug(offerCategory)
  const normalizedTarget = normalizeCategorySlug(targetCategory)

  if (normalizedOffer && normalizedTarget) {
    return normalizedOffer === normalizedTarget
  }

  return offerCategory.trim().toLowerCase() === targetCategory.trim().toLowerCase()
}

export function buildCategoryCatalogHref(
  slug: BuyerCategorySlug,
  location?: SelectedLocation
): string {
  const parsedSlug = BuyerCategorySlugSchema.safeParse(slug)
  if (!parsedSlug.success) {
    return '/pasar'
  }

  const basePath = `/pasar/${parsedSlug.data}`
  if (!location) {
    return basePath
  }

  const parsedLocation = LocationParamSchema.safeParse({
    provinceId: location.provinceId,
    regionId: location.regionId,
  })
  if (!parsedLocation.success) {
    return basePath
  }

  const params = new URLSearchParams()
  params.set('province', parsedLocation.data.provinceId)
  if (parsedLocation.data.regionId) {
    params.set('region', parsedLocation.data.regionId)
  }

  return `${basePath}?${params.toString()}`
}

export function summarizeCategoryOffers(offers: ReadonlyArray<Offer>): CategoryOfferSummary {
  if (offers.length === 0) {
    return {
      activeCount: 0,
      totalAvailableStockKg: 0,
      minPricePerKg: null,
      maxPricePerKg: null,
      uniqueAreas: [],
    }
  }

  let totalAvailableStockKg = 0
  let minPricePerKg = Number.POSITIVE_INFINITY
  let maxPricePerKg = Number.NEGATIVE_INFINITY
  const areasSet = new Set<string>()

  for (const offer of offers) {
    totalAvailableStockKg += offer.availableStockKg
    if (offer.pricePerKg < minPricePerKg) {
      minPricePerKg = offer.pricePerKg
    }
    if (offer.pricePerKg > maxPricePerKg) {
      maxPricePerKg = offer.pricePerKg
    }
    const trimmedArea = offer.pickupAddressArea.trim()
    if (trimmedArea) {
      areasSet.add(trimmedArea)
    }
  }

  return {
    activeCount: offers.length,
    totalAvailableStockKg: Math.round(totalAvailableStockKg * 1000) / 1000,
    minPricePerKg: Number.isFinite(minPricePerKg) ? minPricePerKg : null,
    maxPricePerKg: Number.isFinite(maxPricePerKg) ? maxPricePerKg : null,
    uniqueAreas: Array.from(areasSet),
  }
}

export function filterAndSortCategoryOffers(
  offers: ReadonlyArray<Offer>,
  slug: BuyerCategorySlug,
  referenceCoordinates: Coordinates | null
): Offer[] {
  const matching = offers.filter(
    (offer) =>
      offer.status === 'active' &&
      offer.availableStockKg > 0 &&
      matchesOfferCategory(offer.category, slug)
  )

  return matching.sort((a, b) => {
    if (referenceCoordinates) {
      const aHasCoords = typeof a.latitude === 'number' && typeof a.longitude === 'number'
      const bHasCoords = typeof b.latitude === 'number' && typeof b.longitude === 'number'
      const aDist = aHasCoords
        ? calculateStraightLineDistanceKm(referenceCoordinates, {
            lat: a.latitude as number,
            lng: a.longitude as number,
          })
        : Number.POSITIVE_INFINITY
      const bDist = bHasCoords
        ? calculateStraightLineDistanceKm(referenceCoordinates, {
            lat: b.latitude as number,
            lng: b.longitude as number,
          })
        : Number.POSITIVE_INFINITY

      if (aDist !== bDist) {
        return aDist - bDist
      }
    }

    if (b.availableStockKg !== a.availableStockKg) {
      return b.availableStockKg - a.availableStockKg
    }

    return Date.parse(a.orderDeadline) - Date.parse(b.orderDeadline)
  })
}
