import { describe, expect, test } from 'bun:test'
import {
  buildCommodityDirectory,
  getHeroSearchSuggestions,
  splitHighlightSegments,
} from './hero-search-suggestions'

const sampleOffers = [
  {
    id: 'off-001',
    farmerId: 'frm-1',
    farmerName: 'Kebun Lembang Lestari (Pak Dedi)',
    commodityName: 'Tomat Ceri Organik',
    category: 'Sayuran',
    condition: 'surplus',
    harvestDate: '2026-11-26',
    availableStockKg: 45,
    reservedStockKg: 5,
    soldStockKg: 10,
    pricePerKg: 14000,
    orderDeadline: '2026-11-26T18:00:00Z',
    pickupAddressArea: 'Lembang, Bandung Barat',
    pickupScheduleSlots: [],
    photos: [],
    status: 'active',
    createdAt: '2026-11-25T10:00:00Z',
    updatedAt: '2026-11-25T10:00:00Z',
  },
  {
    id: 'off-002',
    farmerId: 'frm-2',
    farmerName: 'Tani Subur Ciwidey',
    commodityName: 'Mangga Gedong Gincu',
    category: 'Buah',
    condition: 'ripe_urgent',
    harvestDate: '2026-11-26',
    availableStockKg: 0,
    reservedStockKg: 0,
    soldStockKg: 30,
    pricePerKg: 18000,
    orderDeadline: '2026-11-26T18:00:00Z',
    pickupAddressArea: 'Ciwidey, Kab. Bandung',
    pickupScheduleSlots: [],
    photos: [],
    status: 'sold_out',
    createdAt: '2026-11-25T10:00:00Z',
    updatedAt: '2026-11-25T10:00:00Z',
  },
]

describe('hero-search-suggestions', () => {
  test('returns empty lists for blank query', () => {
    const result = getHeroSearchSuggestions('   ', sampleOffers)
    expect(result).toEqual({
      normalizedQuery: '',
      commodities: [],
      offers: [],
    })
  })

  test('matches commodity types and active stocked offers case-insensitively', () => {
    const result = getHeroSearchSuggestions('tomat', sampleOffers)
    expect(result.normalizedQuery).toBe('tomat')
    expect(result.commodities.some((item) => item.label === 'Tomat ceri')).toBe(true)
    expect(result.commodities.some((item) => item.label === 'Tomat Ceri Organik')).toBe(true)
    expect(result.offers).toHaveLength(1)
    expect(result.offers[0]).toEqual({
      id: 'off-001',
      title: 'Tomat Ceri Organik - Kebun Lembang Lestari',
      subtitle: 'Lembang, Bandung Barat · 45 kg',
      href: '/pasar/penawaran/off-001',
    })
  })

  test('excludes sold_out or zero-stock offers from offer suggestions', () => {
    const result = getHeroSearchSuggestions('mangga', sampleOffers)
    expect(result.commodities.some((item) => item.label === 'Mangga')).toBe(true)
    expect(result.offers).toHaveLength(0)
  })

  test('matches offers by pickup area context', () => {
    const result = getHeroSearchSuggestions('Bandung', sampleOffers)
    expect(result.offers).toHaveLength(1)
    expect(result.offers[0].id).toBe('off-001')
  })

  test('deduplicates commodity directory entries across categories and offers', () => {
    const directory = buildCommodityDirectory(sampleOffers)
    const lowerLabels = directory.map((item) => item.label.toLowerCase())
    expect(new Set(lowerLabels).size).toBe(lowerLabels.length)
  })

  test('splits highlight segments safely without regex interpretation', () => {
    const segments = splitHighlightSegments('Tomat Ceri - Kebun Bandung', 'bandung')
    expect(segments).toEqual([
      { text: 'Tomat Ceri - Kebun ', matched: false },
      { text: 'Bandung', matched: true },
    ])
  })
})
