import { calculateStraightLineDistanceKm } from '@/components/home/offer-card-helpers'
import { matchesOfferCategory } from './categories'
import type { User } from '@/types/api/auth'
import type { Offer } from '@/types/api/offers'

export function getMatchedOfferNotificationId(userId: string, offerId: string) {
  return 'matched-offer-' + userId + ':' + offerId
}

export function matchesOfferReminder(
  user: User,
  offer: Offer,
  favorites: Offer[],
  now = Date.now()
) {
  if (
    user.role !== 'buyer' ||
    !user.preferences?.harvestReminders ||
    offer.status !== 'active' ||
    offer.availableStockKg < 0.001 ||
    Date.parse(offer.orderDeadline) <= now
  )
    return false
  const address = user.addresses?.find((item) => item.isDefault) ?? user.addresses?.[0]
  if (!address || offer.latitude === undefined || offer.longitude === undefined) return false
  if (
    !user.followedFarmerIds?.includes(offer.farmerId) &&
    !favorites.some((item) => matchesOfferCategory(offer.category, item.category))
  )
    return false
  return (
    calculateStraightLineDistanceKm(
      { lat: address.latitude, lng: address.longitude },
      { lat: offer.latitude, lng: offer.longitude }
    ) <= (user.preferences.reminderRadiusKm ?? 10)
  )
}
