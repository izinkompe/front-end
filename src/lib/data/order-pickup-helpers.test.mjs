import { describe, expect, it } from 'bun:test'
import {
  analyzeWeightDiscrepancy,
  buildPickupMapsHref,
  buildPickupSummaryText,
  validateActualWeightKg,
} from './order-pickup-helpers'

describe('order-pickup-helpers', () => {
  it('validates actual received weight and analyzes weight discrepancies accurately', () => {
    expect(validateActualWeightKg(null)).toContain('kg')
    expect(validateActualWeightKg(0)).toContain('0,001 kg')
    expect(validateActualWeightKg(10.125)).toBeNull()

    const exact = analyzeWeightDiscrepancy(20, 20, 12000)
    expect(exact.hasDiscrepancy).toBe(false)
    expect(exact.estimatedShortageRefund).toBe(0)

    const shortage = analyzeWeightDiscrepancy(20, 17.5, 12000)
    expect(shortage.hasDiscrepancy).toBe(true)
    expect(shortage.isShortage).toBe(true)
    expect(shortage.absDifferenceKg).toBe(2.5)
    expect(shortage.estimatedShortageRefund).toBe(30000)

    const surplus = analyzeWeightDiscrepancy(20, 21.25, 12000)
    expect(surplus.hasDiscrepancy).toBe(true)
    expect(surplus.isSurplus).toBe(true)
    expect(surplus.estimatedShortageRefund).toBe(0)
  })

  it('builds safe external maps links and pickup summary text', () => {
    expect(buildPickupMapsHref(200, 107)).toBeNull()
    expect(buildPickupMapsHref(-6.8167, 107.6167)).toBe(
      'https://www.google.com/maps/search/?api=1&query=-6.816700%2C107.616700'
    )

    const summary = buildPickupSummaryText(
      {
        id: 'ord-001',
        commodityName: 'Tomat Ceri',
        quantityKg: 15,
        scheduleSlot: {
          id: 'slot-1',
          date: '2026-11-26',
          startTime: '08:00',
          endTime: '10:00',
          isAvailable: true,
        },
        farmerName: 'Pak Joko',
        pickupLocation: {
          address: 'Jl. Raya Maribaya No. 45, Lembang',
          latitude: -6.8167,
          longitude: 107.6167,
          notes: 'Masuk gang sebelah KUD',
        },
        buyerContactName: 'Ibu Ratna',
        buyerOrganization: 'Dapur Umum Yayasan Kasih',
        buyerContactPhone: '081234567890',
      },
      { includeOrganization: false }
    )

    expect(summary).toContain('ord-001')
    expect(summary).toContain('Tomat Ceri')
    expect(summary).toContain('Jl. Raya Maribaya No. 45, Lembang')
    expect(summary).not.toContain('Dapur Umum Yayasan Kasih')
  })
})
