import { ApiError } from '../errors'
import { offersCollection } from './collections/offers'
import { ordersCollection } from './collections/orders'
import { usersCollection } from './collections/users'
import { notificationsCollection } from './collections/notifications'
import { needsBoardCollection } from './collections/needs-board'
import type { Order } from '@/types/api/orders'
import type { DistributionStats } from '@/types/api/admin'
import type { NeedRequest } from '@/types/api/needs-board'
import type { User } from '@/types/api/auth'

let activeSessionUserId: string | null = null

interface AdapterOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function parseJsonBody<T = Record<string, unknown>>(body: unknown): T {
  if (!body) {
    return {} as T
  }
  try {
    return JSON.parse(String(body)) as T
  } catch {
    throw new ApiError(400, 'Format payload JSON tidak valid', 'INVALID_JSON_BODY')
  }
}

export const tanstackDbAdapter = {
  async dispatch(endpoint: string, options: AdapterOptions = {}): Promise<unknown> {
    await delay(150 + Math.random() * 120)
    const method = (options.method || 'GET').toUpperCase()

    if (endpoint === '/api/auth/me') {
      if (!activeSessionUserId) {
        return null
      }
      const user = usersCollection.get(activeSessionUserId)
      if (!user) {
        activeSessionUserId = null
        return null
      }
      return user
    }

    if (endpoint === '/api/auth/login' && method === 'POST') {
      const body = parseJsonBody<{ email?: string; password?: string }>(options.body)
      const normalizedEmail = (body.email || '').trim().toLowerCase()
      const user =
        Array.from(usersCollection.values()).find(
          (item) => item.email.toLowerCase() === normalizedEmail
        ) || usersCollection.get('usr-pb-01')
      if (!user) {
        throw new ApiError(401, 'Email atau kata sandi tidak sesuai', 'UNAUTHORIZED')
      }
      activeSessionUserId = user.id
      return {
        token: 'dummy-token-' + Date.now(),
        user,
      }
    }

    if (endpoint === '/api/auth/register' && method === 'POST') {
      const body = parseJsonBody<{ name?: string; email?: string; password?: string }>(options.body)
      const normalizedEmail = (body.email || '').trim().toLowerCase()
      const existingUser = Array.from(usersCollection.values()).find(
        (item) => item.email.toLowerCase() === normalizedEmail
      )
      if (existingUser) {
        throw new ApiError(409, 'Email sudah terdaftar, silakan masuk', 'EMAIL_EXISTS')
      }

      const now = new Date().toISOString()
      const newUser: User = {
        id: 'usr-pb-' + Date.now(),
        name: (body.name || '').trim() || 'Pembeli PanganTani',
        email: normalizedEmail,
        phone: '',
        role: 'buyer',
        createdAt: now,
        updatedAt: now,
      }
      usersCollection.insert(newUser)
      activeSessionUserId = newUser.id
      return {
        token: 'dummy-token-' + Date.now(),
        user: newUser,
      }
    }

    if (endpoint === '/api/auth/login-farmer' && method === 'POST') {
      const body = parseJsonBody<{ email?: string; password?: string }>(options.body)
      const normalizedEmail = (body.email || '').trim().toLowerCase()
      const user = Array.from(usersCollection.values()).find(
        (item) => item.email.toLowerCase() === normalizedEmail
      )
      if (!user) {
        throw new ApiError(
          401,
          'Email belum terdaftar sebagai petani. Silakan periksa kembali atau daftar akun baru.',
          'UNAUTHORIZED'
        )
      }
      if (user.role !== 'farmer') {
        throw new ApiError(
          403,
          'Akun ini terdaftar sebagai Pembeli atau Admin. Gunakan halaman masuk yang sesuai.',
          'WRONG_ROLE'
        )
      }
      activeSessionUserId = user.id
      return {
        token: 'dummy-token-' + Date.now(),
        user,
      }
    }

    if (endpoint === '/api/auth/register-farmer' && method === 'POST') {
      const body = parseJsonBody<{
        name?: string
        email?: string
        phone?: string
        farmName?: string
        farmerType?: User['farmerType']
        primaryCommodities?: User['primaryCommodities']
        customCommodity?: string
        areaName?: string
        fullAddress?: string
        latitude?: number
        longitude?: number
        pickupNotes?: string
        bankAccount?: User['bankAccount']
      }>(options.body)
      const normalizedEmail = (body.email || '').trim().toLowerCase()
      const existingUser = Array.from(usersCollection.values()).find(
        (item) => item.email.toLowerCase() === normalizedEmail
      )
      if (existingUser) {
        throw new ApiError(
          409,
          'Alamat email ini sudah terdaftar. Silakan masuk menggunakan akun Anda.',
          'EMAIL_EXISTS'
        )
      }

      const now = new Date().toISOString()
      const newFarmer: User = {
        id: 'usr-pt-' + Date.now(),
        name: (body.name || '').trim() || 'Petani PanganTani',
        email: normalizedEmail,
        phone: (body.phone || '').trim(),
        role: 'farmer',
        organization: (body.farmName || '').trim(),
        farmerType: body.farmerType,
        primaryCommodities: body.primaryCommodities,
        customCommodity: body.customCommodity?.trim() || undefined,
        bankAccount: body.bankAccount,
        isVerifiedFarmer: false,
        onboardingCompleted: true,
        addresses: [
          {
            id: 'addr-' + Date.now(),
            label: (body.farmName || '').trim() || 'Lokasi Lahan Utama',
            fullAddress: (body.fullAddress || '').trim(),
            areaName: (body.areaName || '').trim(),
            latitude: typeof body.latitude === 'number' ? body.latitude : -6.8167,
            longitude: typeof body.longitude === 'number' ? body.longitude : 107.6167,
            isDefault: true,
            notes: (body.pickupNotes || '').trim(),
          },
        ],
        createdAt: now,
        updatedAt: now,
      }
      usersCollection.insert(newFarmer)
      activeSessionUserId = newFarmer.id
      return {
        token: 'dummy-token-' + Date.now(),
        user: newFarmer,
      }
    }

    if (endpoint === '/api/auth/logout' && method === 'POST') {
      activeSessionUserId = null
      return { success: true }
    }

    if (endpoint === '/api/offers/expiring-soon') {
      return Array.from(offersCollection.values())
        .filter((item) => item.condition === 'ripe_urgent' || item.status === 'active')
        .slice(0, 3)
    }

    if (endpoint === '/api/offers' && method === 'GET') {
      let items = Array.from(offersCollection.values())
      if (options.params?.category) {
        items = items.filter((item) => item.category === options.params?.category)
      }
      if (options.params?.search) {
        const query = String(options.params.search).toLowerCase()
        items = items.filter((item) => item.commodityName.toLowerCase().includes(query))
      }
      if (options.params?.condition) {
        items = items.filter((item) => item.condition === options.params?.condition)
      }
      return items
    }

    if (endpoint.startsWith('/api/offers/') && method === 'GET') {
      const id = endpoint.replace('/api/offers/', '')
      const offer = offersCollection.get(id)
      if (!offer) {
        throw new ApiError(404, 'Penawaran tidak ditemukan', 'NOT_FOUND')
      }
      return offer
    }

    if (endpoint === '/api/orders' && method === 'GET') {
      let items = Array.from(ordersCollection.values())
      if (options.params?.status) {
        items = items.filter((item) => item.status === options.params?.status)
      }
      return items
    }

    if (endpoint === '/api/orders' && method === 'POST') {
      const body = parseJsonBody<{
        offerId: string
        quantityKg: number
        scheduleSlotId?: string
        notes?: string
      }>(options.body)
      const offer = offersCollection.get(body.offerId)
      if (!offer) {
        throw new ApiError(404, 'Penawaran komoditas tidak ditemukan', 'NOT_FOUND')
      }
      if (offer.availableStockKg < body.quantityKg) {
        throw new ApiError(400, 'Stok tidak mencukupi untuk pemesanan ini', 'INSUFFICIENT_STOCK')
      }

      offersCollection.update(offer.id, (draft) => {
        draft.availableStockKg -= body.quantityKg
        draft.reservedStockKg += body.quantityKg
      })

      const selectedSlot = offer.pickupScheduleSlots.find(
        (slot) => slot.id === body.scheduleSlotId
      ) ||
        offer.pickupScheduleSlots[0] || {
          id: 'slot-default',
          date: '2026-11-25',
          startTime: '08:00',
          endTime: '10:00',
        }

      const newOrder: Order = {
        id: 'ord-' + Date.now(),
        buyerId: 'usr-pb-01',
        farmerId: offer.farmerId,
        offerId: offer.id,
        commodityName: offer.commodityName,
        quantityKg: body.quantityKg,
        pricePerKg: offer.pricePerKg,
        totalPrice: Math.round(body.quantityKg * offer.pricePerKg),
        scheduleSlot: selectedSlot,
        paymentDeadline: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        status: 'pending_payment',
        pickupLocation: {
          address: offer.pickupAddressFull || offer.pickupAddressArea,
          latitude: offer.latitude || -6.8167,
          longitude: offer.longitude || 107.6167,
          notes: body.notes,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      ordersCollection.insert(newOrder)
      return newOrder
    }

    if (endpoint.startsWith('/api/orders/') && endpoint.endsWith('/cancel') && method === 'POST') {
      const parts = endpoint.split('/')
      const orderId = parts[3]
      const order = ordersCollection.get(orderId)
      if (!order) {
        throw new ApiError(404, 'Pesanan tidak ditemukan', 'NOT_FOUND')
      }

      const offer = offersCollection.get(order.offerId)
      if (offer) {
        offersCollection.update(offer.id, (draft) => {
          draft.reservedStockKg = Math.max(0, draft.reservedStockKg - order.quantityKg)
          draft.availableStockKg += order.quantityKg
        })
      }

      ordersCollection.update(orderId, (draft) => {
        draft.status = 'cancelled'
        draft.updatedAt = new Date().toISOString()
      })

      return ordersCollection.get(orderId)
    }

    if (
      endpoint.startsWith('/api/orders/') &&
      endpoint.endsWith('/payments') &&
      method === 'POST'
    ) {
      const parts = endpoint.split('/')
      const orderId = parts[3]
      const body = parseJsonBody<{ proofUrl?: string }>(options.body)
      const order = ordersCollection.get(orderId)
      if (!order) {
        throw new ApiError(404, 'Pesanan tidak ditemukan', 'NOT_FOUND')
      }

      ordersCollection.update(orderId, (draft) => {
        draft.status = 'payment_submitted'
        draft.paymentProofUrl = body.proofUrl || 'https://images.example.com/proof.jpg'
        draft.updatedAt = new Date().toISOString()
      })

      return ordersCollection.get(orderId)
    }

    if (endpoint.startsWith('/api/orders/') && endpoint.endsWith('/ready-for-pickup')) {
      const parts = endpoint.split('/')
      const orderId = parts[3]
      const order = ordersCollection.get(orderId)
      if (!order) {
        throw new ApiError(404, 'Pesanan tidak ditemukan', 'NOT_FOUND')
      }

      ordersCollection.update(orderId, (draft) => {
        draft.status = 'ready_for_pickup'
        draft.updatedAt = new Date().toISOString()
      })

      return ordersCollection.get(orderId)
    }

    if (
      endpoint.startsWith('/api/orders/') &&
      endpoint.endsWith('/confirm-receipt') &&
      method === 'POST'
    ) {
      const parts = endpoint.split('/')
      const orderId = parts[3]
      const body = parseJsonBody<{ confirmedWeightKg?: number }>(options.body)
      const order = ordersCollection.get(orderId)
      if (!order) {
        throw new ApiError(404, 'Pesanan tidak ditemukan', 'NOT_FOUND')
      }

      const offer = offersCollection.get(order.offerId)
      if (offer) {
        offersCollection.update(offer.id, (draft) => {
          draft.reservedStockKg = Math.max(0, draft.reservedStockKg - order.quantityKg)
          draft.soldStockKg += body.confirmedWeightKg || order.quantityKg
        })
      }

      ordersCollection.update(orderId, (draft) => {
        draft.status = 'completed'
        draft.confirmedWeightKg = body.confirmedWeightKg || order.quantityKg
        draft.updatedAt = new Date().toISOString()
      })

      return ordersCollection.get(orderId)
    }

    if (endpoint.startsWith('/api/orders/') && method === 'GET') {
      const id = endpoint.replace('/api/orders/', '')
      const order = ordersCollection.get(id)
      if (!order) {
        throw new ApiError(404, 'Pesanan tidak ditemukan', 'NOT_FOUND')
      }
      return order
    }

    if (endpoint === '/api/notifications' && method === 'GET') {
      return Array.from(notificationsCollection.values())
    }

    if (
      endpoint.startsWith('/api/notifications/') &&
      endpoint.endsWith('/read') &&
      method === 'PATCH'
    ) {
      const parts = endpoint.split('/')
      const notifId = parts[3]
      const notif = notificationsCollection.get(notifId)
      if (notif) {
        notificationsCollection.update(notifId, (draft) => {
          draft.isRead = true
        })
      }
      return notificationsCollection.get(notifId)
    }

    if (endpoint === '/api/needs-board' && method === 'GET') {
      return Array.from(needsBoardCollection.values())
    }

    if (endpoint === '/api/needs-board' && method === 'POST') {
      const body = parseJsonBody<{
        commodityName?: string
        category?: string
        neededQuantityKg?: number
        maxPricePerKg?: number
        targetDate?: string
        targetArea?: string
        notes?: string
      }>(options.body)
      const newNeed: NeedRequest = {
        id: 'need-' + Date.now(),
        buyerId: 'usr-pb-01',
        buyerName: 'Ibu Ratna',
        organization: 'Dapur Umum Yayasan Kasih',
        commodityName: body.commodityName || 'Komoditas Baru',
        category: body.category || 'Sayuran',
        neededQuantityKg: body.neededQuantityKg || 100,
        maxPricePerKg: body.maxPricePerKg,
        targetDate: body.targetDate || '2026-11-28',
        targetArea: body.targetArea || 'Bandung',
        notes: body.notes,
        status: 'open',
        responses: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      needsBoardCollection.insert(newNeed)
      return newNeed
    }

    if (endpoint === '/api/admin/stats/distribution' && method === 'GET') {
      const stats: DistributionStats = {
        totalDistributedWeightKg: 14250,
        totalRescuedFoodKg: 11800,
        totalCarbonSavedKgCo2e: 28320,
        totalCompletedTransactions: 420,
        activeFarmersCount: 38,
        activeBuyersCount: 112,
      }
      return stats
    }

    throw new ApiError(
      404,
      `Endpoint belum terdaftar di adapter: ${method} ${endpoint}`,
      'NOT_FOUND'
    )
  },
}
