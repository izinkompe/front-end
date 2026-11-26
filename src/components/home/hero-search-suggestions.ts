import {
  getCategoryMeta,
  mainCategories,
  normalizeCategorySlug,
  type BuyerCategorySlug,
} from '@/lib/data/categories'
import type { Offer } from '@/types/api/offers'
import { buildOfferDetailHref, formatFarmerDisplayName } from './offer-card-helpers'

export interface CommoditySuggestion {
  id: string
  label: string
  categorySlug: BuyerCategorySlug
  categoryLabel: string
}

export interface OfferSuggestion {
  id: string
  title: string
  subtitle: string
  href: string
}

export interface HeroSearchSuggestionsResult {
  normalizedQuery: string
  commodities: CommoditySuggestion[]
  offers: OfferSuggestion[]
}

export interface HighlightSegment {
  text: string
  matched: boolean
}

const MAX_QUERY_LENGTH = 100

function capitalizeFirst(value: string): string {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function buildCommodityDirectory(offers: ReadonlyArray<Offer>): CommoditySuggestion[] {
  const seen = new Set<string>()
  const directory: CommoditySuggestion[] = []

  function addEntry(label: string, categorySlug: BuyerCategorySlug, categoryLabel: string) {
    const cleaned = label.trim()
    const key = cleaned.toLowerCase()
    if (!cleaned || seen.has(key)) return
    seen.add(key)
    directory.push({
      id: `commodity-${categorySlug}-${key.replace(/[^a-z0-9]+/g, '-')}`,
      label: cleaned,
      categorySlug,
      categoryLabel,
    })
  }

  for (const category of mainCategories) {
    const items = category.examples.split(',')
    for (const rawItem of items) {
      addEntry(capitalizeFirst(rawItem.trim()), category.slug, category.label)
    }
    addEntry(category.label, category.slug, category.label)
  }

  for (const offer of offers) {
    if (offer.status !== 'active' || offer.availableStockKg <= 0) continue
    const slug = normalizeCategorySlug(offer.category) ?? 'sayuran'
    const meta = getCategoryMeta(slug)
    addEntry(offer.commodityName, slug, meta.label)
  }

  return directory
}

export function getHeroSearchSuggestions(
  query: string,
  offers: ReadonlyArray<Offer>,
  limits?: { commodities?: number; offers?: number }
): HeroSearchSuggestionsResult {
  const normalizedQuery = query.trim().slice(0, MAX_QUERY_LENGTH)
  if (!normalizedQuery) {
    return {
      normalizedQuery: '',
      commodities: [],
      offers: [],
    }
  }

  const lowerQuery = normalizedQuery.toLowerCase()
  const commodityLimit = Math.max(1, Math.min(limits?.commodities ?? 4, 8))
  const offerLimit = Math.max(1, Math.min(limits?.offers ?? 4, 8))

  const directory = buildCommodityDirectory(offers)
  const matchedCommodities = directory
    .filter(
      (item) =>
        item.label.toLowerCase().includes(lowerQuery) ||
        item.categoryLabel.toLowerCase().includes(lowerQuery)
    )
    .sort((a, b) => {
      const aStarts = a.label.toLowerCase().startsWith(lowerQuery) ? 0 : 1
      const bStarts = b.label.toLowerCase().startsWith(lowerQuery) ? 0 : 1
      if (aStarts !== bStarts) return aStarts - bStarts
      return a.label.localeCompare(b.label, 'id')
    })
    .slice(0, commodityLimit)

  const matchedOffers = offers
    .filter((offer) => {
      if (offer.status !== 'active' || offer.availableStockKg <= 0) return false
      return (
        offer.commodityName.toLowerCase().includes(lowerQuery) ||
        offer.farmerName.toLowerCase().includes(lowerQuery) ||
        offer.pickupAddressArea.toLowerCase().includes(lowerQuery) ||
        offer.category.toLowerCase().includes(lowerQuery)
      )
    })
    .sort((a, b) => {
      const aNameStarts = a.commodityName.toLowerCase().startsWith(lowerQuery) ? 0 : 1
      const bNameStarts = b.commodityName.toLowerCase().startsWith(lowerQuery) ? 0 : 1
      if (aNameStarts !== bNameStarts) return aNameStarts - bNameStarts
      return b.availableStockKg - a.availableStockKg
    })
    .slice(0, offerLimit)
    .map((offer) => {
      const farmerDisplay = formatFarmerDisplayName(offer.farmerName)
      return {
        id: offer.id,
        title: `${offer.commodityName} - ${farmerDisplay}`,
        subtitle: `${offer.pickupAddressArea} · ${offer.availableStockKg} kg`,
        href: buildOfferDetailHref(offer.id),
      }
    })

  return {
    normalizedQuery,
    commodities: matchedCommodities,
    offers: matchedOffers,
  }
}

export function splitHighlightSegments(text: string, query: string): HighlightSegment[] {
  const trimmed = query.trim()
  if (!trimmed || !text) {
    return [{ text, matched: false }]
  }

  const lowerText = text.toLowerCase()
  const lowerQuery = trimmed.toLowerCase()
  const segments: HighlightSegment[] = []
  let cursor = 0

  while (cursor < text.length) {
    const matchIndex = lowerText.indexOf(lowerQuery, cursor)
    if (matchIndex === -1) {
      segments.push({ text: text.slice(cursor), matched: false })
      break
    }

    if (matchIndex > cursor) {
      segments.push({ text: text.slice(cursor, matchIndex), matched: false })
    }

    segments.push({
      text: text.slice(matchIndex, matchIndex + trimmed.length),
      matched: true,
    })
    cursor = matchIndex + trimmed.length
  }

  return segments.length > 0 ? segments : [{ text, matched: false }]
}
