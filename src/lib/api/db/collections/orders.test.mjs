import { describe, expect, it } from 'bun:test'
import { apiClient } from '../../client'
import { offersCollection } from './offers'
import { OrderSchema } from '../../../../types/api/orders'
import { PaymentDetailSchema } from '../../../../types/api/payments'

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
    expect(newOrder.bankAccount?.accountNumber).toBeDefined()

    const paymentDetail = await apiClient(
      '/api/orders/' + newOrder.id + '/payment',
      PaymentDetailSchema
    )
    expect(paymentDetail.orderId).toBe(newOrder.id)
    expect(paymentDetail.status).toBe('pending')

    const updatedOffer = offersCollection.get('off-002')
    expect(updatedOffer.availableStockKg).toBe(initialAvailable - orderQuantity)
    expect(updatedOffer.reservedStockKg).toBe(initialReserved + orderQuantity)
  })

  it('rejects order creation with 409 when acceptedPricePerKg differs from current offer price', async () => {
    const initialOffer = offersCollection.get('off-002')
    expect(initialOffer).toBeDefined()

    let thrownError = null
    try {
      await apiClient('/api/orders', OrderSchema, {
        method: 'POST',
        body: JSON.stringify({
          offerId: 'off-002',
          quantityKg: 2,
          scheduleSlotId: 'slot-3',
          acceptedPricePerKg: initialOffer.pricePerKg + 500,
        }),
      })
    } catch (error) {
      thrownError = error
    }

    expect(thrownError).not.toBeNull()
    expect(thrownError.status).toBe(409)
    expect(thrownError.code).toBe('PRICE_CHANGED')
  })

  it('submits payment proof and updates payment detail status to under_review', async () => {
    const order = await apiClient('/api/orders', OrderSchema, {
      method: 'POST',
      body: JSON.stringify({
        offerId: 'off-002',
        quantityKg: 3,
        scheduleSlotId: 'slot-3',
      }),
    })

    const submittedOrder = await apiClient('/api/orders/' + order.id + '/payments', OrderSchema, {
      method: 'POST',
      body: JSON.stringify({
        proofUrl: 'data:image/png;base64,iVBORw0KGgo=',
        notes: 'Transfer via m-banking BRI',
      }),
    })

    expect(submittedOrder.status).toBe('payment_submitted')
    expect(submittedOrder.paymentProofUrl).toBe('data:image/png;base64,iVBORw0KGgo=')

    const paymentDetail = await apiClient(
      '/api/orders/' + order.id + '/payment',
      PaymentDetailSchema
    )
    expect(paymentDetail.status).toBe('under_review')
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

  it('saves buyer address and attaches custom buyerAddress to created orders', async () => {
    const loginResult = await apiClient('/api/auth/login', undefined, {
      method: 'POST',
      body: JSON.stringify({ email: 'ratna@dapurkasih.org', password: 'password123' }),
    })
    expect(loginResult.user.id).toBe('usr-pb-01')

    const updatedUser = await apiClient('/api/auth/addresses', undefined, {
      method: 'POST',
      body: JSON.stringify({
        label: 'Gudang Selatan',
        areaName: 'Buahbatu, Bandung',
        fullAddress: 'Jl. Soekarno Hatta No. 120, Buahbatu, Bandung',
        setAsDefault: true,
      }),
    })
    expect(updatedUser.addresses.some((addr) => addr.label === 'Gudang Selatan')).toBe(true)

    const orderWithAddress = await apiClient('/api/orders', OrderSchema, {
      method: 'POST',
      body: JSON.stringify({
        offerId: 'off-002',
        quantityKg: 2,
        scheduleSlotId: 'slot-3',
        buyerAddress: {
          label: 'Gudang Selatan',
          areaName: 'Buahbatu, Bandung',
          fullAddress: 'Jl. Soekarno Hatta No. 120, Buahbatu, Bandung',
        },
      }),
    })
    expect(orderWithAddress.buyerAddress?.label).toBe('Gudang Selatan')
    expect(orderWithAddress.buyerAddress?.areaName).toBe('Buahbatu, Bandung')
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
