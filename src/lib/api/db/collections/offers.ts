import { createCollection, localOnlyCollectionOptions } from '@tanstack/react-db'
import { OfferSchema } from '@/types/api/offers'
import { mockOffersData } from '../fixtures/offers.fixture'

const datedOffers = mockOffersData.map((offer) => {
  const rule = offer.dynamicPriceRule
  if (!rule || offer.dynamicPriceStartsAt) return offer
  const elapsedSteps = Math.ceil(Math.max(0, rule.startPrice - offer.pricePerKg) / rule.dropAmount)
  const hours = (elapsedSteps + 0.5) * rule.dropIntervalHours
  return {
    ...offer,
    dynamicPriceStartsAt: new Date(Date.now() - hours * 60 * 60 * 1000).toISOString(),
  }
})

export const offersCollection = createCollection(
  localOnlyCollectionOptions({
    id: 'offers',
    schema: OfferSchema,
    getKey: (item) => item.id,
    initialData: datedOffers,
  })
)
