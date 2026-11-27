import { ApiError } from '../errors'
import { offersCollection } from './collections/offers'
import { usersCollection } from './collections/users'
import { handleNotificationRoute } from './notification-routes'
import { handleNeedsBoardRoute } from './needs-board-routes'
import { handleFavoriteRoute } from './favorite-routes'
import { handleOfferWriteRoute, toPublicOffer } from './offer-routes'
import { getBuyerPreferences } from './buyer-preferences'
import { handleBuyerAuthRoute } from './buyer-auth-routes'
import { handleComplaintRoute } from './complaint-routes'
import { handleOrderRoute } from './order-routes'
import { handleProfileRoute } from './profile-routes'
import { handleFarmerRoute } from './farmer-routes'
import { handleFarmerManagementRoute } from './farmer-management-routes'
import { handleAdminRoute } from './admin-routes'
import { requireAdmin } from './route-context'
import { isAuthRelaxed } from '@/lib/auth/rbac'
import { UserRoleSchema, type User } from '@/types/api/auth'
import type { DistributionStats } from '@/types/api/admin'
import { matchesOfferCategory } from '@/lib/data/categories'

const SESSION_USER_STORAGE_KEY = 'pangantani:session-user-id'
let memorySessionUserId: string | null = null

function getStoredSessionUserId(): string | null {
  if (typeof window !== 'undefined') {
    try {
      const stored =
        window.localStorage.getItem(SESSION_USER_STORAGE_KEY) ??
        window.sessionStorage.getItem(SESSION_USER_STORAGE_KEY)
      if (stored) {
        memorySessionUserId = stored
        return stored
      }
    } catch {
      return memorySessionUserId
    }
  }
  return memorySessionUserId
}

function setStoredSessionUserId(userId: string | null): void {
  memorySessionUserId = userId
  if (typeof window === 'undefined') return
  try {
    if (userId) {
      window.localStorage.setItem(SESSION_USER_STORAGE_KEY, userId)
      window.sessionStorage.setItem(SESSION_USER_STORAGE_KEY, userId)
    } else {
      window.localStorage.removeItem(SESSION_USER_STORAGE_KEY)
      window.sessionStorage.removeItem(SESSION_USER_STORAGE_KEY)
    }
  } catch {
    return
  }
}

const FARMER_DEMO_PASSWORDS: Record<string, ReadonlyArray<string>> = {
  'joko@suburmakmur.id': ['PetaniJoko2026!', 'password123'],
  'sumarni@tanibarokah.id': ['PetaniSumarni2026!'],
  'dedi@tanimudagarut.id': ['PetaniDedi2026!'],
}

const ADMIN_DEMO_PASSWORDS: Record<string, string> = {
  'admin@pangantani.id': 'AdminPangan2026!',
  'rina.verifikator@pangantani.id': 'Verifikasi2026!',
  'bagas.audit@pangantani.id': 'Moderasi2026!',
}

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
    const activeSessionUserId = getStoredSessionUserId()
    if (endpoint !== '/api/auth/me') {
      await delay(150 + Math.random() * 120)
    }
    const method = (options.method || 'GET').toUpperCase()

    if (endpoint === '/api/auth/me') {
      if (!activeSessionUserId) {
        return null
      }
      const user = usersCollection.get(activeSessionUserId)
      if (!user) {
        if (getStoredSessionUserId() === activeSessionUserId) setStoredSessionUserId(null)
        return null
      }
      return user
    }

    const buyerAuth = await handleBuyerAuthRoute({
      endpoint,
      method,
      body: options.body,
      activeSessionUserId,
      parseJsonBody,
    })
    if (buyerAuth?.user) {
      const preferences = getBuyerPreferences(buyerAuth.user)
      usersCollection.update(buyerAuth.user.id, (draft) => {
        Object.assign(draft, preferences)
      })
      setStoredSessionUserId(buyerAuth.user.id)
      return { token: 'dummy-token-' + Date.now(), user: usersCollection.get(buyerAuth.user.id) }
    }
    if (buyerAuth) return buyerAuth.data

    if (endpoint === '/api/auth/login-farmer' && method === 'POST') {
      const body = parseJsonBody<{ email?: string; password?: string }>(options.body)
      const normalizedEmail = (body.email || '').trim().toLowerCase()
      const password = body.password || ''
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
      const allowedPasswords = FARMER_DEMO_PASSWORDS[normalizedEmail]
      if (!allowedPasswords || !allowedPasswords.includes(password)) {
        throw new ApiError(401, 'Email atau kata sandi petani tidak sesuai.', 'UNAUTHORIZED')
      }
      setStoredSessionUserId(user.id)
      return {
        token: 'dummy-token-' + Date.now(),
        user,
      }
    }

    if (endpoint === '/api/auth/login-admin' && method === 'POST') {
      const body = parseJsonBody<{ email?: string; password?: string }>(options.body)
      const normalizedEmail = (body.email || '').trim().toLowerCase()
      const password = body.password || ''
      const user = Array.from(usersCollection.values()).find(
        (item) => item.email.toLowerCase() === normalizedEmail
      )
      if (!user || user.role !== 'admin') {
        throw new ApiError(401, 'Email atau kata sandi admin tidak sesuai.', 'UNAUTHORIZED')
      }
      const expectedPassword = ADMIN_DEMO_PASSWORDS[normalizedEmail]
      if (!expectedPassword || expectedPassword !== password) {
        throw new ApiError(401, 'Email atau kata sandi admin tidak sesuai.', 'UNAUTHORIZED')
      }
      setStoredSessionUserId(user.id)
      return {
        token: 'dummy-admin-token-' + Date.now(),
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
      setStoredSessionUserId(newFarmer.id)
      return {
        token: 'dummy-token-' + Date.now(),
        user: newFarmer,
      }
    }

    if (endpoint === '/api/auth/logout' && method === 'POST') {
      setStoredSessionUserId(null)
      return { success: true }
    }

    if (endpoint === '/api/auth/preview-role' && method === 'POST') {
      if (!isAuthRelaxed()) {
        throw new ApiError(
          403,
          'Pengalih peran pratinjau dinonaktifkan pada mode autentikasi ketat',
          'FORBIDDEN'
        )
      }
      const payload = parseJsonBody<{ role?: unknown }>(options.body)
      const parsedRole = UserRoleSchema.safeParse(payload.role)
      if (!parsedRole.success) {
        throw new ApiError(400, 'Peran pratinjau tidak valid', 'INVALID_ROLE')
      }
      const targetRole = parsedRole.data
      const targetUser = Array.from(usersCollection.values()).find(
        (item) => item.role === targetRole
      )
      if (!targetUser) {
        throw new ApiError(404, 'Akun pratinjau untuk peran tersebut tidak ditemukan', 'NOT_FOUND')
      }
      setStoredSessionUserId(targetUser.id)
      return { user: targetUser }
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

    const routeContext = {
      endpoint,
      method,
      params: options.params,
      body: options.body,
      activeSessionUserId,
      parseJsonBody,
    }
    const farmerManagement = handleFarmerManagementRoute(routeContext)
    if (farmerManagement.handled) return farmerManagement.data
    const favorites = handleFavoriteRoute(routeContext)
    if (favorites.handled) return favorites.data
    const offerWrite = handleOfferWriteRoute(routeContext)
    if (offerWrite.handled) return offerWrite.data

    if (endpoint === '/api/offers/expiring-soon') {
      return Array.from(offersCollection.values())
        .filter((item) => item.status === 'active' && item.availableStockKg > 0)
        .sort((a, b) => Date.parse(a.orderDeadline) - Date.parse(b.orderDeadline))
        .slice(0, 6)
        .map(toPublicOffer)
    }

    if (endpoint === '/api/offers' && method === 'GET') {
      let items = Array.from(offersCollection.values())
        .filter((offer) => offer.status !== 'draft')
        .map(toPublicOffer)
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
      return items
    }

    if (endpoint.startsWith('/api/offers/') && method === 'GET') {
      const id = endpoint.replace('/api/offers/', '')
      const offer = offersCollection.get(id)
      if (!offer || offer.status === 'draft') {
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

    const complaintResult = handleComplaintRoute({
      endpoint,
      method,
      params: options.params,
      body: options.body,
      activeSessionUserId,
      parseJsonBody,
    })
    if (complaintResult.handled) return complaintResult.data

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

    const notificationResult = handleNotificationRoute({
      endpoint,
      method,
      body: options.body,
      activeSessionUserId,
      parseJsonBody,
    })
    if (notificationResult.handled) return notificationResult.data

    const needsBoardResult = handleNeedsBoardRoute({
      endpoint,
      method,
      body: options.body,
      activeSessionUserId,
      parseJsonBody,
    })
    if (needsBoardResult.handled) return needsBoardResult.data

    if (endpoint === '/api/admin/stats/distribution' && method === 'GET') {
      if (!isAuthRelaxed() || activeSessionUserId) {
        requireAdmin(activeSessionUserId)
      }
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

    const adminResult = handleAdminRoute(routeContext)
    if (adminResult.handled) return adminResult.data

    throw new ApiError(
      404,
      `Endpoint belum terdaftar di adapter: ${method} ${endpoint}`,
      'NOT_FOUND'
    )
  },
}
