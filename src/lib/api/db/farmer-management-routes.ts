import { ApiError } from '../errors'
import { offersCollection } from './collections/offers'
import { usersCollection } from './collections/users'
import {
  ensureFarmerFarms,
  ensureFarmerStoreSettings,
  farmerFarmsCollection,
  farmerStoreSettingsCollection,
} from './collections/farmer-management'
import { requireFarmer } from './route-context'
import {
  CreateFarmerFarmRequestSchema,
  UpdateFarmerFarmRequestSchema,
  UpdateFarmerStoreSettingsRequestSchema,
  type FarmerFarm,
} from '@/types/api/farmer-management'

interface FarmerManagementRouteContext {
  endpoint: string
  method: string
  body: unknown
  activeSessionUserId: string | null
  parseJsonBody: <T = Record<string, unknown>>(body: unknown) => T
}

function getFarmer(userId: string | null) {
  return requireFarmer(userId)
}

function getOwnedFarm(farmId: string, farmerId: string) {
  const farm = farmerFarmsCollection.get(farmId)
  if (!farm || farm.farmerId !== farmerId) {
    throw new ApiError(404, 'Kebun tidak ditemukan', 'NOT_FOUND')
  }
  return farm
}

export function handleFarmerManagementRoute(ctx: FarmerManagementRouteContext) {
  const { endpoint, method, body, activeSessionUserId, parseJsonBody } = ctx
  if (!endpoint.startsWith('/api/farmer/')) return { handled: false }

  const farmer = getFarmer(activeSessionUserId)

  if (endpoint === '/api/farmer/store' && method === 'GET') {
    return { handled: true, data: ensureFarmerStoreSettings(farmer) }
  }

  if (endpoint === '/api/farmer/store' && method === 'PATCH') {
    const parsed = UpdateFarmerStoreSettingsRequestSchema.safeParse(parseJsonBody(body))
    if (!parsed.success) {
      throw new ApiError(400, 'Periksa kembali informasi toko', 'INVALID_STORE_SETTINGS')
    }

    const current = ensureFarmerStoreSettings(farmer)
    const payload = parsed.data
    farmerStoreSettingsCollection.update(farmer.id, (draft) => {
      draft.storeName = payload.storeName
      draft.description = payload.description
      draft.publicPickupNotes = payload.publicPickupNotes
      draft.primaryCommodities = payload.primaryCommodities
      if (payload.logoImage !== undefined) draft.logoImage = payload.logoImage ?? undefined
      if (payload.coverImage !== undefined) draft.coverImage = payload.coverImage ?? undefined
      draft.updatedAt = new Date().toISOString()
    })
    usersCollection.update(farmer.id, (draft) => {
      draft.updatedAt = new Date().toISOString()
    })
    return { handled: true, data: farmerStoreSettingsCollection.get(current.farmerId) }
  }

  if (endpoint === '/api/farmer/offers' && method === 'GET') {
    const items = Array.from(offersCollection.values()).filter(
      (offer) => offer.farmerId === farmer.id
    )
    return { handled: true, data: items }
  }

  if (endpoint === '/api/farmer/farms' && method === 'GET') {
    const farms = ensureFarmerFarms(farmer)
    return {
      handled: true,
      data:
        farms.length > 0
          ? Array.from(farmerFarmsCollection.values()).filter((farm) => farm.farmerId === farmer.id)
          : [],
    }
  }

  if (endpoint === '/api/farmer/farms' && method === 'POST') {
    const parsed = CreateFarmerFarmRequestSchema.safeParse(parseJsonBody(body))
    if (!parsed.success) {
      throw new ApiError(400, 'Periksa kembali informasi kebun', 'INVALID_FARM')
    }
    const duplicate = Array.from(farmerFarmsCollection.values()).some(
      (farm) =>
        farm.farmerId === farmer.id && farm.name.toLowerCase() === parsed.data.name.toLowerCase()
    )
    if (duplicate) {
      throw new ApiError(409, 'Nama kebun ini sudah digunakan', 'FARM_NAME_EXISTS')
    }
    const now = new Date().toISOString()
    const farm: FarmerFarm = {
      ...parsed.data,
      id: 'farm-' + crypto.randomUUID(),
      farmerId: farmer.id,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    }
    farmerFarmsCollection.insert(farm)
    return { handled: true, data: farm }
  }

  const farmMatch = /^\/api\/farmer\/farms\/([^/]+)$/.exec(endpoint)
  if (farmMatch && method === 'GET') {
    let farmId: string
    try {
      farmId = decodeURIComponent(farmMatch[1])
    } catch {
      throw new ApiError(400, 'ID kebun tidak valid', 'INVALID_FARM_ID')
    }
    return { handled: true, data: getOwnedFarm(farmId, farmer.id) }
  }

  if (farmMatch && method === 'PATCH') {
    let farmId: string
    try {
      farmId = decodeURIComponent(farmMatch[1])
    } catch {
      throw new ApiError(400, 'ID kebun tidak valid', 'INVALID_FARM_ID')
    }
    getOwnedFarm(farmId, farmer.id)
    const parsed = UpdateFarmerFarmRequestSchema.safeParse(parseJsonBody(body))
    if (!parsed.success) {
      throw new ApiError(400, 'Periksa kembali informasi kebun', 'INVALID_FARM')
    }
    const duplicate = Array.from(farmerFarmsCollection.values()).some(
      (farm) =>
        farm.farmerId === farmer.id &&
        farm.id !== farmId &&
        farm.name.toLowerCase() === parsed.data.name.toLowerCase()
    )
    if (duplicate) {
      throw new ApiError(409, 'Nama kebun ini sudah digunakan', 'FARM_NAME_EXISTS')
    }
    const now = new Date().toISOString()
    farmerFarmsCollection.update(farmId, (draft) => {
      draft.name = parsed.data.name
      draft.areaName = parsed.data.areaName
      draft.fullAddress = parsed.data.fullAddress
      draft.primaryCommodities = parsed.data.primaryCommodities
      draft.pickupNotes = parsed.data.pickupNotes
      draft.status = parsed.data.status
      draft.updatedAt = now
    })
    return { handled: true, data: farmerFarmsCollection.get(farmId) }
  }

  return { handled: false }
}
