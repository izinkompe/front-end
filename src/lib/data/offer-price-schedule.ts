import type { Offer } from '@/types/api/offers'

const hourMs = 60 * 60 * 1000

export function getOfferPriceSchedule(offer: Offer, now: number) {
  const rule = offer.dynamicPriceRule
  const start = Date.parse(offer.dynamicPriceStartsAt ?? '')
  const deadline = Date.parse(offer.orderDeadline)
  if (!rule || !Number.isFinite(start) || !Number.isFinite(deadline)) {
    return { currentPricePerKg: offer.pricePerKg, nextDropAt: null }
  }
  const interval = rule.dropIntervalHours * hourMs
  const position = Math.max(0, Math.floor((Math.min(deadline - 1, now) - start) / interval))
  const currentPricePerKg = Math.max(rule.minPrice, rule.startPrice - position * rule.dropAmount)
  const next = start + (position + 1) * interval
  return {
    currentPricePerKg,
    nextDropAt:
      offer.status === 'active' &&
      offer.availableStockKg > 0 &&
      next > now &&
      next < deadline &&
      currentPricePerKg > rule.minPrice
        ? next
        : null,
  }
}
