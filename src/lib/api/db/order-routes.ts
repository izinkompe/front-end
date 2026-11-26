import { ApiError } from '../errors'
import { isSafeProofImageUrl } from '@/lib/data/checkout-helpers'
import { offersCollection } from './collections/offers'
import { ordersCollection } from './collections/orders'
import { usersCollection } from './collections/users'
import type { Order } from '@/types/api/orders'
import type { PaymentDetail } from '@/types/api/payments'

interface OrderRouteContext {
  endpoint: string
  method: string
  params?: Record<string, string | number | boolean | undefined>
  body: unknown
  activeSessionUserId: string | null
  parseJsonBody: <T = Record<string, unknown>>(body: unknown) => T
}

export function handleOrderRoute(ctx: OrderRouteContext): { handled: boolean; data?: unknown } {
  const { endpoint, method, params, body, activeSessionUserId, parseJsonBody } = ctx

  if (endpoint === '/api/orders' && method === 'GET') {
    let items = Array.from(ordersCollection.values())
    if (params?.status) {
      items = items.filter((item) => item.status === params?.status)
    }
    return { handled: true, data: items }
  }

  if (endpoint === '/api/orders' && method === 'POST') {
    const payload = parseJsonBody<{
      offerId: string
      quantityKg: number
      scheduleSlotId?: string
      notes?: string
      contactName?: string
      contactPhone?: string
      buyerAddress?: {
        label: string
        fullAddress: string
        areaName: string
      }
      acceptedPricePerKg?: number
    }>(body)

    const offer = offersCollection.get(payload.offerId)
    if (!offer) {
      throw new ApiError(404, 'Penawaran komoditas tidak ditemukan', 'NOT_FOUND')
    }
    if (offer.status !== 'active' || Date.parse(offer.orderDeadline) <= Date.now()) {
      throw new ApiError(
        400,
        'Batas waktu pemesanan untuk penawaran ini telah berakhir',
        'OFFER_EXPIRED'
      )
    }
    if (
      typeof payload.acceptedPricePerKg === 'number' &&
      Math.round(payload.acceptedPricePerKg) !== Math.round(offer.pricePerKg)
    ) {
      throw new ApiError(
        409,
        'Harga per kilogram telah diperbarui. Tinjau total terbaru sebelum melanjutkan.',
        'PRICE_CHANGED'
      )
    }
    if (
      typeof payload.quantityKg !== 'number' ||
      !Number.isFinite(payload.quantityKg) ||
      payload.quantityKg < 0.001
    ) {
      throw new ApiError(400, 'Berat pesanan tidak valid', 'INVALID_QUANTITY')
    }
    if (offer.availableStockKg < payload.quantityKg) {
      throw new ApiError(400, 'Stok tidak mencukupi untuk pemesanan ini', 'INSUFFICIENT_STOCK')
    }

    offersCollection.update(offer.id, (draft) => {
      draft.availableStockKg -= payload.quantityKg
      draft.reservedStockKg += payload.quantityKg
    })

    const selectedSlot = offer.pickupScheduleSlots.find(
      (slot) => slot.id === payload.scheduleSlotId
    ) ||
      offer.pickupScheduleSlots[0] || {
        id: 'slot-default',
        date: '2026-11-25',
        startTime: '08:00',
        endTime: '10:00',
      }

    const farmer = usersCollection.get(offer.farmerId)
    const farmerAddressNotes = farmer?.addresses?.find((addr) => addr.isDefault)?.notes
    const locationNotes = [farmerAddressNotes, payload.notes?.trim()].filter(Boolean).join(' · ')
    const bankAccount = farmer?.bankAccount ?? {
      bankName: 'BRI',
      accountNumber: '123401002345501',
      accountHolderName: offer.farmerName,
    }
    const activeUser = activeSessionUserId ? usersCollection.get(activeSessionUserId) : undefined
    const defaultBuyerAddress =
      activeUser?.addresses?.find((addr) => addr.isDefault) ?? activeUser?.addresses?.[0]
    const resolvedBuyerAddress = payload.buyerAddress
      ? {
          label: payload.buyerAddress.label.trim(),
          fullAddress: payload.buyerAddress.fullAddress.trim(),
          areaName: payload.buyerAddress.areaName.trim(),
        }
      : defaultBuyerAddress
        ? {
            label: defaultBuyerAddress.label,
            fullAddress: defaultBuyerAddress.fullAddress,
            areaName: defaultBuyerAddress.areaName,
          }
        : undefined

    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      buyerId: activeUser?.id ?? 'usr-pb-01',
      farmerId: offer.farmerId,
      farmerName: offer.farmerName,
      offerId: offer.id,
      commodityName: offer.commodityName,
      commodityPhotoUrl: offer.photos[0],
      quantityKg: payload.quantityKg,
      pricePerKg: offer.pricePerKg,
      totalPrice: Math.round(payload.quantityKg * offer.pricePerKg),
      scheduleSlot: selectedSlot,
      paymentDeadline: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      status: 'pending_payment',
      pickupLocation: {
        address: offer.pickupAddressFull || offer.pickupAddressArea,
        latitude: offer.latitude || -6.8167,
        longitude: offer.longitude || 107.6167,
        notes: locationNotes || undefined,
      },
      buyerContactName: payload.contactName?.trim() || activeUser?.name,
      buyerContactPhone: payload.contactPhone?.trim() || activeUser?.phone || undefined,
      buyerOrganization: activeUser?.organization,
      buyerAddress: resolvedBuyerAddress,
      bankAccount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    ordersCollection.insert(newOrder)
    return { handled: true, data: newOrder }
  }

  if (endpoint.startsWith('/api/orders/') && endpoint.endsWith('/cancel') && method === 'POST') {
    const orderId = endpoint.split('/')[3]
    const order = ordersCollection.get(orderId)
    if (!order) {
      throw new ApiError(404, 'Pesanan tidak ditemukan', 'NOT_FOUND')
    }

    const offer = offersCollection.get(order.offerId)
    if (offer) {
      offersCollection.update(offer.id, (draft) => {
        draft.reservedStockKg = Math.max(0, draft.reservedStockKg - order.quantityKg)
        draft.availableStockKg += order.quantityKg
      })
    }

    ordersCollection.update(orderId, (draft) => {
      draft.status = 'cancelled'
      draft.updatedAt = new Date().toISOString()
    })

    return { handled: true, data: ordersCollection.get(orderId) }
  }

  if (endpoint.startsWith('/api/orders/') && endpoint.endsWith('/payments') && method === 'POST') {
    const orderId = endpoint.split('/')[3]
    const payload = parseJsonBody<{ proofUrl?: string; notes?: string }>(body)
    const order = ordersCollection.get(orderId)
    if (!order) {
      throw new ApiError(404, 'Pesanan tidak ditemukan', 'NOT_FOUND')
    }
    if (order.status === 'cancelled') {
      throw new ApiError(400, 'Pesanan ini telah dibatalkan', 'ORDER_CANCELLED')
    }
    if (Date.parse(order.paymentDeadline) <= Date.now()) {
      throw new ApiError(
        400,
        'Tenggat waktu pembayaran telah berakhir. Pesanan otomatis dibatalkan.',
        'PAYMENT_EXPIRED'
      )
    }

    const safeProofUrl = payload.proofUrl
      ? isSafeProofImageUrl(payload.proofUrl)
      : 'https://images.example.com/proof.jpg'
    if (!safeProofUrl) {
      throw new ApiError(400, 'URL bukti transfer tidak valid', 'INVALID_PROOF_URL')
    }

    const submittedAt = new Date().toISOString()
    ordersCollection.update(orderId, (draft) => {
      draft.status = 'payment_submitted'
      draft.paymentProofUrl = safeProofUrl
      draft.paymentNotes = payload.notes?.trim() || undefined
      draft.paymentSubmittedAt = submittedAt
      draft.rejectionReason = undefined
      draft.updatedAt = submittedAt
    })

    return { handled: true, data: ordersCollection.get(orderId) }
  }

  if (endpoint.startsWith('/api/orders/') && endpoint.endsWith('/ready-for-pickup')) {
    const orderId = endpoint.split('/')[3]
    const order = ordersCollection.get(orderId)
    if (!order) {
      throw new ApiError(404, 'Pesanan tidak ditemukan', 'NOT_FOUND')
    }

    ordersCollection.update(orderId, (draft) => {
      draft.status = 'ready_for_pickup'
      draft.updatedAt = new Date().toISOString()
    })

    return { handled: true, data: ordersCollection.get(orderId) }
  }

  if (
    endpoint.startsWith('/api/orders/') &&
    endpoint.endsWith('/confirm-receipt') &&
    method === 'POST'
  ) {
    const orderId = endpoint.split('/')[3]
    const payload = parseJsonBody<{ confirmedWeightKg?: number }>(body)
    const order = ordersCollection.get(orderId)
    if (!order) {
      throw new ApiError(404, 'Pesanan tidak ditemukan', 'NOT_FOUND')
    }

    const offer = offersCollection.get(order.offerId)
    if (offer) {
      offersCollection.update(offer.id, (draft) => {
        draft.reservedStockKg = Math.max(0, draft.reservedStockKg - order.quantityKg)
        draft.soldStockKg += payload.confirmedWeightKg || order.quantityKg
      })
    }

    ordersCollection.update(orderId, (draft) => {
      draft.status = 'completed'
      draft.confirmedWeightKg = payload.confirmedWeightKg || order.quantityKg
      draft.updatedAt = new Date().toISOString()
    })

    return { handled: true, data: ordersCollection.get(orderId) }
  }

  if (endpoint.startsWith('/api/orders/') && endpoint.endsWith('/payment') && method === 'GET') {
    const orderId = endpoint.split('/')[3]
    const order = ordersCollection.get(orderId)
    if (!order) {
      throw new ApiError(404, 'Pesanan tidak ditemukan', 'NOT_FOUND')
    }

    const farmer = usersCollection.get(order.farmerId)
    const bankAccount = order.bankAccount ??
      farmer?.bankAccount ?? {
        bankName: 'BRI',
        accountNumber: '123401002345501',
        accountHolderName: order.farmerName || 'Rekening Penampungan PanganTani',
      }

    const paymentStatus: PaymentDetail['status'] =
      order.status === 'pending_payment'
        ? order.rejectionReason
          ? 'rejected'
          : 'pending'
        : order.status === 'payment_submitted'
          ? 'under_review'
          : order.status === 'processing' ||
              order.status === 'ready_for_pickup' ||
              order.status === 'completed'
            ? 'approved'
            : 'pending'

    const paymentDetail: PaymentDetail = {
      orderId: order.id,
      amount: order.totalPrice,
      bankName: bankAccount.bankName,
      accountNumber: bankAccount.accountNumber,
      accountHolder: bankAccount.accountHolderName,
      paymentDeadline: order.paymentDeadline,
      status: paymentStatus,
      proofUrl: order.paymentProofUrl,
      submittedAt: order.paymentSubmittedAt,
      rejectionReason: order.rejectionReason,
    }

    return { handled: true, data: paymentDetail }
  }

  if (endpoint.startsWith('/api/orders/') && method === 'GET') {
    const id = endpoint.replace('/api/orders/', '')
    const order = ordersCollection.get(id)
    if (!order) {
      throw new ApiError(404, 'Pesanan tidak ditemukan', 'NOT_FOUND')
    }
    if (
      order.status === 'pending_payment' &&
      !order.paymentProofUrl &&
      Date.parse(order.paymentDeadline) <= Date.now()
    ) {
      const offer = offersCollection.get(order.offerId)
      if (offer) {
        offersCollection.update(offer.id, (draft) => {
          draft.reservedStockKg = Math.max(0, draft.reservedStockKg - order.quantityKg)
          draft.availableStockKg += order.quantityKg
        })
      }
      ordersCollection.update(order.id, (draft) => {
        draft.status = 'cancelled'
        draft.updatedAt = new Date().toISOString()
      })
      return { handled: true, data: ordersCollection.get(id) }
    }
    return { handled: true, data: order }
  }

  return { handled: false }
}
