import { createCollection, localOnlyCollectionOptions } from '@tanstack/react-db'
import { OrderSchema, type Order } from '@/types/api/orders'

export const ordersCollection = createCollection(
  localOnlyCollectionOptions({
    id: 'orders',
    schema: OrderSchema,
    getKey: (item) => item.id,
    initialData: [] as Order[],
  })
)
