import { describe, expect, test } from 'bun:test'
import {
  calculateProfileCompletion,
  filterAccountOrders,
  filterAccountTransactions,
  formatUserRoleLabel,
  getUserInitials,
  isSafeAvatarUrl,
  validateProfileFormInput,
} from './profile-helpers'

const baseUser = {
  id: 'usr-pb-01',
  name: 'Ibu Ratna',
  email: 'ratna@dapurkasih.org',
  phone: '081234567890',
  role: 'buyer',
  organization: 'Dapur Umum Yayasan Kasih',
  addresses: [
    {
      id: 'addr-01',
      label: 'Dapur Utama',
      fullAddress: 'Jl. Babakan Siliwangi No. 12',
      areaName: 'Coblong, Bandung',
      latitude: -6.8856,
      longitude: 107.6111,
      isDefault: true,
    },
  ],
  createdAt: '2026-11-01T10:00:00Z',
  updatedAt: '2026-11-01T10:00:00Z',
}

const sampleOrders = [
  {
    id: 'ord-101',
    buyerId: 'usr-pb-01',
    farmerId: 'usr-pt-01',
    farmerName: 'Pak Joko',
    offerId: 'off-1',
    commodityName: 'Tomat Segar Panen Lembang',
    quantityKg: 25,
    pricePerKg: 7000,
    totalPrice: 175000,
    scheduleSlot: { id: 'slot-1', date: '2026-11-26', startTime: '08:00', endTime: '10:00' },
    paymentDeadline: '2026-11-26T12:00:00Z',
    status: 'pending_payment',
    pickupLocation: { address: 'Lembang', latitude: -6.8167, longitude: 107.6167 },
    createdAt: '2026-11-26T09:00:00Z',
    updatedAt: '2026-11-26T09:00:00Z',
  },
  {
    id: 'ord-102',
    buyerId: 'usr-pb-01',
    farmerId: 'usr-pt-01',
    farmerName: 'Pak Joko',
    offerId: 'off-2',
    commodityName: 'Wortel Organik Cipanas',
    quantityKg: 15,
    pricePerKg: 8000,
    totalPrice: 120000,
    scheduleSlot: { id: 'slot-2', date: '2026-11-20', startTime: '09:00', endTime: '11:00' },
    paymentDeadline: '2026-11-20T08:00:00Z',
    status: 'completed',
    pickupLocation: { address: 'Cipanas', latitude: -6.7333, longitude: 107.0333 },
    createdAt: '2026-11-19T09:00:00Z',
    updatedAt: '2026-11-20T11:30:00Z',
  },
]

describe('profile helpers', () => {
  test('calculates profile completion accurately for complete and partial profiles', () => {
    const complete = calculateProfileCompletion(baseUser)
    expect(complete.percentage).toBe(100)
    expect(complete.completedCount).toBe(5)
    expect(complete.missingLabels).toEqual([])
    expect(complete.nextStepText).toBeNull()

    const partial = calculateProfileCompletion({
      ...baseUser,
      phone: '',
      organization: undefined,
      addresses: [],
    })
    expect(partial.percentage).toBe(40)
    expect(partial.completedCount).toBe(2)
    expect(partial.missingLabels).toEqual([
      'Nomor WhatsApp',
      'Nama usaha atau organisasi',
      'Alamat utama tersimpan',
    ])
    expect(partial.nextStepText).toBe('Lengkapi nomor whatsapp')
  })

  test('validates profile form fields and rejects invalid phone numbers', () => {
    expect(
      validateProfileFormInput({
        name: 'Ibu Ratna',
        phone: '081234567890',
        organization: 'Dapur Kasih',
      })
    ).toEqual({})

    const invalid = validateProfileFormInput({
      name: 'A',
      phone: '12345',
      organization: '',
    })
    expect(invalid.name).toBeDefined()
    expect(invalid.phone).toBeDefined()
  })

  test('filters orders by tab and search query', () => {
    const active = filterAccountOrders(sampleOrders, { tab: 'aktif', userId: 'usr-pb-01' })
    expect(active.map((item) => item.id)).toEqual(['ord-101'])

    const history = filterAccountOrders(sampleOrders, {
      tab: 'riwayat',
      query: 'wortel',
      userId: 'usr-pb-01',
    })
    expect(history.map((item) => item.id)).toEqual(['ord-102'])
  })

  test('filters transactions by date range and query', () => {
    const filtered = filterAccountTransactions(sampleOrders, {
      fromDate: new Date('2026-11-25T00:00:00Z'),
      toDate: new Date('2026-11-27T00:00:00Z'),
      userId: 'usr-pb-01',
    })
    expect(filtered.map((item) => item.id)).toEqual(['ord-101'])
  })

  test('formats roles, initials, and validates safe avatar urls', () => {
    expect(formatUserRoleLabel('buyer')).toBe('Pembeli')
    expect(formatUserRoleLabel('farmer')).toBe('Petani Mitra')
    expect(getUserInitials('Ibu Ratna')).toBe('IR')
    expect(getUserInitials('Ratna')).toBe('RA')
    expect(isSafeAvatarUrl('javascript:alert(1)')).toBeNull()
    expect(isSafeAvatarUrl('https://images.unsplash.com/photo-123')).toBe(
      'https://images.unsplash.com/photo-123'
    )
    expect(isSafeAvatarUrl('data:image/png;base64,AAAA')).toBe('data:image/png;base64,AAAA')
  })
})
