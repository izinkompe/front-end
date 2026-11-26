import { describe, expect, test } from 'bun:test'
import { mockOffersData } from '@/lib/api/db/fixtures/offers.fixture'
import {
  buildCatalogHref,
  clearAllCatalogFilters,
  countActiveCatalogFilters,
  createDefaultCatalogState,
  filterAndSortCatalogOffers,
  getActiveFilterChips,
  parseCatalogSearchParams,
  resolveSelectedLocationFromParams,
  sliceCatalogBatch,
  summarizeCatalogResults,
} from './catalog-filters'

const bandungBaratCoords = { lat: -6.8167, lng: 107.6167 }

describe('parseCatalogSearchParams and buildCatalogHref', () => {
  test('parses valid multi-filter query parameters cleanly', () => {
    const state = parseCatalogSearchParams({
      q: '  Tomat Ceri  ',
      category: 'sayuran',
      condition: 'ripe_urgent,grade_b',
      minPrice: '5000',
      maxPrice: '15000',
      minStock: '50',
      radius: '25',
      pickup: '2026-11-26',
      deadline: '6h',
      dynamicOnly: 'true',
      province: 'jawa-barat',
      region: 'bandung-barat',
      sort: 'price_asc',
      view: 'grid',
    })

    expect(state).toEqual({
      q: 'Tomat Ceri',
      category: 'sayuran',
      conditions: ['ripe_urgent', 'grade_b'],
      minPrice: 5000,
      maxPrice: 15000,
      minStockKg: 50,
      radiusKm: '25',
      pickupDate: '2026-11-26',
      deadlineWindow: '6h',
      dynamicOnly: true,
      provinceId: 'jawa-barat',
      regionId: 'bandung-barat',
      sort: 'price_asc',
      view: 'grid',
    })
  })

  test('ignores malformed or unsafe parameters and locks fixed category', () => {
    const state = parseCatalogSearchParams(
      {
        category: 'sayuran',
        condition: ['invalid', 'surplus'],
        minPrice: '-100',
        maxPrice: 'NaN',
        minStock: '0',
        radius: '999',
        pickup: '26-11-2026',
        deadline: 'soon',
        province: '../admin',
        region: 'bandung-barat',
        sort: 'ai_magic',
        view: 'unknown',
      },
      'buah'
    )

    expect(state.category).toBe('buah')
    expect(state.conditions).toEqual(['surplus'])
    expect(state.minPrice).toBeNull()
    expect(state.maxPrice).toBeNull()
    expect(state.minStockKg).toBeNull()
    expect(state.radiusKm).toBeNull()
    expect(state.pickupDate).toBeNull()
    expect(state.deadlineWindow).toBe('semua')
    expect(state.provinceId).toBeNull()
    expect(state.regionId).toBeNull()
    expect(state.sort).toBe('nearest')
    expect(state.view).toBe('row')
  })

  test('builds clean URL omitting default values and redundant category param', () => {
    const defaultHref = buildCatalogHref(createDefaultCatalogState())
    expect(defaultHref).toBe('/pasar')

    const categoryHref = buildCatalogHref(
      {
        ...createDefaultCatalogState('sayuran'),
        conditions: ['grade_b'],
        sort: 'price_asc',
      },
      'sayuran'
    )
    expect(categoryHref).toBe('/pasar/sayuran?condition=grade_b&sort=price_asc')

    const gridHref = buildCatalogHref({
      ...createDefaultCatalogState(),
      view: 'grid',
    })
    expect(gridHref).toBe('/pasar?view=grid')
  })
})

describe('active filter chips and location resolution', () => {
  test('resolves known province and region and rejects unknown province', () => {
    expect(resolveSelectedLocationFromParams('jawa-barat', 'bandung-barat')).toEqual({
      provinceId: 'jawa-barat',
      regionId: 'bandung-barat',
      label: 'Bandung Barat (Lembang)',
    })

    expect(resolveSelectedLocationFromParams('jawa-barat', 'tidak-ada')).toEqual({
      provinceId: 'jawa-barat',
      regionId: null,
      label: 'Jawa Barat',
    })

    expect(resolveSelectedLocationFromParams('unknown-prov', null)).toBeNull()
  })

  test('builds removable chips and clears all filters without losing location or sort', () => {
    const state = {
      ...createDefaultCatalogState(),
      q: 'Mangga',
      category: 'buah',
      conditions: ['ripe_urgent'],
      minPrice: 8000,
      dynamicOnly: true,
      provinceId: 'jawa-barat',
      regionId: 'bandung-barat',
      sort: 'expiring',
      view: 'grid',
    }

    expect(countActiveCatalogFilters(state)).toBe(5)
    const chips = getActiveFilterChips(state)
    expect(chips.map((chip) => chip.key)).toEqual([
      'q',
      'category',
      'condition-ripe_urgent',
      'price',
      'dynamicOnly',
    ])

    const afterClear = clearAllCatalogFilters(state)
    expect(countActiveCatalogFilters(afterClear)).toBe(0)
    expect(afterClear.provinceId).toBe('jawa-barat')
    expect(afterClear.sort).toBe('expiring')
    expect(afterClear.view).toBe('grid')
  })
})

describe('filterAndSortCatalogOffers', () => {
  test('filters by category, search query, dynamic price, and radius', () => {
    const nowMs = Date.now()
    const state = {
      ...createDefaultCatalogState('sayuran'),
      radiusKm: '10',
      dynamicOnly: true,
    }

    const results = filterAndSortCatalogOffers(
      mockOffersData,
      state,
      bandungBaratCoords,
      nowMs,
      'sayuran'
    )

    expect(results.length).toBe(1)
    expect(results[0].offer.id).toBe('off-001')
    expect(results[0].distanceKm).toBe(0)
  })

  test('sorts by price_asc, stock_desc, and expiring accurately', () => {
    const nowMs = Date.now()
    const baseState = createDefaultCatalogState('sayuran')

    const byPrice = filterAndSortCatalogOffers(
      mockOffersData,
      { ...baseState, sort: 'price_asc' },
      bandungBaratCoords,
      nowMs,
      'sayuran'
    )
    expect(byPrice[0].offer.pricePerKg).toBeLessThanOrEqual(byPrice[1].offer.pricePerKg)

    const byStock = filterAndSortCatalogOffers(
      mockOffersData,
      { ...baseState, sort: 'stock_desc' },
      bandungBaratCoords,
      nowMs,
      'sayuran'
    )
    expect(byStock[0].offer.availableStockKg).toBeGreaterThanOrEqual(
      byStock[1].offer.availableStockKg
    )

    const byExpiring = filterAndSortCatalogOffers(
      mockOffersData,
      { ...baseState, sort: 'expiring' },
      bandungBaratCoords,
      nowMs,
      'sayuran'
    )
    expect(Date.parse(byExpiring[0].offer.orderDeadline)).toBeLessThanOrEqual(
      Date.parse(byExpiring[1].offer.orderDeadline)
    )

    const summary = summarizeCatalogResults(byPrice)
    expect(summary.count).toBe(4)
    expect(summary.totalAvailableStockKg).toBeGreaterThan(0)
  })

  test('slices catalog batches accurately and reports remaining items', () => {
    const sample = [1, 2, 3, 4, 5, 6, 7, 8]
    const firstBatch = sliceCatalogBatch(sample, 6)
    expect(firstBatch.visibleItems).toEqual([1, 2, 3, 4, 5, 6])
    expect(firstBatch.hasMore).toBe(true)
    expect(firstBatch.remainingCount).toBe(2)

    const fullBatch = sliceCatalogBatch(sample, 12)
    expect(fullBatch.visibleItems.length).toBe(8)
    expect(fullBatch.hasMore).toBe(false)
    expect(fullBatch.remainingCount).toBe(0)
  })
})
