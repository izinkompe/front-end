import { describe, expect, test } from 'bun:test'
import {
  formatHarvestAgeLabel,
  formatPickupSlotLabel,
  getDynamicPriceScheduleSteps,
  getRelatedOffers,
  getSafeOfferPhotoUrls,
  getWeightPresetsKg,
  parseWeightInputKg,
  validateOrderWeightKg,
} from './offer-detail-helpers'

function createOffer(overrides = {}) {
  return {
    id: 'off-test',
    farmerId: 'usr-pt-01',
    farmerName: 'Pak Joko',
    commodityName: 'Tomat Ceri',
    category: 'Sayuran',
    condition: 'grade_b',
    harvestDate: '2026-11-26T00:00:00Z',
    availableStockKg: 40,
    reservedStockKg: 5,
    soldStockKg: 20,
    pricePerKg: 12000,
    orderDeadline: '2026-11-26T18:00:00Z',
    pickupAddressArea: 'Lembang, Bandung Barat',
    latitude: -6.8167,
    longitude: 107.6167,
    pickupScheduleSlots: [
      { id: 'slot-1', date: '2026-11-26', startTime: '14:00', endTime: '17:00', isAvailable: true },
    ],
    photos: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=640'],
    status: 'active',
    createdAt: '2026-11-26T00:00:00Z',
    updatedAt: '2026-11-26T00:00:00Z',
    ...overrides,
  }
}

describe('offer-detail-helpers', () => {
  test('filters and deduplicates safe photo URLs', () => {
    const urls = getSafeOfferPhotoUrls([
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=640',
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=640',
      '/images/commodities/tomat.webp',
      'https://evil.example.com/payload.jpg',
      'javascript:alert(1)',
    ])
    expect(urls).toEqual([
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=640',
      '/images/commodities/tomat.webp',
    ])
  })

  test('parses and validates weight input with 0.001 kg precision', () => {
    expect(parseWeightInputKg('12,375')).toBe(12.375)
    expect(parseWeightInputKg('5')).toBe(5)
    expect(parseWeightInputKg('1.2345')).toBeNull()
    expect(parseWeightInputKg('-2')).toBeNull()
    expect(parseWeightInputKg('')).toBeNull()

    expect(validateOrderWeightKg(12.5, 30)).toBeNull()
    expect(validateOrderWeightKg(0, 30)).toContain('minimal')
    expect(validateOrderWeightKg(35, 30)).toContain('melebihi stok')
    expect(validateOrderWeightKg(null, 30)).toContain('Masukkan berat')
  })

  test('generates weight presets bounded by available stock', () => {
    expect(getWeightPresetsKg(30)).toEqual([1, 5, 10, 25])
    expect(getWeightPresetsKg(8)).toEqual([1, 5])
    expect(getWeightPresetsKg(0.75)).toEqual([0.75])
    expect(getWeightPresetsKg(0)).toEqual([])
  })

  test('builds dynamic price stages with passed, current, and upcoming status', () => {
    const stages = getDynamicPriceScheduleSteps(14000, {
      startPrice: 16000,
      minPrice: 12000,
      dropIntervalHours: 6,
      dropAmount: 1000,
    })

    expect(stages.map((s) => s.pricePerKg)).toEqual([16000, 15000, 14000, 13000, 12000])
    expect(stages[0].status).toBe('passed')
    expect(stages[2].status).toBe('current')
    expect(stages[4].status).toBe('upcoming')
  })

  test('formats harvest age and pickup schedule slot', () => {
    const nowMs = Date.parse('2026-11-26T10:00:00Z')
    expect(formatHarvestAgeLabel('2026-11-26T00:00:00Z', nowMs)).toBe('Dipanen 10 jam lalu')
    expect(
      formatPickupSlotLabel({
        id: 's1',
        date: '2026-11-26',
        startTime: '13:00',
        endTime: '16:00',
      })
    ).toContain('13.00–16.00')
  })

  test('selects active related offers prioritizing same category and nearest distance', () => {
    const baseNow = Date.parse('2026-11-26T10:00:00Z')
    const current = createOffer({ id: 'off-1', category: 'Sayuran' })
    const sameCatFar = createOffer({
      id: 'off-2',
      category: 'Sayuran',
      latitude: -7.1667,
      longitude: 107.5667,
    })
    const sameCatNear = createOffer({
      id: 'off-3',
      category: 'Sayuran',
      latitude: -6.82,
      longitude: 107.61,
    })
    const otherCat = createOffer({ id: 'off-4', category: 'Buah' })
    const expired = createOffer({
      id: 'off-5',
      category: 'Sayuran',
      orderDeadline: '2026-11-26T09:00:00Z',
    })

    const related = getRelatedOffers(
      current,
      [current, otherCat, sameCatFar, sameCatNear, expired],
      { lat: -6.8167, lng: 107.6167 },
      baseNow
    )

    expect(related.map((item) => item.offer.id)).toEqual(['off-3', 'off-2', 'off-4'])
  })
})
