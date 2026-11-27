import { describe, expect, it } from 'bun:test'
import { OfferDetailResponseSchema, OfferListResponseSchema } from './offer-response'

describe('offer response schemas', () => {
  it('normalizes Laravel paginated /offers response', () => {
    const payload = {
      current_page: 1,
      data: [
        {
          id: 42,
          farmer_id: 9,
          name: 'Tomat Ceri Segar',
          commodity: 'sayuran',
          condition: 'surplus',
          surplus_reason: 'Panen melimpah',
          harvest_date: '2026-11-27',
          stock_g: 15000,
          reserved_g: 2000,
          withheld_g: 1000,
          price_per_kg: 16000,
          catalog_price: 14000,
          closes_at: '2026-11-28T10:00:00.000000Z',
          status: 'active',
          area: 'Sleman',
          latitude: '-7.7155600',
          longitude: '110.3555600',
          slots: [
            {
              id: 5,
              starts_at: '2026-11-28T08:00:00.000000Z',
              ends_at: '2026-11-28T11:00:00.000000Z',
              active: true,
            },
          ],
          photos: [{ path: '/storage/offers/tomat.jpg' }],
          created_at: '2026-11-27T07:00:00.000000Z',
          updated_at: '2026-11-27T07:00:00.000000Z',
        },
      ],
    }

    const parsed = OfferListResponseSchema.parse(payload)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].id).toBe('42')
    expect(parsed[0].farmerId).toBe('9')
    expect(parsed[0].commodityName).toBe('Tomat Ceri Segar')
    expect(parsed[0].availableStockKg).toBe(12)
    expect(parsed[0].pricePerKg).toBe(14000)
    expect(parsed[0].photos).toEqual(['/storage/offers/tomat.jpg'])
    expect(parsed[0].pickupScheduleSlots[0]).toEqual({
      id: '5',
      date: '2026-11-28',
      startTime: '08:00',
      endTime: '11:00',
      isAvailable: true,
    })
  })

  it('normalizes Laravel /offers/:id envelope and rejects invalid payloads', () => {
    const detailPayload = {
      offer: {
        id: 1,
        farmer_id: 2,
        name: 'Cabai Merah',
        stock_g: 5000,
        reserved_g: 0,
        price_per_kg: 30000,
        status: 'active',
        created_at: '2026-11-27T07:00:00.000000Z',
        updated_at: '2026-11-27T07:00:00.000000Z',
      },
      similar: [],
    }

    const parsed = OfferDetailResponseSchema.parse(detailPayload)
    expect(parsed.id).toBe('1')
    expect(parsed.commodityName).toBe('Cabai Merah')
    expect(OfferListResponseSchema.safeParse({ invalid: true }).success).toBe(false)
  })
})
