import { describe, expect, test } from 'bun:test'
import {
  buildExpiringCatalogHref,
  buildOfferDetailHref,
  calculateStraightLineDistanceKm,
  formatFarmerDisplayName,
  formatNextPickupSlot,
  formatPricePerKg,
  formatStraightLineDistance,
  formatWeightKg,
  getDynamicPriceSummary,
  getLocationCoordinates,
  getOfferCountdownState,
} from './offer-card-helpers'

describe('straight-line distance helpers', () => {
  test('resolves coordinates for selected region and province fallback', () => {
    expect(
      getLocationCoordinates({
        provinceId: 'jawa-barat',
        regionId: 'bandung-barat',
        label: 'Bandung Barat (Lembang)',
      })
    ).toEqual({ lat: -6.8167, lng: 107.6167 })

    expect(
      getLocationCoordinates({
        provinceId: 'jawa-barat',
        regionId: null,
        label: 'Semua Jawa Barat',
      })
    ).toEqual({ lat: -6.8167, lng: 107.6167 })

    expect(
      getLocationCoordinates({
        provinceId: 'tidak-ada',
        regionId: null,
        label: 'Unknown',
      })
    ).toBeNull()
  })

  test('calculates Haversine straight-line distance in kilometers', () => {
    const lembang = { lat: -6.8167, lng: 107.6167 }
    const pangalengan = { lat: -7.1667, lng: 107.5667 }

    expect(calculateStraightLineDistanceKm(lembang, lembang)).toBe(0)
    const distance = calculateStraightLineDistanceKm(lembang, pangalengan)
    expect(distance).toBeGreaterThan(38)
    expect(distance).toBeLessThan(41)
  })

  test('formats distance label transparently', () => {
    expect(formatStraightLineDistance(0.4)).toBe('< 1 km')
    expect(formatStraightLineDistance(4.2)).toBe('~4,2 km')
    expect(formatStraightLineDistance(39.3)).toBe('~39,3 km')
  })
})

describe('getOfferCountdownState', () => {
  const baseNow = Date.parse('2026-11-26T08:00:00Z')

  test('marks expired deadline as locked', () => {
    const state = getOfferCountdownState('2026-11-26T08:00:00Z', baseNow)
    expect(state.isExpired).toBe(true)
    expect(state.urgency).toBe('expired')
    expect(state.label).toBe('Batas pesan berakhir')
  })

  test('marks under 3 hours as critical with seconds precision', () => {
    const state = getOfferCountdownState('2026-11-26T09:42:18Z', baseNow)
    expect(state.isExpired).toBe(false)
    expect(state.urgency).toBe('critical')
    expect(state.label).toBe('01j 42m 18d')
  })

  test('marks between 3 and 6 hours as soon', () => {
    const state = getOfferCountdownState('2026-11-26T12:15:05Z', baseNow)
    expect(state.isExpired).toBe(false)
    expect(state.urgency).toBe('soon')
    expect(state.label).toBe('04j 15m 05d')
  })

  test('formats 6+ hours without seconds jitter', () => {
    const state = getOfferCountdownState('2026-11-26T16:30:00Z', baseNow)
    expect(state.isExpired).toBe(false)
    expect(state.urgency).toBe('normal')
    expect(state.label).toBe('8j 30m lagi')
  })
})

describe('pricing, weight, pickup, and URL helpers', () => {
  test('formats dynamic price summary with dropped price and rule hint', () => {
    const summary = getDynamicPriceSummary(14000, {
      startPrice: 16000,
      minPrice: 12000,
      dropIntervalHours: 6,
      dropAmount: 1000,
    })

    expect(summary.hasDynamicRule).toBe(true)
    expect(summary.hasDropped).toBe(true)
    expect(summary.originalPriceFormatted).toBe('Rp 16.000')
    expect(summary.scheduleHint).toBe('Turun Rp 1.000 / 6 jam')
  })

  test('returns clean summary when no dynamic rule exists', () => {
    const summary = getDynamicPriceSummary(11000)
    expect(summary).toEqual({
      hasDynamicRule: false,
      hasDropped: false,
      originalPriceFormatted: null,
      scheduleHint: null,
    })
  })

  test('formats IDR/kg, weight up to 3 decimals, farmer name, and pickup slot', () => {
    expect(formatPricePerKg(14000)).toBe('Rp 14.000/kg')
    expect(formatWeightKg(85)).toBe('85 kg')
    expect(formatWeightKg(145.5)).toBe('145,5 kg')
    expect(formatWeightKg(12.375)).toBe('12,375 kg')
    expect(formatFarmerDisplayName('Pak Joko (Kelompok Tani Subur Makmur)')).toBe('Pak Joko')
    expect(
      formatNextPickupSlot([
        {
          id: 'slot-1',
          date: '2026-11-26',
          startTime: '13:00',
          endTime: '16:00',
          isAvailable: true,
        },
      ])
    ).toContain('13.00-16.00')
  })

  test('validates offer detail URL and rejects unsafe IDs', () => {
    expect(buildOfferDetailHref('off-001')).toBe('/pasar/penawaran/off-001')
    expect(buildOfferDetailHref('../admin')).toBe('/pasar')
    expect(buildOfferDetailHref('https://evil.test')).toBe('/pasar')
    expect(buildOfferDetailHref('')).toBe('/pasar')
  })

  test('builds expiring catalog URL scoped to selected location', () => {
    expect(
      buildExpiringCatalogHref({
        provinceId: 'jawa-barat',
        regionId: 'bandung-barat',
        label: 'Bandung Barat (Lembang)',
      })
    ).toBe('/pasar?sort=expiring&province=jawa-barat&region=bandung-barat')
  })
})
