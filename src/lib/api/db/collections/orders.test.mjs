import { describe, expect, it } from 'bun:test'
import { apiClient } from '../../client'
import { offersCollection } from './offers'
import { OrderSchema } from '../../../../types/api/orders'

describe('TanStack DB Atomic Orders & Stock Mutation', () => {
  it('deducts available stock and reserves stock atomically upon order creation', async () => {
    const initialOffer = offersCollection.get('off-002')
    expect(initialOffer).toBeDefined()
    const initialAvailable = initialOffer.availableStockKg
    const initialReserved = initialOffer.reservedStockKg

    const orderQuantity = 10
    const newOrder = await apiClient('/api/orders', OrderSchema, {
      method: 'POST',
      body: JSON.stringify({
        offerId: 'off-002',
        quantityKg: orderQuantity,
        scheduleSlotId: 'slot-3',
        notes: 'Uji atomisitas pesanan',
      }),
    })

    expect(newOrder.id).toBeDefined()
    expect(newOrder.quantityKg).toBe(orderQuantity)
    expect(newOrder.status).toBe('pending_payment')

    const updatedOffer = offersCollection.get('off-002')
    expect(updatedOffer.availableStockKg).toBe(initialAvailable - orderQuantity)
    expect(updatedOffer.reservedStockKg).toBe(initialReserved + orderQuantity)
  })

  it('releases reserved stock back to available stock when an order is cancelled', async () => {
    const offerBefore = offersCollection.get('off-002')
    const availableBefore = offerBefore.availableStockKg
    const reservedBefore = offerBefore.reservedStockKg

    const testOrder = await apiClient('/api/orders', OrderSchema, {
      method: 'POST',
      body: JSON.stringify({
        offerId: 'off-002',
        quantityKg: 5,
        scheduleSlotId: 'slot-3',
      }),
    })

    const cancelledOrder = await apiClient('/api/orders/' + testOrder.id + '/cancel', OrderSchema, {
      method: 'POST',
    })

    expect(cancelledOrder.status).toBe('cancelled')
    const offerAfter = offersCollection.get('off-002')
    expect(offerAfter.availableStockKg).toBe(availableBefore)
    expect(offerAfter.reservedStockKg).toBe(reservedBefore)
  })

  it('allows receipt confirmation and updates order status to completed', async () => {
    const testOrder = await apiClient('/api/orders', OrderSchema, {
      method: 'POST',
      body: JSON.stringify({
        offerId: 'off-002',
        quantityKg: 8,
        scheduleSlotId: 'slot-3',
      }),
    })

    const completedOrder = await apiClient(
      '/api/orders/' + testOrder.id + '/confirm-receipt',
      OrderSchema,
      {
        method: 'POST',
        body: JSON.stringify({ confirmedWeightKg: 8 }),
      }
    )

    expect(completedOrder.status).toBe('completed')
    expect(completedOrder.confirmedWeightKg).toBe(8)
  })
})
