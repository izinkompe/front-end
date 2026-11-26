import { describe, expect, test } from 'bun:test'
import { tanstackDbAdapter } from './adapter'

describe('profile and address endpoints in tanstackDbAdapter', () => {
  test('updates user profile, verifies phone, and manages addresses for logged-in buyer', async () => {
    await tanstackDbAdapter.dispatch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'ratna@dapurkasih.org',
        password: 'password123',
      }),
    })

    const updatedProfile = await tanstackDbAdapter.dispatch('/api/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        name: 'Ibu Ratna Dewi',
        organization: 'Dapur Kasih Bandung',
        phone: '081299887766',
      }),
    })

    expect(updatedProfile.name).toBe('Ibu Ratna Dewi')
    expect(updatedProfile.organization).toBe('Dapur Kasih Bandung')
    expect(updatedProfile.phone).toBe('081299887766')
    expect(updatedProfile.isPhoneVerified).toBe(false)

    const verifiedProfile = await tanstackDbAdapter.dispatch('/api/profile/verify-phone', {
      method: 'POST',
      body: JSON.stringify({
        phone: '081299887766',
        otpCode: '123456',
      }),
    })

    expect(verifiedProfile.isPhoneVerified).toBe(true)

    const withSecondAddress = await tanstackDbAdapter.dispatch('/api/auth/addresses', {
      method: 'POST',
      body: JSON.stringify({
        label: 'Gudang Selatan',
        areaName: 'Buahbatu, Bandung',
        fullAddress: 'Jl. Terusan Buahbatu No. 99, Bandung',
        setAsDefault: false,
      }),
    })

    const addedAddress = withSecondAddress.addresses?.find(
      (item) => item.label === 'Gudang Selatan'
    )
    expect(addedAddress).toBeDefined()

    const afterDelete = await tanstackDbAdapter.dispatch(
      `/api/auth/addresses/${addedAddress?.id}`,
      {
        method: 'DELETE',
      }
    )

    expect(afterDelete.addresses?.some((item) => item.id === addedAddress?.id)).toBe(false)

    await tanstackDbAdapter.dispatch('/api/auth/logout', { method: 'POST' })
  })
})
