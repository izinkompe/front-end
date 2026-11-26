import { createCollection, localOnlyCollectionOptions } from '@tanstack/react-db'
import { FarmerReviewSchema } from '@/types/api/farmers'
import { mockFarmerReviewsData } from '../fixtures/farmer-stores.fixture'

export const farmerReviewsCollection = createCollection(
  localOnlyCollectionOptions({
    id: 'farmer-reviews',
    schema: FarmerReviewSchema,
    getKey: (item) => item.id,
    initialData: mockFarmerReviewsData,
  })
)
