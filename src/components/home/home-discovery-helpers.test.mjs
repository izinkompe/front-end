import { describe, expect, test } from 'bun:test'
import {
  buildNeedDetailHref,
  buildProvinceMapHref,
  buildRegionMapHref,
  formatTargetDateLabel,
  getNearbyHarvestHubs,
  getNeedFulfillmentSummary,
  getNeedStatusMeta,
} from './home-discovery-helpers'

describe('nearby harvest hubs and map URL helpers', () => {
  test('returns selected region first and sorts remaining hubs by straight-line distance', () => {
    const hubs = getNearbyHarvestHubs(
      {
        provinceId: 'jawa-barat',
        regionId: 'bandung-barat',
        label: 'Bandung Barat (Lembang)',
      },
      6
    )

    expect(hubs).toHaveLength(6)
    expect(hubs[0].id).toBe('bandung-barat')
    expect(hubs[0].isSelectedLocation).toBe(true)
    expect(hubs[0].distanceKm).toBe(0)
    expect(hubs[0].href).toBe('/pasar?province=jawa-barat&region=bandung-barat&view=map')

    for (let i = 1; i < hubs.length; i++) {
      expect(hubs[i].distanceKm).toBeGreaterThanOrEqual(hubs[i - 1].distanceKm ?? 0)
    }
  })

  test('fills up to requested limit with nearest neighboring province hubs when province has fewer regions', () => {
    const hubs = getNearbyHarvestHubs(
      {
        provinceId: 'di-yogyakarta',
        regionId: 'sleman',
        label: 'Sleman',
      },
      6
    )

    expect(hubs).toHaveLength(6)
    expect(hubs[0].id).toBe('sleman')
    expect(hubs.some((hub) => hub.provinceId !== 'di-yogyakarta')).toBe(true)
  })

  test('validates map and need URLs and rejects unsafe slugs', () => {
    expect(buildRegionMapHref('jawa-barat', 'garut')).toBe(
      '/pasar?province=jawa-barat&region=garut&view=map'
    )
    expect(buildRegionMapHref('../evil', 'garut')).toBe('/pasar?view=map')
    expect(
      buildProvinceMapHref({
        provinceId: 'jawa-barat',
        regionId: null,
        label: 'Semua Jawa Barat',
      })
    ).toBe('/pasar?province=jawa-barat&view=map')
    expect(buildNeedDetailHref('need-001')).toBe('/papan-kebutuhan?request=need-001')
    expect(buildNeedDetailHref('https://evil.test')).toBe('/papan-kebutuhan')
  })
})

describe('needs board helpers', () => {
  test('computes fulfillment totals, remaining weight, and clamped percentage', () => {
    const summary = getNeedFulfillmentSummary({
      id: 'need-001',
      buyerId: 'usr-pb-01',
      buyerName: 'Ibu Ratna',
      organization: 'Dapur Umum Yayasan Kasih',
      commodityName: 'Beras Medium',
      category: 'Padi & Biji-bijian',
      neededQuantityKg: 250,
      maxPricePerKg: 13000,
      targetDate: '2026-11-28',
      targetArea: 'Coblong, Bandung',
      status: 'partially_fulfilled',
      responses: [
        {
          id: 'resp-1',
          farmerId: 'usr-pt-01',
          farmerName: 'Pak Joko',
          offerId: 'off-010',
          offeredQuantityKg: 150,
          offeredPricePerKg: 12200,
          availableDate: '2026-11-27',
          createdAt: '2026-11-26T00:00:00Z',
        },
        {
          id: 'resp-2',
          farmerId: 'usr-pt-05',
          farmerName: 'Pak Hendra',
          offerId: 'off-011',
          offeredQuantityKg: 50,
          offeredPricePerKg: 12500,
          availableDate: '2026-11-27',
          createdAt: '2026-11-26T01:00:00Z',
        },
      ],
      createdAt: '2026-11-25T00:00:00Z',
      updatedAt: '2026-11-26T01:00:00Z',
    })

    expect(summary).toEqual({
      offeredKg: 200,
      remainingKg: 50,
      responseCount: 2,
      percent: 80,
    })
  })

  test('handles empty responses and clamps over-fulfilled offers at 100 percent', () => {
    const empty = getNeedFulfillmentSummary({
      id: 'need-empty',
      buyerId: 'usr-pb-02',
      buyerName: 'Pak Budi',
      commodityName: 'Tomat',
      category: 'Sayuran',
      neededQuantityKg: 100,
      targetDate: '2026-11-28',
      targetArea: 'Cicendo, Bandung',
      status: 'open',
      responses: [],
      createdAt: '2026-11-26T00:00:00Z',
      updatedAt: '2026-11-26T00:00:00Z',
    })

    expect(empty).toEqual({
      offeredKg: 0,
      remainingKg: 100,
      responseCount: 0,
      percent: 0,
    })

    const over = getNeedFulfillmentSummary({
      id: 'need-over',
      buyerId: 'usr-pb-02',
      buyerName: 'Pak Budi',
      commodityName: 'Tomat',
      category: 'Sayuran',
      neededQuantityKg: 100,
      targetDate: '2026-11-28',
      targetArea: 'Cicendo, Bandung',
      status: 'fulfilled',
      responses: [
        {
          id: 'resp-over',
          farmerId: 'usr-pt-01',
          farmerName: 'Pak Joko',
          offerId: 'off-001',
          offeredQuantityKg: 140,
          offeredPricePerKg: 12000,
          availableDate: '2026-11-27',
          createdAt: '2026-11-26T00:00:00Z',
        },
      ],
      createdAt: '2026-11-26T00:00:00Z',
      updatedAt: '2026-11-26T00:00:00Z',
    })

    expect(over.percent).toBe(100)
    expect(over.remainingKg).toBe(0)
  })

  test('formats Indonesian target dates and status metadata', () => {
    expect(formatTargetDateLabel('2026-11-28')).toContain('2026')
    expect(formatTargetDateLabel('invalid-date')).toBe('invalid-date')
    expect(getNeedStatusMeta('open').isOpenForResponses).toBe(true)
    expect(getNeedStatusMeta('closed').isOpenForResponses).toBe(false)
  })
})
