import { describe, expect, it } from 'bun:test'
import {
  buildCheckoutHref,
  buildOrderTimelineSteps,
  formatOrderStatusLabel,
  getPaymentCountdownState,
  hasOfferPriceChanged,
  isSafeProofImageUrl,
  MAX_PAYMENT_PROOF_BYTES,
  parseCheckoutSearchParams,
  validateBuyerAddress,
  validateCheckoutContact,
  validatePaymentProofFile,
} from './checkout-helpers'

describe('checkout-helpers', () => {
  it('validates JPG/PNG proof file type and 5 MB limit', () => {
    expect(validatePaymentProofFile(null)).toContain('Pilih foto')
    expect(
      validatePaymentProofFile({ name: 'bukti.pdf', type: 'application/pdf', size: 1024 })
    ).toContain('JPG atau PNG')
    expect(
      validatePaymentProofFile({
        name: 'bukti.jpg',
        type: 'image/jpeg',
        size: MAX_PAYMENT_PROOF_BYTES + 1,
      })
    ).toContain('5 MB')
    expect(
      validatePaymentProofFile({ name: 'bukti.png', type: 'image/png', size: 256_000 })
    ).toBeNull()
  })

  it('validates single contact name and Indonesian phone number', () => {
    const invalid = validateCheckoutContact({ contactName: 'A', contactPhone: '12345' })
    expect(invalid.contactName).toBeDefined()
    expect(invalid.contactPhone).toBeDefined()

    const valid = validateCheckoutContact({
      contactName: 'Ibu Ratna Sari',
      contactPhone: '0812-3456-7890',
    })
    expect(valid).toEqual({})
  })

  it('parses and builds checkout search params cleanly', () => {
    const href = buildCheckoutHref({
      offerId: 'off-001',
      quantityKg: 12.5,
      slotId: 'slot-1',
      notes: 'Bawa keranjang sendiri',
      pricePerKg: 14000,
    })

    expect(href).toBe(
      '/pasar/checkout?offerId=off-001&qty=12.5&slotId=slot-1&notes=Bawa+keranjang+sendiri&price=14000'
    )

    const parsed = parseCheckoutSearchParams({
      offerId: 'off-001',
      qty: '12,500',
      slotId: 'slot-1',
      notes: 'Bawa keranjang sendiri',
      price: '14000',
    })

    expect(parsed).toEqual({
      offerId: 'off-001',
      quantityText: '12.500',
      slotId: 'slot-1',
      notes: 'Bawa keranjang sendiri',
      expectedPricePerKg: 14000,
    })
  })

  it('detects dynamic price changes between detail and checkout', () => {
    expect(hasOfferPriceChanged(null, 14000)).toBe(false)
    expect(hasOfferPriceChanged(14000, 14000)).toBe(false)
    expect(hasOfferPriceChanged(15000, 14000)).toBe(true)
  })

  it('computes payment countdown urgency and expiry state', () => {
    const now = Date.parse('2026-11-26T10:00:00Z')
    const urgent = getPaymentCountdownState('2026-11-26T10:05:30Z', now)
    expect(urgent.isExpired).toBe(false)
    expect(urgent.isUrgent).toBe(true)
    expect(urgent.label).toBe('5 menit 30 detik')

    const expired = getPaymentCountdownState('2026-11-26T09:59:00Z', now)
    expect(expired.isExpired).toBe(true)
    expect(expired.label).toBe('Waktu habis')
  })

  it('formats order status labels and filters unsafe proof URLs', () => {
    expect(formatOrderStatusLabel('pending_payment', 'Nominal tidak sesuai')).toBe(
      'Perlu unggah ulang bukti'
    )
    expect(formatOrderStatusLabel('payment_submitted')).toBe('Menunggu verifikasi')

    expect(isSafeProofImageUrl('javascript:alert(1)')).toBeNull()
    expect(isSafeProofImageUrl('data:image/svg+xml;base64,PHN2Zz4=')).toBeNull()
    expect(isSafeProofImageUrl('data:image/png;base64,iVBORw0KGgo=')).toBe(
      'data:image/png;base64,iVBORw0KGgo='
    )
  })

  it('validates buyer address fields cleanly', () => {
    const invalid = validateBuyerAddress({ label: 'A', areaName: 'Bd', fullAddress: 'Jl 1' })
    expect(invalid.label).toBeDefined()
    expect(invalid.areaName).toBeDefined()
    expect(invalid.fullAddress).toBeDefined()

    const valid = validateBuyerAddress({
      label: 'Dapur Cabang',
      areaName: 'Coblong, Bandung',
      fullAddress: 'Jl. Dago Pojok No. 18, Bandung',
    })
    expect(valid).toEqual({})
  })

  it('builds cancelled and submitted order timelines accurately', () => {
    const cancelledSteps = buildOrderTimelineSteps({
      status: 'cancelled',
      createdAt: '2026-11-26T10:00:00Z',
      updatedAt: '2026-11-26T10:05:00Z',
    })
    expect(cancelledSteps.map((step) => step.state)).toEqual(['completed', 'cancelled'])

    const submittedSteps = buildOrderTimelineSteps({
      status: 'payment_submitted',
      createdAt: '2026-11-26T10:00:00Z',
      paymentSubmittedAt: '2026-11-26T10:04:00Z',
      updatedAt: '2026-11-26T10:04:00Z',
    })
    expect(submittedSteps[1].state).toBe('current')
    expect(submittedSteps[1].label).toBe('Menunggu verifikasi admin')
  })
})
