import { afterEach, describe, expect, test } from 'bun:test'
import { tanstackDbAdapter } from './adapter'
import { offersCollection } from './collections/offers'
import { ordersCollection } from './collections/orders'
import {
  getJakartaDate,
  getNeedCheckoutHref,
  getRemainingNeedKg,
} from '../../data/needs-board-helpers'
import { getNotificationHref, notificationCategoryByType } from '../../data/notification-helpers'
import { isComplaintPhoto } from '../../data/complaint-helpers'
import { getOfferPriceSchedule } from '../../data/offer-price-schedule'
import { buildTransactionsCsv, summarizeCompletedTransactions } from '../../data/transaction-export'

const demoEmail = 'ratna@dapurkasih.org'
const demoPassword = 'password123'
const dayMs = 86_400_000

function request(endpoint, method = 'GET', payload) {
  return tanstackDbAdapter.dispatch(endpoint, { method, body: payload && JSON.stringify(payload) })
}

function login() {
  return request('/api/auth/login', 'POST', { email: demoEmail, password: demoPassword })
}

const testBuyer = (label) =>
  request('/api/auth/register', 'POST', {
    name: 'Pembeli Uji',
    email: label + '@example.test',
    password: 'password-reset-1',
  })

describe('buyer roadmap', () => {
  afterEach(() => request('/api/auth/logout', 'POST'))

  test('protects order and complaint details with buyer ownership', async () => {
    await request('/api/auth/logout', 'POST')
    await expect(request('/api/orders/ord-demo-001')).rejects.toMatchObject({ status: 401 })
    await testBuyer('roadmap-ownership')
    expect(await request('/api/orders')).toEqual([])
    expect(await request('/api/complaints')).toEqual([])
    await expect(request('/api/orders/ord-demo-001')).rejects.toMatchObject({ status: 404 })
    await expect(request('/api/orders/ord-demo-001/payment')).rejects.toMatchObject({ status: 404 })
    await expect(request('/api/complaints/complaint-demo-001')).rejects.toMatchObject({
      status: 404,
    })
  })

  test('requires pickup readiness and makes repeated receipt confirmation safe', async () => {
    await login()
    const original = offersCollection.get('off-002')
    const order = await request('/api/orders', 'POST', {
      offerId: original.id,
      quantityKg: 1.001,
      scheduleSlotId: 'slot-3',
    })
    const receipt = '/api/orders/' + order.id + '/confirm-receipt'
    await expect(request(receipt, 'POST', { confirmedWeightKg: 1.001 })).rejects.toMatchObject({
      status: 409,
    })
    ordersCollection.update(order.id, (draft) => {
      draft.status = 'ready_for_pickup'
    })
    await expect(request(receipt, 'POST', { confirmedWeightKg: 1.0001 })).rejects.toMatchObject({
      status: 400,
    })
    expect((await request(receipt, 'POST', { confirmedWeightKg: 1.001 })).status).toBe('completed')
    expect((await request(receipt, 'POST', { confirmedWeightKg: 1.001 })).status).toBe('completed')
    expect(offersCollection.get(original.id).soldStockKg).toBeCloseTo(
      original.soldStockKg + 1.001,
      3
    )
    expect(offersCollection.get(original.id).reservedStockKg).toBeCloseTo(
      original.reservedStockKg,
      3
    )
  })

  test('keeps paid cancellation stock reserved and allows one active report', async () => {
    await login()
    const stock = offersCollection.get('off-001')
    const path = '/api/orders/ord-demo-001'
    await expect(request(path + '/cancel', 'POST')).rejects.toMatchObject({ status: 409 })
    const report = {
      orderId: 'ord-demo-001',
      type: 'cancellation_request',
      description: 'Jadwal dapur berubah.',
      refundBankAccount: {
        bankName: 'BRI',
        accountNumber: '0123456789',
        accountHolderName: 'Pembeli Uji',
      },
    }
    await expect(
      request('/api/complaints', 'POST', { ...report, refundBankAccount: undefined })
    ).rejects.toMatchObject({ status: 400 })
    expect((await request('/api/complaints', 'POST', report)).status).toBe('open')
    await expect(request('/api/complaints', 'POST', report)).rejects.toMatchObject({ status: 409 })
    expect((await request(path)).status).toBe('disputed')
    expect(offersCollection.get(stock.id).reservedStockKg).toBe(stock.reservedStockKg)
    expect(offersCollection.get(stock.id).availableStockKg).toBe(stock.availableStockKg)
    ordersCollection.update('ord-demo-001', (draft) => {
      draft.status = 'ready_for_pickup'
    })
  })

  test('records clarification and accepts only bounded JPEG and PNG evidence', async () => {
    await login()
    const endpoint = '/api/complaints/complaint-demo-001/messages'
    await expect(
      request(endpoint, 'POST', {
        message: 'Lihat foto.',
        attachments: ['https://example.test/photo.jpg'],
      })
    ).rejects.toMatchObject({ status: 400 })
    expect(isComplaintPhoto('data:image/png;base64,QUFBQQ==')).toBe(false)
    expect(isComplaintPhoto('data:image/png;base64,iVBORw0KGgo=')).toBe(true)
    expect(isComplaintPhoto('data:image/jpeg;base64,/9j/AA==')).toBe(true)
    expect(isComplaintPhoto('data:image/png;base64,' + 'A'.repeat(7_000_000))).toBe(false)
    const report = await request(endpoint, 'POST', {
      message: 'Saya mencatat 48 kg di timbangan gudang.',
    })
    expect(report.clarificationMessages.at(-1).senderRole).toBe('buyer')
  })

  test('filters private notifications and marks all only for the current session', async () => {
    await testBuyer('roadmap-notifications')
    expect(await request('/api/notifications')).toEqual([])
    await expect(request('/api/notifications/notif-001/read', 'PATCH')).rejects.toMatchObject({
      status: 404,
    })
    await request('/api/notifications/read-all', 'PATCH')
    await login()
    expect((await request('/api/notifications')).some((item) => !item.isRead)).toBe(true)
    await request('/api/notifications/read-all', 'PATCH')
    expect((await request('/api/notifications')).every((item) => item.isRead)).toBe(true)
    expect(getNotificationHref('/pesanan/ord-demo-005/bayar')).toBe('/pesanan/ord-demo-005/bayar')
    expect(getNotificationHref('//example.test')).toBeUndefined()
    expect(getNotificationHref('/pesanan/../syarat')).toBeUndefined()
    expect(Object.values(notificationCategoryByType)).toHaveLength(6)
  })

  test('uses the demo reset code once and accepts the new buyer password', async () => {
    const email = 'roadmap-reset@example.test'
    await testBuyer('roadmap-reset')
    await request('/api/auth/logout', 'POST')
    const { demoCode } = await request('/api/auth/forgot-password', 'POST', { email })
    const reset = { email, code: demoCode, password: 'password-reset-2' }
    expect(demoCode).toMatch(/^\d{6}$/)
    await expect(
      request('/api/auth/reset-password', 'POST', { ...reset, password: '123' })
    ).rejects.toMatchObject({ status: 400 })
    await request('/api/auth/reset-password', 'POST', reset)
    await expect(request('/api/auth/reset-password', 'POST', reset)).rejects.toMatchObject({
      status: 400,
    })
    await expect(
      request('/api/auth/login', 'POST', { email, password: 'password-reset-1' })
    ).rejects.toMatchObject({ status: 401 })
    expect(
      (await request('/api/auth/login', 'POST', { email, password: reset.password })).user.email
    ).toBe(email)
  })

  test('lets only the buyer publish and close their own need', async () => {
    await request('/api/auth/logout', 'POST')
    const input = {
      commodityName: 'Beras Uji',
      category: 'padi-biji',
      neededQuantityKg: 30.125,
      targetArea: 'Bandung',
      targetDate: getJakartaDate(Date.now() + dayMs),
    }
    await expect(request('/api/needs-board', 'POST', input)).rejects.toMatchObject({ status: 401 })
    const { user } = await testBuyer('roadmap-needs')
    const need = await request('/api/needs-board', 'POST', { ...input, buyerId: 'usr-pb-01' })
    expect(need.buyerId).toBe(user.id)
    expect(need.neededQuantityKg).toBe(30.125)
    await login()
    const path = '/api/needs-board/' + need.id + '/status'
    await expect(request(path, 'PATCH', { status: 'closed' })).rejects.toMatchObject({
      status: 404,
    })
    await request('/api/auth/login', 'POST', { email: user.email, password: 'password-reset-1' })
    expect((await request(path, 'PATCH', { status: 'fulfilled' })).fulfilledQuantityKg).toBe(30.125)
    await request('/api/auth/logout', 'POST')
    await expect(request('/api/needs-board/' + need.id)).rejects.toMatchObject({ status: 404 })
  })

  test('passes a farmer response through to checkout within the remaining need and available stock', async () => {
    const need = await request('/api/needs-board/need-001')
    const response = need.responses[0]
    const offer = { ...offersCollection.get(response.offerId), availableStockKg: 75.25 }
    expect(getRemainingNeedKg(need)).toBe(200)
    const href = new URL(getNeedCheckoutHref(need, response, offer), 'https://example.test')
    expect(href.pathname).toBe('/pasar/checkout')
    expect(href.searchParams.get('qty')).toBe('75.25')
    expect(href.searchParams.get('price')).toBe(String(response.offeredPricePerKg))
    expect(getNeedCheckoutHref(need, response, { ...offer, status: 'closed' })).toBeNull()
  })

  test('stores favorites by buyer and emits one notification for a matching nearby offer', async () => {
    await login()
    const buyer = await request('/api/auth/me')
    const address = buyer.addresses.find((item) => item.isDefault)
    const update = {
      name: buyer.name,
      preferences: {
        orderStatusUpdates: true,
        harvestReminders: true,
        reminderRadiusKm: 5,
        marketingEmails: false,
        showOrganizationOnReceipts: true,
      },
    }
    await request('/api/profile', 'PATCH', update)
    await request('/api/favorites/offers/off-002/toggle', 'POST')
    expect((await request('/api/favorites')).offers[0].id).toBe('off-002')
    expect((await request('/api/favorites')).offers[0]).not.toHaveProperty('pickupAddressFull')
    await request('/api/farmers/usr-pt-01/follow', 'POST')
    expect((await request('/api/favorites')).farmers[0].id).toBe('usr-pt-01')
    await testBuyer('roadmap-favorites')
    expect(await request('/api/favorites')).toEqual({ offers: [], farmers: [] })
    await request('/api/auth/login-farmer', 'POST', {
      email: 'joko@suburmakmur.id',
      password: 'password123',
    })
    const newOffer = {
      ...offersCollection.get('off-002'),
      commodityName: 'Buncis Uji',
      status: 'active',
      latitude: address.latitude,
      longitude: address.longitude,
      orderDeadline: new Date(Date.now() + dayMs).toISOString(),
    }
    const matching = await request('/api/offers', 'POST', newOffer)
    const outside = await request('/api/offers', 'POST', {
      ...newOffer,
      latitude: address.latitude + 1,
    })
    await login()
    const notifications = await request('/api/notifications')
    const match = notifications.filter((item) => item.link === '/pasar/penawaran/' + matching.id)
    expect(match).toHaveLength(1)
    expect(notifications.some((item) => item.link === '/pasar/penawaran/' + outside.id)).toBe(false)
    expect((await request('/api/notifications/' + match[0].id + '/read', 'PATCH')).isRead).toBe(
      true
    )
    await request('/api/favorites/offers/off-002/toggle', 'POST')
    await request('/api/farmers/usr-pt-01/follow', 'POST')
  })

  test('creates, toggles offers in, and deletes buyer bookmark lists', async () => {
    await login()
    const createdList = await request('/api/favorites/lists', 'POST', {
      name: 'Stok Sayur Mingguan',
      description: 'Belanja rutin akhir pekan',
    })
    expect(createdList.name).toBe('Stok Sayur Mingguan')
    expect((await request('/api/favorites/lists')).lists).toHaveLength(1)

    const toggledList = await request(
      '/api/favorites/lists/' + createdList.id + '/offers/off-002/toggle',
      'POST'
    )
    expect(toggledList.offerIds).toEqual(['off-002'])
    expect((await request('/api/favorites/lists')).lists[0].offers[0].id).toBe('off-002')

    await request('/api/favorites/lists/' + createdList.id, 'DELETE')
    expect((await request('/api/favorites/lists')).lists).toEqual([])
  })

  test('exports distinct completed orders with UTF-8 and spreadsheet-safe text', () => {
    const completed = {
      ...ordersCollection.get('ord-demo-003'),
      commodityName: '=contoh',
      farmerName: '\t@contoh "nama"',
      confirmedWeightKg: 49.125,
    }
    const orders = [completed, completed, { ...completed, id: 'cancelled', status: 'cancelled' }]
    expect(summarizeCompletedTransactions(orders)).toEqual({
      count: 1,
      farmerCount: 1,
      totalIdr: completed.totalPrice,
      weightKg: 49.125,
    })
    const csv = buildTransactionsCsv(orders, { from: '', to: '', createdAt: completed.updatedAt })
    expect(csv.charCodeAt(0)).toBe(0xfeff)
    expect(csv).toContain('"\'=contoh"')
    expect(csv).toContain('"\'\t@contoh ""nama"""')
    expect(csv).not.toContain('"cancelled"')
  })

  test('keeps the price drop between the scheduled start and deadline', () => {
    const now = Date.UTC(2026, 10, 26, 9)
    const offer = {
      ...offersCollection.get('off-002'),
      pricePerKg: 10_000,
      dynamicPriceStartsAt: new Date(now).toISOString(),
      orderDeadline: new Date(now + 4 * 3_600_000).toISOString(),
      dynamicPriceRule: {
        startPrice: 10_000,
        minPrice: 8_000,
        dropAmount: 1_000,
        dropIntervalHours: 1,
      },
    }
    expect(getOfferPriceSchedule(offer, now)).toEqual({
      currentPricePerKg: 10_000,
      nextDropAt: now + 3_600_000,
    })
    expect(getOfferPriceSchedule(offer, now + 3_600_000)).toEqual({
      currentPricePerKg: 9_000,
      nextDropAt: now + 7_200_000,
    })
    expect(getOfferPriceSchedule(offer, now + 7_200_000)).toEqual({
      currentPricePerKg: 8_000,
      nextDropAt: null,
    })
    expect(
      getOfferPriceSchedule(
        { ...offer, orderDeadline: new Date(now + 3_600_000).toISOString() },
        now
      ).nextDropAt
    ).toBeNull()
  })
})
