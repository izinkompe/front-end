import { describe, expect, test } from 'bun:test'
import {
  buildCategoryCatalogHref,
  filterAndSortCategoryOffers,
  getCategoryMeta,
  mainCategories,
  matchesOfferCategory,
  normalizeCategorySlug,
  summarizeCategoryOffers,
} from './categories'

function createOffer(overrides = {}) {
  return {
    id: 'off-test',
    farmerId: 'usr-pt-01',
    farmerName: 'Pak Joko',
    commodityName: 'Tomat Ceri',
    category: 'Sayuran',
    condition: 'surplus',
    harvestDate: '2026-11-26T00:00:00Z',
    availableStockKg: 50,
    reservedStockKg: 0,
    soldStockKg: 10,
    pricePerKg: 12000,
    orderDeadline: '2026-11-27T12:00:00Z',
    pickupAddressArea: 'Lembang, Bandung Barat',
    latitude: -6.8167,
    longitude: 107.6167,
    pickupScheduleSlots: [],
    photos: [],
    status: 'active',
    createdAt: '2026-11-26T00:00:00Z',
    updatedAt: '2026-11-26T00:00:00Z',
    ...overrides,
  }
}

describe('category taxonomy and normalization', () => {
  test('exposes all four main buyer categories', () => {
    expect(mainCategories.map((item) => item.slug)).toEqual([
      'sayuran',
      'buah',
      'padi-biji',
      'rempah-umbi',
    ])
    expect(getCategoryMeta('padi-biji').label).toBe('Padi & Biji-bijian')
  })

  test('normalizes slugs, labels, and aliases consistently', () => {
    expect(normalizeCategorySlug('Sayuran')).toBe('sayuran')
    expect(normalizeCategorySlug('Buah-buahan')).toBe('buah')
    expect(normalizeCategorySlug('Padi & Biji-bijian')).toBe('padi-biji')
    expect(normalizeCategorySlug('padi-biji')).toBe('padi-biji')
    expect(normalizeCategorySlug('Rempah & Umbi')).toBe('rempah-umbi')
    expect(normalizeCategorySlug('tidak-dikenal')).toBeNull()
  })

  test('matches offer categories across slug and label formats', () => {
    expect(matchesOfferCategory('Padi & Biji-bijian', 'padi-biji')).toBe(true)
    expect(matchesOfferCategory('Buah', 'buah')).toBe(true)
    expect(matchesOfferCategory('Rempah & Umbi', 'rempah-umbi')).toBe(true)
    expect(matchesOfferCategory('Sayuran', 'buah')).toBe(false)
  })
})

describe('buildCategoryCatalogHref', () => {
  test('builds location-scoped category route', () => {
    expect(
      buildCategoryCatalogHref('sayuran', {
        provinceId: 'jawa-barat',
        regionId: 'bandung-barat',
        label: 'Bandung Barat (Lembang)',
      })
    ).toBe('/pasar/sayuran?province=jawa-barat&region=bandung-barat')
  })

  test('omits region parameter when regionId is null', () => {
    expect(
      buildCategoryCatalogHref('padi-biji', {
        provinceId: 'jawa-barat',
        regionId: null,
        label: 'Semua Jawa Barat',
      })
    ).toBe('/pasar/padi-biji?province=jawa-barat')
  })

  test('falls back safely when location contains unsafe characters', () => {
    expect(
      buildCategoryCatalogHref('buah', {
        provinceId: '../evil',
        regionId: null,
        label: 'Invalid',
      })
    ).toBe('/pasar/buah')
  })
})

describe('summarizeCategoryOffers and filterAndSortCategoryOffers', () => {
  test('summarizes stock, price range, and unique harvest areas', () => {
    const summary = summarizeCategoryOffers([
      createOffer({
        id: '1',
        availableStockKg: 40.5,
        pricePerKg: 11000,
        pickupAddressArea: 'Lembang, Bandung Barat',
      }),
      createOffer({
        id: '2',
        availableStockKg: 60.25,
        pricePerKg: 14500,
        pickupAddressArea: 'Pangalengan, Kab. Bandung',
      }),
      createOffer({
        id: '3',
        availableStockKg: 20,
        pricePerKg: 9500,
        pickupAddressArea: 'Lembang, Bandung Barat',
      }),
    ])

    expect(summary).toEqual({
      activeCount: 3,
      totalAvailableStockKg: 120.75,
      minPricePerKg: 9500,
      maxPricePerKg: 14500,
      uniqueAreas: ['Lembang, Bandung Barat', 'Pangalengan, Kab. Bandung'],
    })
  })

  test('returns empty summary for empty list', () => {
    expect(summarizeCategoryOffers([])).toEqual({
      activeCount: 0,
      totalAvailableStockKg: 0,
      minPricePerKg: null,
      maxPricePerKg: null,
      uniqueAreas: [],
    })
  })

  test('filters active stocked offers and sorts by straight-line distance then stock', () => {
    const offers = [
      createOffer({
        id: 'far',
        category: 'Sayuran',
        latitude: -7.2279,
        longitude: 107.9087,
        availableStockKg: 200,
      }),
      createOffer({
        id: 'near-smaller',
        category: 'Sayuran',
        latitude: -6.8167,
        longitude: 107.6167,
        availableStockKg: 30,
      }),
      createOffer({
        id: 'near-larger',
        category: 'Sayuran',
        latitude: -6.8167,
        longitude: 107.6167,
        availableStockKg: 90,
      }),
      createOffer({
        id: 'sold-out',
        category: 'Sayuran',
        availableStockKg: 0,
      }),
      createOffer({
        id: 'other-category',
        category: 'Buah',
      }),
    ]

    const result = filterAndSortCategoryOffers(offers, 'sayuran', {
      lat: -6.8167,
      lng: 107.6167,
    })

    expect(result.map((item) => item.id)).toEqual(['near-larger', 'near-smaller', 'far'])
  })
})
