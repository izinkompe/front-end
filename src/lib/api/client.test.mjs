import { describe, expect, it } from 'bun:test'
import { z } from 'zod'
import { apiClient, parseResponseBody } from './client'
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

  it('rejects endpoints not starting with slash to prevent traversal', async () => {
    try {
      await apiClient('api/offers')
      expect(true).toBe(false)
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)
      expect(error.status).toBe(400)
      expect(error.code).toBe('INVALID_ENDPOINT')
    }
  })

  it('rejects protocol-relative endpoints to prevent SSRF', async () => {
    try {
      await apiClient('//evil.attacker.com/api/steal')
      expect(true).toBe(false)
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)
      expect(error.status).toBe(400)
      expect(error.code).toBe('INVALID_ENDPOINT')
    }
  })

  it('rejects absolute external urls to prevent open redirect', async () => {
    try {
      await apiClient('https://evil.attacker.com/api/data')
      expect(true).toBe(false)
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)
      expect(error.status).toBe(400)
      expect(error.code).toBe('INVALID_ENDPOINT')
    }
  })

  it('handles 204 No Content and empty response bodies without JSON SyntaxError', async () => {
    expect(await parseResponseBody(new Response(null, { status: 204 }))).toBeUndefined()
    expect(await parseResponseBody(new Response('', { status: 200 }))).toBeUndefined()
    expect(
      await parseResponseBody(new Response(JSON.stringify({ ok: true }), { status: 200 }))
    ).toEqual({
      ok: true,
    })
  })
})
