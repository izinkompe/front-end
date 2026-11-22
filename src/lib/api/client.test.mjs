import { describe, expect, it } from 'bun:test'
import { z } from 'zod'
import { apiClient } from './client'
import { ApiError } from './errors'
import { OfferSchema } from '../../types/api/offers'

describe('apiClient with TanStack DB adapter', () => {
  it('fetches offers from TanStack DB in mock mode', async () => {
    const data = await apiClient('/api/offers', z.array(OfferSchema))
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)
    expect(data[0].id).toBe('off-001')
    expect(data[0].commodityName).toBe('Tomat Ceri Hidroponik')
  })

  it('fetches single offer by id with validated schema', async () => {
    const offer = await apiClient('/api/offers/off-001', OfferSchema)
    expect(offer.id).toBe('off-001')
    expect(offer.pricePerKg).toBe(14000)
    expect(offer.availableStockKg).toBeGreaterThan(0)
  })

  it('throws ApiError with NOT_FOUND for non-existent item', async () => {
    try {
      await apiClient('/api/offers/off-non-existent', OfferSchema)
      expect(true).toBe(false)
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)
      expect(error.status).toBe(404)
      expect(error.code).toBe('NOT_FOUND')
    }
  })

  it('throws ApiError with VALIDATION_ERROR when schema mismatch occurs', async () => {
    const StrictNumberSchema = z.object({
      id: z.number(),
    })
    try {
      await apiClient('/api/offers/off-001', StrictNumberSchema)
      expect(true).toBe(false)
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.status).toBe(500)
    }
  })
})
