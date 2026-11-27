import { describe, expect, it } from 'bun:test'
import { AuthMeResponseSchema, AuthSessionResponseSchema } from './auth-response'

describe('auth response schemas', () => {
  it('normalizes backend /me envelope with snake_case user, addresses, and verification', () => {
    const payload = {
      user: {
        id: 7,
        name: 'Budi Santoso',
        email: 'budi@example.com',
        email_verified_at: null,
        role: 'farmer',
        phone: null,
        organization: null,
        preferences: { high_contrast: false, text_scale: 1 },
        created_at: '2026-11-27T07:00:00.000000Z',
        updated_at: '2026-11-27T07:00:00.000000Z',
      },
      addresses: [
        {
          id: 3,
          label: 'Kebun Utama',
          address: 'Jl. Melati No. 12',
          area: 'Sleman, DI Yogyakarta',
          latitude: '-7.7155600',
          longitude: '110.3555600',
          instructions: 'Masuk gang sebelah balai desa',
        },
      ],
      verification: {
        status: 'approved',
      },
    }

    const parsed = AuthMeResponseSchema.parse(payload)
    expect(parsed).not.toBeNull()
    expect(parsed?.id).toBe('7')
    expect(parsed?.phone).toBe('')
    expect(parsed?.isEmailVerified).toBe(false)
    expect(parsed?.emailVerifiedAt).toBeUndefined()
    expect(parsed?.isVerifiedFarmer).toBe(true)
    expect(parsed?.addresses?.[0]).toEqual({
      id: '3',
      label: 'Kebun Utama',
      fullAddress: 'Jl. Melati No. 12',
      areaName: 'Sleman, DI Yogyakarta',
      latitude: -7.71556,
      longitude: 110.35556,
      isDefault: true,
      notes: 'Masuk gang sebelah balai desa',
    })
  })

  it('accepts null for unauthenticated /me responses and valid camelCase mock user', () => {
    expect(AuthMeResponseSchema.parse(null)).toBeNull()

    const mockUser = {
      id: 'usr-pb-01',
      name: 'Ibu Ratna',
      email: 'ratna@example.com',
      phone: '081234567890',
      role: 'buyer',
      createdAt: '2026-11-27T00:00:00.000Z',
      updatedAt: '2026-11-27T00:00:00.000Z',
    }
    const parsed = AuthMeResponseSchema.parse(mockUser)
    expect(parsed?.id).toBe('usr-pb-01')
    expect(parsed?.role).toBe('buyer')
  })

  it('normalizes backend login session payload and rejects malformed payloads', () => {
    const loginPayload = {
      token: 'plain-text-token',
      token_type: 'Bearer',
      expires_in: 86400,
      user: {
        id: 12,
        name: 'Sari Pembeli',
        email: 'sari@example.com',
        email_verified_at: '2026-11-27T07:00:00.000000Z',
        role: 'buyer',
        phone: null,
        created_at: '2026-11-27T07:00:00.000000Z',
        updated_at: '2026-11-27T07:00:00.000000Z',
      },
    }

    const parsed = AuthSessionResponseSchema.parse(loginPayload)
    expect(parsed.token).toBe('plain-text-token')
    expect(parsed.user.id).toBe('12')
    expect(parsed.user.isEmailVerified).toBe(true)

    expect(AuthMeResponseSchema.safeParse({ unexpected: true }).success).toBe(false)
    expect(AuthSessionResponseSchema.safeParse({ token: 'abc' }).success).toBe(false)
  })
})
