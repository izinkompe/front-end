import { describe, expect, it } from 'bun:test'
import { validateTrustedVerificationUrl } from './verify-email-url'

describe('validateTrustedVerificationUrl', () => {
  const trustedBase = 'http://localhost:8000/api/v1'

  it('menerima URL signed dari origin dan path backend yang tepercaya', () => {
    const url =
      'http://localhost:8000/api/v1/auth/email/verify/12/hash123?expires=1700000000&signature=sig'
    const result = validateTrustedVerificationUrl(url, trustedBase)
    expect(result).toEqual({ ok: true, url })
  })

  it('menolak origin asing (anti-SSRF)', () => {
    const result = validateTrustedVerificationUrl(
      'https://evil.example.com/api/v1/auth/email/verify/12/hash123',
      trustedBase
    )
    expect(result.ok).toBe(false)
  })

  it('menolak protokol non-http/https', () => {
    const result = validateTrustedVerificationUrl('file:///etc/passwd', trustedBase)
    expect(result.ok).toBe(false)
  })

  it('menolak path yang bukan endpoint verifikasi email', () => {
    const result = validateTrustedVerificationUrl(
      'http://localhost:8000/api/v1/admin/users',
      trustedBase
    )
    expect(result.ok).toBe(false)
  })
})
