import { ApiError } from '../errors'
import { offersCollection } from './collections/offers'
import { usersCollection } from './collections/users'
import { notificationsCollection } from './collections/notifications'
import { getBuyerPreferences } from './buyer-preferences'
import { getOfferPriceSchedule } from '@/lib/data/offer-price-schedule'
import { getMatchedOfferNotificationId, matchesOfferReminder } from '@/lib/data/reminder-helpers'
import { OfferSchema, type Offer } from '@/types/api/offers'
import type { RouteContext } from './route-context'

const NewOfferSchema = OfferSchema.omit({
  id: true,
  farmerId: true,
  farmerName: true,
  createdAt: true,
  updatedAt: true,
  reservedStockKg: true,
  soldStockKg: true,
  dynamicPriceStartsAt: true,
}).extend({ status: OfferSchema.shape.status.extract(['active', 'draft']) })

export function toPublicOffer(offer: Offer): Offer {
  const { pickupAddressFull: _, ...publicOffer } = offer
  return { ...publicOffer, pricePerKg: getOfferPriceSchedule(offer, Date.now()).currentPricePerKg }
}

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

export function handleOfferWriteRoute({
  endpoint,
  method,
  body,
  activeSessionUserId,
  parseJsonBody,
}: RouteContext) {
  if (endpoint !== '/api/offers' || method !== 'POST') return { handled: false }

  const farmer = activeSessionUserId ? usersCollection.get(activeSessionUserId) : undefined
  if (!farmer) throw new ApiError(401, 'Masuk sebagai petani', 'UNAUTHORIZED')
  if (farmer.role !== 'farmer')
    throw new ApiError(403, 'Hanya petani yang dapat membuat penawaran', 'FORBIDDEN')

  const parsed = NewOfferSchema.safeParse(parseJsonBody(body))
  if (!parsed.success) throw new ApiError(400, 'Periksa data penawaran', 'INVALID_OFFER')
  const data = parsed.data
  if (data.status === 'active') {
    if (!farmer.isVerifiedFarmer)
      throw new ApiError(403, 'Verifikasi akun sebelum menerbitkan penawaran', 'FARMER_UNVERIFIED')
    const deadline = Date.parse(data.orderDeadline)
    if (
      !Number.isFinite(deadline) ||
      deadline <= Date.now() ||
      data.availableStockKg < 0.001 ||
      !data.pickupScheduleSlots.some((slot) => slot.isAvailable !== false)
    ) {
      throw new ApiError(400, 'Lengkapi stok, tenggat, dan jadwal pengambilan', 'INVALID_OFFER')
    }
  }
  const now = new Date().toISOString()
  const offer: Offer = {
    ...data,
    id: 'off-' + crypto.randomUUID(),
    farmerId: farmer.id,
    farmerName: farmer.name,
    createdAt: now,
    updatedAt: now,
    reservedStockKg: 0,
    soldStockKg: 0,
    dynamicPriceStartsAt: data.dynamicPriceRule && data.status === 'active' ? now : undefined,
  }
  offersCollection.insert(offer)
  if (offer.status === 'active') notifyMatchingBuyers(offer)
  return { handled: true, data: offer }
}
