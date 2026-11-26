import { buildCheckoutHref } from './checkout-helpers'
import { matchesOfferCategory } from './categories'
import type { NeedRequest, NeedRequestStatus, NeedResponse } from '@/types/api/needs-board'
import type { Offer } from '@/types/api/offers'

export const needStatusLabels = {
  open: 'Terbuka',
  partially_fulfilled: 'Terpenuhi sebagian',
  fulfilled: 'Terpenuhi',
  closed: 'Ditutup',
  expired: 'Lewat tanggal kebutuhan',
} satisfies Record<NeedRequestStatus, string>

const jakartaDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Jakarta',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function getJakartaDate(now = Date.now()) {
  return jakartaDate.format(now)
}

export function isActiveNeed(need: NeedRequest) {
  return need.status === 'open' || need.status === 'partially_fulfilled'
}

export function getNeedStatus(need: NeedRequest, today: string): NeedRequestStatus {
  return isActiveNeed(need) && need.targetDate < today ? 'expired' : need.status
}

export function filterNeeds(
  needs: NeedRequest[],
  {
    ownerId,
    search,
    category,
    status,
  }: {
    ownerId?: string
    search: string
    category: string
    status: string
  }
) {
  const query = search.trim().toLocaleLowerCase('id')
  return needs.filter(
    (need) =>
      (ownerId ? need.buyerId === ownerId : isActiveNeed(need)) &&
      (!category || matchesOfferCategory(need.category, category)) &&
      (!status || need.status === status) &&
      [need.commodityName, need.targetArea].some((value) =>
        value.toLocaleLowerCase('id').includes(query)
      )
  )
}

export function getRemainingNeedKg(need: NeedRequest) {
  return need.status === 'fulfilled'
    ? 0
    : Math.max(0, Number((need.neededQuantityKg - (need.fulfilledQuantityKg ?? 0)).toFixed(3)))
}

export function getNeedCheckoutHref(
  need: NeedRequest,
  response: NeedResponse,
  offer: Offer | undefined,
  now = Date.now()
) {
  if (
    !offer ||
    offer.id !== response.offerId ||
    offer.farmerId !== response.farmerId ||
    offer.status !== 'active' ||
    Date.parse(offer.orderDeadline) <= now ||
    !isActiveNeed(need)
  )
    return null
  const quantityKg = Math.min(
    getRemainingNeedKg(need),
    response.offeredQuantityKg,
    offer.availableStockKg
  )
  if (quantityKg < 0.001) return null
  const slot = offer.pickupScheduleSlots.find(
    (item) => item.isAvailable !== false && item.date === response.availableDate
  )
  return buildCheckoutHref({
    offerId: offer.id,
    quantityKg,
    slotId: slot?.id,
    pricePerKg: response.offeredPricePerKg,
  })
}
