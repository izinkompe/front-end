import { ApiError } from '../errors'
import { createUniqueId } from '@/lib/utils'
import { farmerReviewsCollection } from './collections/farmer-reviews'
import { offersCollection } from './collections/offers'
import { usersCollection } from './collections/users'
import {
  ensureFarmerFarms,
  ensureFarmerStoreSettings,
  farmerFarmsCollection,
  farmerStoreSettingsCollection,
} from './collections/farmer-management'
import { handleFarmerOfferRoute } from './farmer-offer-routes'
import { handleFarmerOrderRoute } from './farmer-order-routes'
import { requireFarmer, type RouteContext } from './route-context'
import {
  CreateFarmerFarmRequestSchema,
  ReplyFarmerReviewRequestSchema,
  ToggleFeaturedOfferRequestSchema,
  UpdateFarmerBankAccountRequestSchema,
  UpdateFarmerFarmRequestSchema,
  UpdateFarmerStoreSettingsRequestSchema,
  type FarmerFarm,
} from '@/types/api/farmer-management'

function getOwnedFarm(farmId: string, farmerId: string) {
  const farm = farmerFarmsCollection.get(farmId)
  if (!farm || farm.farmerId !== farmerId) {
    throw new ApiError(404, 'Kebun tidak ditemukan', 'NOT_FOUND')
  }
  return farm
}

export function handleFarmerManagementRoute(ctx: RouteContext) {
  const { endpoint, method, body, activeSessionUserId, parseJsonBody } = ctx
  if (!endpoint.startsWith('/api/farmer/')) return { handled: false }

  const farmer = requireFarmer(activeSessionUserId)

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

  if (endpoint === '/api/farmer/store/featured' && method === 'PATCH') {
    const parsed = ToggleFeaturedOfferRequestSchema.safeParse(parseJsonBody(body))
    if (!parsed.success) {
      throw new ApiError(400, 'Pilihan penawaran unggulan tidak valid', 'INVALID_FEATURED_OFFER')
    }
    const offer = offersCollection.get(parsed.data.offerId)
    if (!offer || offer.farmerId !== farmer.id) {
      throw new ApiError(404, 'Penawaran tidak ditemukan', 'NOT_FOUND')
    }
    const current = ensureFarmerStoreSettings(farmer)
    const existingIds = current.featuredOfferIds ?? []
    const nextIds = parsed.data.featured
      ? existingIds.includes(offer.id)
        ? existingIds
        : [...existingIds, offer.id]
      : existingIds.filter((id) => id !== offer.id)

    if (nextIds.length > 6) {
      throw new ApiError(400, 'Maksimal 6 penawaran unggulan pada etalase toko', 'FEATURED_LIMIT')
    }

    farmerStoreSettingsCollection.update(farmer.id, (draft) => {
      draft.featuredOfferIds = nextIds
      draft.updatedAt = new Date().toISOString()
    })
    return { handled: true, data: farmerStoreSettingsCollection.get(farmer.id) }
  }

  if (endpoint === '/api/farmer/bank-account' && method === 'GET') {
    return {
      handled: true,
      data: farmer.bankAccount ?? {
        bankName: '',
        accountNumber: '',
        accountHolderName: '',
      },
    }
  }

  if (endpoint === '/api/farmer/bank-account' && method === 'PATCH') {
    const parsed = UpdateFarmerBankAccountRequestSchema.safeParse(parseJsonBody(body))
    if (!parsed.success) {
      throw new ApiError(
        400,
        parsed.error.issues[0]?.message ?? 'Periksa data rekening penerimaan dana',
        'INVALID_BANK_ACCOUNT'
      )
    }
    usersCollection.update(farmer.id, (draft) => {
      draft.bankAccount = parsed.data
      draft.updatedAt = new Date().toISOString()
    })
    return { handled: true, data: usersCollection.get(farmer.id)?.bankAccount }
  }

  if (endpoint === '/api/farmer/reviews' && method === 'GET') {
    const reviews = Array.from(farmerReviewsCollection.values())
      .filter((review) => review.farmerId === farmer.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return { handled: true, data: reviews }
  }

  const replyReviewMatch = /^\/api\/farmer\/reviews\/([^/]+)\/reply$/.exec(endpoint)
  if (replyReviewMatch && method === 'POST') {
    const reviewId = decodeURIComponent(replyReviewMatch[1])
    const review = farmerReviewsCollection.get(reviewId)
    if (!review || review.farmerId !== farmer.id) {
      throw new ApiError(404, 'Ulasan tidak ditemukan', 'NOT_FOUND')
    }
    const parsed = ReplyFarmerReviewRequestSchema.safeParse(parseJsonBody(body))
    if (!parsed.success) {
      throw new ApiError(
        400,
        parsed.error.issues[0]?.message ?? 'Periksa isi balasan ulasan',
        'INVALID_REVIEW_REPLY'
      )
    }
    farmerReviewsCollection.update(review.id, (draft) => {
      draft.farmerReply = {
        message: parsed.data.message,
        repliedAt: new Date().toISOString(),
      }
    })
    return { handled: true, data: farmerReviewsCollection.get(review.id) }
  }

  if (endpoint === '/api/farmer/offers' && method === 'GET') {
    const items = Array.from(offersCollection.values()).filter(
      (offer) => offer.farmerId === farmer.id
    )
    return { handled: true, data: items }
  }

  const offerResult = handleFarmerOfferRoute(ctx, farmer)
  if (offerResult.handled) return offerResult

  const orderResult = handleFarmerOrderRoute(ctx, farmer)
  if (orderResult.handled) return orderResult

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
      throw new ApiError(
        400,
        parsed.error.issues[0]?.message ?? 'Periksa kembali informasi kebun',
        'INVALID_FARM'
      )
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
      id: createUniqueId('farm-'),
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
    const existing = getOwnedFarm(farmId, farmer.id)
    const parsed = UpdateFarmerFarmRequestSchema.safeParse(parseJsonBody(body))
    if (!parsed.success) {
      throw new ApiError(
        400,
        parsed.error.issues[0]?.message ?? 'Periksa kembali informasi kebun',
        'INVALID_FARM'
      )
    }
    if (parsed.data.status === 'archived' && existing.status === 'active') {
      const hasLinkedActiveOffers = Array.from(offersCollection.values()).some(
        (offer) =>
          offer.farmerId === farmer.id &&
          offer.status === 'active' &&
          (offer.farmId === farmId ||
            (!offer.farmId && offer.pickupAddressArea === existing.areaName))
      )
      if (hasLinkedActiveOffers) {
        throw new ApiError(
          409,
          'Kebun masih memiliki penawaran aktif. Tutup penawaran terkait terlebih dahulu sebelum mengarsipkan.',
          'FARM_HAS_ACTIVE_OFFERS'
        )
      }
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
      draft.latitude = parsed.data.latitude
      draft.longitude = parsed.data.longitude
      draft.primaryCommodities = parsed.data.primaryCommodities
      draft.pickupNotes = parsed.data.pickupNotes
      draft.status = parsed.data.status
      draft.updatedAt = now
    })
    return { handled: true, data: farmerFarmsCollection.get(farmId) }
  }

  return { handled: false }
}
