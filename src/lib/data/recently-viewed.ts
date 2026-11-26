import { z } from 'zod'
import { readLocalValue, writeLocalValue } from './browser-storage'

const OfferIdsSchema = z.array(z.string().regex(/^[\w-]+$/)).max(8)

function key(userId: string) {
  return 'pangantani:recent-offers:' + userId
}

export function readRecentlyViewed(userId: string) {
  return OfferIdsSchema.safeParse(readLocalValue(key(userId))).data ?? []
}

export function recordRecentlyViewed(userId: string, offerId: string) {
  const existing = readRecentlyViewed(userId)
  const ids = [offerId, ...existing.filter((id) => id !== offerId)].slice(0, 8)
  if (OfferIdsSchema.safeParse(ids).success) writeLocalValue(key(userId), ids)
}
