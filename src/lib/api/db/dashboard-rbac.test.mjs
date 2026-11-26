import { describe, expect, it } from 'bun:test'
import { tanstackDbAdapter } from './adapter'

describe('dashboard strict auth and RBAC endpoints', () => {
  it('authenticates all 3 admin accounts and enforces admin-only endpoints', async () => {
    await tanstackDbAdapter.dispatch('/api/auth/logout', { method: 'POST' })
    await expect(
      tanstackDbAdapter.dispatch('/api/admin/stats/distribution', { method: 'GET' })
    ).rejects.toThrow()

    const adminCredentials = [
      ['admin@pangantani.id', 'AdminPangan2026!'],
      ['rina.verifikator@pangantani.id', 'Verifikasi2026!'],
      ['bagas.audit@pangantani.id', 'Moderasi2026!'],
    ]

    for (const [email, password] of adminCredentials) {
      const login = await tanstackDbAdapter.dispatch('/api/auth/login-admin', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      expect(login.user.role).toBe('admin')
    }

    const farmers = await tanstackDbAdapter.dispatch('/api/admin/farmers', { method: 'GET' })
    expect(farmers.length).toBeGreaterThanOrEqual(3)

    const offers = await tanstackDbAdapter.dispatch('/api/admin/offers', { method: 'GET' })
    expect(offers.length).toBeGreaterThan(0)

    const users = await tanstackDbAdapter.dispatch('/api/admin/users', { method: 'GET' })
    expect(users.length).toBeGreaterThanOrEqual(6)

    const factors = await tanstackDbAdapter.dispatch('/api/admin/stats/carbon-factors', {
      method: 'GET',
    })
    expect(factors.length).toBeGreaterThan(0)

    await expect(
      tanstackDbAdapter.dispatch('/api/farmer/offers', { method: 'GET' })
    ).rejects.toThrow()
  })

  it('authenticates all 3 farmer accounts and isolates farmer data from admin endpoints', async () => {
    const farmerCredentials = [
      ['joko@suburmakmur.id', 'PetaniJoko2026!'],
      ['sumarni@tanibarokah.id', 'PetaniSumarni2026!'],
      ['dedi@tanimudagarut.id', 'PetaniDedi2026!'],
    ]

    for (const [email, password] of farmerCredentials) {
      const login = await tanstackDbAdapter.dispatch('/api/auth/login-farmer', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      expect(login.user.role).toBe('farmer')
    }

    const farmerOffers = await tanstackDbAdapter.dispatch('/api/farmer/offers', { method: 'GET' })
    expect(Array.isArray(farmerOffers)).toBe(true)

    const farmerOrders = await tanstackDbAdapter.dispatch('/api/orders', { method: 'GET' })
    expect(Array.isArray(farmerOrders)).toBe(true)

    await expect(
      tanstackDbAdapter.dispatch('/api/admin/users', { method: 'GET' })
    ).rejects.toThrow()

    await tanstackDbAdapter.dispatch('/api/auth/logout', { method: 'POST' })
  })
})
