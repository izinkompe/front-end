import { ApiError } from '../errors'
import { offersCollection } from './collections/offers'
import { usersCollection } from './collections/users'
import { requireAdmin } from './route-context'
import type { RouteContext } from './route-context'
import {
  ModerateOfferRequestSchema,
  VerifyFarmerRequestSchema,
  type AdminFarmerItem,
  type AdminOfferModerationItem,
  type AdminUserItem,
  type CarbonFactor,
} from '@/types/api/admin'
import type { User } from '@/types/api/auth'

const CARBON_FACTORS: CarbonFactor[] = [
  {
    id: 'cf-01',
    category: 'sayuran',
    commodityName: 'Sayuran Daun & Buah',
    factorKgCo2ePerKg: 2.1,
    source: 'FAO Food Wastage Footprint',
    version: '2026.1',
    updatedAt: '2026-10-01T00:00:00Z',
  },
  {
    id: 'cf-02',
    category: 'buah',
    commodityName: 'Buah Tropis Segar',
    factorKgCo2ePerKg: 1.8,
    source: 'FAO Food Wastage Footprint',
    version: '2026.1',
    updatedAt: '2026-10-01T00:00:00Z',
  },
  {
    id: 'cf-03',
    category: 'padi-biji',
    commodityName: 'Padi & Biji-bijian',
    factorKgCo2ePerKg: 3.4,
    source: 'KLHK / IPCC Tier 1',
    version: '2026.1',
    updatedAt: '2026-10-01T00:00:00Z',
  },
  {
    id: 'cf-04',
    category: 'rempah-umbi',
    commodityName: 'Rempah & Umbi-umbian',
    factorKgCo2ePerKg: 1.5,
    source: 'FAO Food Wastage Footprint',
    version: '2026.1',
    updatedAt: '2026-10-01T00:00:00Z',
  },
]

function toAdminFarmerItem(user: User): AdminFarmerItem {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    organization: user.organization,
    farmerType: user.farmerType,
    primaryCommodities: user.primaryCommodities,
    isVerifiedFarmer: Boolean(user.isVerifiedFarmer),
    onboardingCompleted: Boolean(user.onboardingCompleted),
    bankName: user.bankAccount?.bankName,
    areaName: user.addresses?.[0]?.areaName,
    createdAt: user.createdAt,
  }
}

function toAdminUserItem(user: User): AdminUserItem {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    organization: user.organization,
    isVerifiedFarmer: user.role === 'farmer' ? Boolean(user.isVerifiedFarmer) : undefined,
    createdAt: user.createdAt,
  }
}

export function handleAdminRoute(ctx: RouteContext): { handled: boolean; data?: unknown } {
  const { endpoint, method, body, activeSessionUserId, parseJsonBody } = ctx
  if (!endpoint.startsWith('/api/admin/')) {
    return { handled: false }
  }

  requireAdmin(activeSessionUserId)

  if (endpoint === '/api/admin/farmers' && method === 'GET') {
    const items = Array.from(usersCollection.values())
      .filter((user) => user.role === 'farmer')
      .map(toAdminFarmerItem)
    return { handled: true, data: items }
  }

  const verifyMatch = /^\/api\/admin\/farmers\/([^/]+)\/verify$/.exec(endpoint)
  if (verifyMatch && method === 'PATCH') {
    let farmerId: string
    try {
      farmerId = decodeURIComponent(verifyMatch[1])
    } catch {
      throw new ApiError(400, 'ID petani tidak valid', 'INVALID_FARMER_ID')
    }
    const target = usersCollection.get(farmerId)
    if (!target || target.role !== 'farmer') {
      throw new ApiError(404, 'Akun petani tidak ditemukan', 'NOT_FOUND')
    }
    const parsed = VerifyFarmerRequestSchema.safeParse(parseJsonBody(body))
    if (!parsed.success) {
      throw new ApiError(400, 'Status verifikasi tidak valid', 'INVALID_PAYLOAD')
    }
    usersCollection.update(farmerId, (draft) => {
      draft.isVerifiedFarmer = parsed.data.isVerifiedFarmer
      draft.updatedAt = new Date().toISOString()
    })
    const updated = usersCollection.get(farmerId)
    return { handled: true, data: updated ? toAdminFarmerItem(updated) : null }
  }

  if (endpoint === '/api/admin/offers' && method === 'GET') {
    const items: AdminOfferModerationItem[] = Array.from(offersCollection.values()).map(
      (offer) => ({
        id: offer.id,
        farmerId: offer.farmerId,
        farmerName: offer.farmerName,
        commodityName: offer.commodityName,
        category: offer.category,
        pricePerKg: offer.pricePerKg,
        availableStockKg: offer.availableStockKg,
        reservedStockKg: offer.reservedStockKg,
        soldStockKg: offer.soldStockKg,
        pickupAddressArea: offer.pickupAddressArea,
        orderDeadline: offer.orderDeadline,
        status: offer.status,
      })
    )
    return { handled: true, data: items }
  }

  const moderateOfferMatch = /^\/api\/admin\/offers\/([^/]+)\/status$/.exec(endpoint)
  if (moderateOfferMatch && method === 'PATCH') {
    let offerId: string
    try {
      offerId = decodeURIComponent(moderateOfferMatch[1])
    } catch {
      throw new ApiError(400, 'ID penawaran tidak valid', 'INVALID_OFFER_ID')
    }
    const target = offersCollection.get(offerId)
    if (!target) {
      throw new ApiError(404, 'Penawaran tidak ditemukan', 'NOT_FOUND')
    }
    const parsed = ModerateOfferRequestSchema.safeParse(parseJsonBody(body))
    if (!parsed.success) {
      throw new ApiError(400, 'Status moderasi tidak valid', 'INVALID_PAYLOAD')
    }
    offersCollection.update(offerId, (draft) => {
      draft.status = parsed.data.status
      draft.updatedAt = new Date().toISOString()
    })
    const updated = offersCollection.get(offerId)
    if (!updated) return { handled: true, data: null }
    return {
      handled: true,
      data: {
        id: updated.id,
        farmerId: updated.farmerId,
        farmerName: updated.farmerName,
        commodityName: updated.commodityName,
        category: updated.category,
        pricePerKg: updated.pricePerKg,
        availableStockKg: updated.availableStockKg,
        reservedStockKg: updated.reservedStockKg,
        soldStockKg: updated.soldStockKg,
        pickupAddressArea: updated.pickupAddressArea,
        orderDeadline: updated.orderDeadline,
        status: updated.status,
      } satisfies AdminOfferModerationItem,
    }
  }

  if (endpoint === '/api/admin/users' && method === 'GET') {
    const items = Array.from(usersCollection.values()).map(toAdminUserItem)
    return { handled: true, data: items }
  }

  if (endpoint === '/api/admin/stats/carbon-factors' && method === 'GET') {
    return { handled: true, data: CARBON_FACTORS }
  }

  return { handled: false }
}
