import { ApiError } from '../errors'
import { createUniqueId } from '@/lib/utils'
import { farmerFarmsCollection } from './collections/farmer-management'
import { notificationsCollection } from './collections/notifications'
import { offersCollection } from './collections/offers'
import { usersCollection } from './collections/users'
import type { RouteContext } from './route-context'
import { getCategoryMeta, normalizeCategorySlug } from '@/lib/data/categories'
import { getMatchedOfferNotificationId, matchesOfferReminder } from '@/lib/data/reminder-helpers'
import { getBuyerPreferences } from './buyer-preferences'
import {
  AdjustOfferStockRequestSchema,
  SaveFarmerOfferRequestSchema,
} from '@/types/api/farmer-management'
import type { User } from '@/types/api/auth'
import type { Offer } from '@/types/api/offers'

function notifyMatchingBuyers(offer: Offer) {
  for (const user of usersCollection.values()) {
    if (user.role !== 'buyer') continue
    const buyer = { ...user, ...getBuyerPreferences(user) }
    const favorites = (buyer.favoriteOfferIds ?? []).flatMap((id) => {
      const favorite = offersCollection.get(id)
      return favorite ? [favorite] : []
    })
    const id = getMatchedOfferNotificationId(buyer.id, offer.id)
    if (notificationsCollection.get(id) || !matchesOfferReminder(buyer, offer, favorites)) continue
    notificationsCollection.insert({
      id,
      userId: buyer.id,
      type: 'matched_offer',
      title: offer.commodityName + ' tersedia di sekitar Anda',
      message: offer.farmerName + ' menerbitkan penawaran di ' + offer.pickupAddressArea + '.',
      link: '/pasar/penawaran/' + offer.id,
      isRead: false,
      createdAt: offer.createdAt,
    })
  }
}

function assertOwnedOffer(offerId: string, farmerId: string): Offer {
  const offer = offersCollection.get(offerId)
  if (!offer || offer.farmerId !== farmerId) {
    throw new ApiError(404, 'Penawaran tidak ditemukan', 'NOT_FOUND')
  }
  return offer
}

function validatePublishRules(
  farmer: User,
  status: 'draft' | 'active',
  orderDeadline: string,
  availableStockKg: number,
  slotsCount: number
) {
  if (status !== 'active') return
  if (!farmer.isVerifiedFarmer) {
    throw new ApiError(
      403,
      'Verifikasi akun diperlukan sebelum menerbitkan penawaran',
      'FARMER_UNVERIFIED'
    )
  }
  const deadline = Date.parse(orderDeadline)
  if (!Number.isFinite(deadline) || deadline <= Date.now()) {
    throw new ApiError(
      400,
      'Batas waktu pemesanan harus lebih dari waktu saat ini',
      'INVALID_OFFER'
    )
  }
  if (availableStockKg < 0.001 || slotsCount < 1) {
    throw new ApiError(400, 'Lengkapi stok dan minimal satu jadwal pengambilan', 'INVALID_OFFER')
  }
}

function resolveCategoryLabel(categoryInput: string): string {
  const slug = normalizeCategorySlug(categoryInput)
  return slug ? getCategoryMeta(slug).label : categoryInput
}

export function handleFarmerOfferRoute(
  ctx: RouteContext,
  farmer: User
): { handled: boolean; data?: unknown } {
  const { endpoint, method, body, parseJsonBody } = ctx

  if (endpoint === '/api/farmer/offers' && method === 'POST') {
    const parsed = SaveFarmerOfferRequestSchema.safeParse(parseJsonBody(body))
    if (!parsed.success) {
      throw new ApiError(
        400,
        parsed.error.issues[0]?.message ?? 'Periksa data penawaran',
        'INVALID_OFFER'
      )
    }
    const payload = parsed.data
    const farm = farmerFarmsCollection.get(payload.farmId)
    if (!farm || farm.farmerId !== farmer.id || farm.status !== 'active') {
      throw new ApiError(400, 'Pilih kebun aktif milik Anda', 'INVALID_FARM')
    }
    const availableSlots = payload.pickupScheduleSlots.filter((slot) => slot.isAvailable !== false)
    validatePublishRules(
      farmer,
      payload.status,
      payload.orderDeadline,
      payload.availableStockKg,
      availableSlots.length
    )

    const now = new Date().toISOString()
    const offer: Offer = {
      id: createUniqueId('off-'),
      farmerId: farmer.id,
      farmerName: farmer.organization ? `${farmer.name} (${farmer.organization})` : farmer.name,
      farmId: farm.id,
      commodityName: payload.commodityName,
      category: resolveCategoryLabel(payload.category),
      condition: payload.condition,
      conditionNote: payload.conditionNote || undefined,
      surplusReason: payload.surplusReason || undefined,
      estimatedPortionNote: payload.estimatedPortionNote || undefined,
      harvestDate: payload.harvestDate,
      availableStockKg: payload.availableStockKg,
      reservedStockKg: 0,
      soldStockKg: 0,
      pricePerKg: payload.pricePerKg,
      dynamicPriceRule: payload.dynamicPriceRule,
      dynamicPriceStartsAt:
        payload.dynamicPriceRule && payload.status === 'active' ? now : undefined,
      orderDeadline: payload.orderDeadline,
      pickupAddressArea: farm.areaName,
      pickupAddressFull: farm.fullAddress,
      latitude: farm.latitude ?? -6.8167,
      longitude: farm.longitude ?? 107.6167,
      pickupScheduleSlots: payload.pickupScheduleSlots,
      photos:
        payload.photos && payload.photos.length > 0
          ? payload.photos
          : [
              'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=640&q=80',
            ],
      status: payload.status,
      createdAt: now,
      updatedAt: now,
    }
    offersCollection.insert(offer)
    if (offer.status === 'active') notifyMatchingBuyers(offer)
    return { handled: true, data: offer }
  }

  const offerMatch = /^\/api\/farmer\/offers\/([^/]+)$/.exec(endpoint)
  if (offerMatch && method === 'GET') {
    const offerId = decodeURIComponent(offerMatch[1])
    return { handled: true, data: assertOwnedOffer(offerId, farmer.id) }
  }

  if (offerMatch && method === 'PATCH') {
    const offerId = decodeURIComponent(offerMatch[1])
    const existing = assertOwnedOffer(offerId, farmer.id)
    const parsed = SaveFarmerOfferRequestSchema.safeParse(parseJsonBody(body))
    if (!parsed.success) {
      throw new ApiError(
        400,
        parsed.error.issues[0]?.message ?? 'Periksa data penawaran',
        'INVALID_OFFER'
      )
    }
    const payload = parsed.data
    const farm = farmerFarmsCollection.get(payload.farmId)
    if (!farm || farm.farmerId !== farmer.id || farm.status !== 'active') {
      throw new ApiError(400, 'Pilih kebun aktif milik Anda', 'INVALID_FARM')
    }
    const availableSlots = payload.pickupScheduleSlots.filter((slot) => slot.isAvailable !== false)
    validatePublishRules(
      farmer,
      payload.status,
      payload.orderDeadline,
      payload.availableStockKg,
      availableSlots.length
    )

    const now = new Date().toISOString()
    offersCollection.update(existing.id, (draft) => {
      draft.farmId = farm.id
      draft.commodityName = payload.commodityName
      draft.category = resolveCategoryLabel(payload.category)
      draft.condition = payload.condition
      draft.conditionNote = payload.conditionNote || undefined
      draft.surplusReason = payload.surplusReason || undefined
      draft.estimatedPortionNote = payload.estimatedPortionNote || undefined
      draft.harvestDate = payload.harvestDate
      draft.availableStockKg = payload.availableStockKg
      draft.pricePerKg = payload.pricePerKg
      draft.dynamicPriceRule = payload.dynamicPriceRule
      draft.dynamicPriceStartsAt =
        payload.dynamicPriceRule && payload.status === 'active'
          ? (draft.dynamicPriceStartsAt ?? now)
          : undefined
      draft.orderDeadline = payload.orderDeadline
      draft.pickupAddressArea = farm.areaName
      draft.pickupAddressFull = farm.fullAddress
      draft.latitude = farm.latitude ?? draft.latitude
      draft.longitude = farm.longitude ?? draft.longitude
      draft.pickupScheduleSlots = payload.pickupScheduleSlots
      if (payload.photos && payload.photos.length > 0) {
        draft.photos = payload.photos
      }
      draft.status = payload.status
      draft.updatedAt = now
    })
    const updated = offersCollection.get(existing.id)
    if (existing.status === 'draft' && updated?.status === 'active') {
      notifyMatchingBuyers(updated)
    }
    return { handled: true, data: updated }
  }

  const closeMatch = /^\/api\/farmer\/offers\/([^/]+)\/close$/.exec(endpoint)
  if (closeMatch && method === 'POST') {
    const offerId = decodeURIComponent(closeMatch[1])
    const existing = assertOwnedOffer(offerId, farmer.id)
    offersCollection.update(existing.id, (draft) => {
      draft.status = 'closed'
      draft.updatedAt = new Date().toISOString()
    })
    return { handled: true, data: offersCollection.get(existing.id) }
  }

  const duplicateMatch = /^\/api\/farmer\/offers\/([^/]+)\/duplicate$/.exec(endpoint)
  if (duplicateMatch && method === 'POST') {
    const offerId = decodeURIComponent(duplicateMatch[1])
    const source = assertOwnedOffer(offerId, farmer.id)
    const now = new Date().toISOString()
    const nextDay = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const duplicated: Offer = {
      ...source,
      id: createUniqueId('off-'),
      commodityName: `${source.commodityName} (Salinan)`,
      availableStockKg: 1,
      reservedStockKg: 0,
      soldStockKg: 0,
      harvestDate: now,
      orderDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      pickupScheduleSlots: [
        {
          id: createUniqueId('slot-').slice(0, 13),
          date: nextDay,
          startTime: '08:00',
          endTime: '11:00',
          isAvailable: true,
        },
      ],
      status: 'draft',
      dynamicPriceStartsAt: undefined,
      createdAt: now,
      updatedAt: now,
    }
    offersCollection.insert(duplicated)
    return { handled: true, data: duplicated }
  }

  const stockMatch = /^\/api\/farmer\/offers\/([^/]+)\/stock-adjustment$/.exec(endpoint)
  if (stockMatch && method === 'POST') {
    const offerId = decodeURIComponent(stockMatch[1])
    const existing = assertOwnedOffer(offerId, farmer.id)
    const parsed = AdjustOfferStockRequestSchema.safeParse(parseJsonBody(body))
    if (!parsed.success) {
      throw new ApiError(
        400,
        parsed.error.issues[0]?.message ?? 'Periksa koreksi stok dan kondisi',
        'INVALID_STOCK_ADJUSTMENT'
      )
    }
    const payload = parsed.data
    const now = new Date().toISOString()
    offersCollection.update(existing.id, (draft) => {
      draft.availableStockKg = payload.availableStockKg
      draft.condition = payload.condition
      draft.conditionNote = payload.conditionNote || undefined
      if (payload.closeOffer) {
        draft.status = 'closed'
      } else if (payload.availableStockKg === 0 && draft.status === 'active') {
        draft.status = 'sold_out'
      } else if (payload.availableStockKg > 0 && draft.status === 'sold_out') {
        draft.status = 'active'
      }
      draft.updatedAt = now
    })
    return { handled: true, data: offersCollection.get(existing.id) }
  }

  return { handled: false }
}
