import { createCollection, localOnlyCollectionOptions } from '@tanstack/react-db'
import { OfferSchema } from '@/types/api/offers'
import { mockOffersData } from '../fixtures/offers.fixture'

export const offersCollection = createCollection(
  localOnlyCollectionOptions({
    id: 'offers',
    schema: OfferSchema,
    getKey: (item) => item.id,
    initialData: mockOffersData,
  })
)
