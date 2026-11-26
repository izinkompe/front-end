import { ApiError } from '../errors'
import { offersCollection } from './collections/offers'
import { usersCollection } from './collections/users'
import { notificationsCollection } from './collections/notifications'
import { needsBoardCollection } from './collections/needs-board'
import { handleOrderRoute } from './order-routes'
import { handleProfileRoute } from './profile-routes'
import { handleFarmerRoute } from './farmer-routes'
import type { DistributionStats } from '@/types/api/admin'
import type { NeedRequest } from '@/types/api/needs-board'
import type { Offer } from '@/types/api/offers'
import type { User } from '@/types/api/auth'
import { matchesOfferCategory } from '@/lib/data/categories'

function toPublicOffer(offer: Offer): Offer {
  const { pickupAddressFull: _, ...publicOffer } = offer
  return publicOffer
}

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

    const profileResult = handleProfileRoute({
      endpoint,
      method,
      body: options.body,
      activeSessionUserId,
      parseJsonBody,
    })
    if (profileResult.handled) {
      return profileResult.data
    }

    if (endpoint === '/api/offers/expiring-soon') {
      return Array.from(offersCollection.values())
        .filter((item) => item.status === 'active' && item.availableStockKg > 0)
        .sort((a, b) => Date.parse(a.orderDeadline) - Date.parse(b.orderDeadline))
        .slice(0, 6)
        .map(toPublicOffer)
    }

    if (endpoint === '/api/offers' && method === 'GET') {
      let items = Array.from(offersCollection.values())
      if (options.params?.farmerId) {
        const targetFarmerId = String(options.params.farmerId)
        items = items.filter((item) => item.farmerId === targetFarmerId)
      }
      if (options.params?.status) {
        items = items.filter((item) => item.status === options.params?.status)
      }
      if (options.params?.category) {
        const targetCategory = String(options.params.category)
        items = items.filter((item) => matchesOfferCategory(item.category, targetCategory))
      }
      if (options.params?.search) {
        const query = String(options.params.search).toLowerCase()
        items = items.filter(
          (item) =>
            item.commodityName.toLowerCase().includes(query) ||
            item.pickupAddressArea.toLowerCase().includes(query) ||
            item.farmerName.toLowerCase().includes(query)
        )
      }
      if (options.params?.condition) {
        items = items.filter((item) => item.condition === options.params?.condition)
      }
      if (options.params?.minPrice !== undefined) {
        const minPrice = Number(options.params.minPrice)
        if (Number.isFinite(minPrice)) {
          items = items.filter((item) => item.pricePerKg >= minPrice)
        }
      }
      if (options.params?.maxPrice !== undefined) {
        const maxPrice = Number(options.params.maxPrice)
        if (Number.isFinite(maxPrice)) {
          items = items.filter((item) => item.pricePerKg <= maxPrice)
        }
      }
      if (options.params?.minStock !== undefined) {
        const minStock = Number(options.params.minStock)
        if (Number.isFinite(minStock)) {
          items = items.filter((item) => item.availableStockKg >= minStock)
        }
      }
      if (options.params?.dynamicOnly === true || options.params?.dynamicOnly === 'true') {
        items = items.filter((item) => Boolean(item.dynamicPriceRule))
      }
      return items.map(toPublicOffer)
    }

    if (endpoint.startsWith('/api/offers/') && method === 'GET') {
      const id = endpoint.replace('/api/offers/', '')
      const offer = offersCollection.get(id)
      if (!offer) {
        throw new ApiError(404, 'Penawaran tidak ditemukan', 'NOT_FOUND')
      }
      return toPublicOffer(offer)
    }

    const farmerResult = handleFarmerRoute({
      endpoint,
      method,
      activeSessionUserId,
    })
    if (farmerResult.handled) {
      return farmerResult.data
    }

    const orderResult = handleOrderRoute({
      endpoint,
      method,
      params: options.params,
      body: options.body,
      activeSessionUserId,
      parseJsonBody,
    })
    if (orderResult.handled) {
      return orderResult.data
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
