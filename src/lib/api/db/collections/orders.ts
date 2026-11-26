import { createCollection, localOnlyCollectionOptions } from '@tanstack/react-db'
import { mockOrdersData } from '../fixtures/orders.fixture'
import { OrderSchema, type Order } from '@/types/api/orders'

export const ordersCollection = createCollection(
  localOnlyCollectionOptions({
    id: 'orders',
    schema: OrderSchema,
    getKey: (item) => item.id,
    initialData: mockOrdersData as Order[],
  })
)
