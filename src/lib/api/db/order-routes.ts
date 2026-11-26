import { ApiError } from '../errors'
import { getOfferPriceSchedule } from '@/lib/data/offer-price-schedule'
import { analyzeWeightDiscrepancy } from '@/lib/data/order-pickup-helpers'
import { isSafeProofImageUrl } from '@/lib/data/checkout-helpers'
import { offersCollection } from './collections/offers'
import { notificationsCollection } from './collections/notifications'
import { ordersCollection } from './collections/orders'
import { usersCollection } from './collections/users'
import {
  ConfirmReceiptRequestSchema,
  CreateOrderRequestSchema,
  RespondScheduleProposalRequestSchema,
  type Order,
} from '@/types/api/orders'
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

  const route =
    /^\/api\/orders(?:\/([\w-]+)(?:\/(?:cancel|payment|payments|schedule-proposal|confirm-receipt|ready-for-pickup))?)?$/.exec(
      endpoint
    )
  if (!route) {
    return { handled: false }
  }
  const activeUser = activeSessionUserId ? usersCollection.get(activeSessionUserId) : undefined
  if (!activeUser) {
    throw new ApiError(401, 'Masuk untuk mengakses pesanan', 'UNAUTHORIZED')
  }
  const isFarmerPickup =
    activeUser.role === 'farmer' && method === 'POST' && endpoint.endsWith('/ready-for-pickup')
  if (activeUser.role !== 'buyer' && !isFarmerPickup) {
    throw new ApiError(403, 'Gunakan akun pembeli untuk mengakses pesanan ini', 'FORBIDDEN')
  }
  const requestedOrderId = route[1]
  const ownerField = isFarmerPickup ? 'farmerId' : 'buyerId'
  if (requestedOrderId && ordersCollection.get(requestedOrderId)?.[ownerField] !== activeUser.id) {
    throw new ApiError(404, 'Pesanan tidak ditemukan', 'NOT_FOUND')
  }

  if (endpoint === '/api/orders' && method === 'GET') {
    let items = Array.from(ordersCollection.values()).filter(
      (item) => item.buyerId === activeUser.id
    )
    if (params?.status) {
      items = items.filter((item) => item.status === params?.status)
    }
    return { handled: true, data: items }
  }

  if (endpoint === '/api/orders' && method === 'POST') {
    const result = CreateOrderRequestSchema.safeParse(parseJsonBody(body))
    if (!result.success) {
      throw new ApiError(400, 'Periksa berat, kontak, dan jadwal pesanan', 'INVALID_ORDER')
    }
    const payload = result.data

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
    const { currentPricePerKg } = getOfferPriceSchedule(offer, Date.now())
    if (
      typeof payload.acceptedPricePerKg === 'number' &&
      Math.round(payload.acceptedPricePerKg) !== Math.round(currentPricePerKg)
    ) {
      throw new ApiError(
        409,
        'Harga per kilogram telah diperbarui. Tinjau total terbaru sebelum melanjutkan.',
        'PRICE_CHANGED'
      )
    }
    if (offer.availableStockKg < payload.quantityKg) {
      throw new ApiError(400, 'Stok tidak mencukupi untuk pemesanan ini', 'INSUFFICIENT_STOCK')
    }

    const selectedSlot = offer.pickupScheduleSlots.find(
      (slot) => slot.id === payload.scheduleSlotId && slot.isAvailable !== false
    )
    if (!selectedSlot)
      throw new ApiError(400, 'Pilih jadwal pengambilan yang masih tersedia', 'INVALID_PICKUP_SLOT')

    const farmer = usersCollection.get(offer.farmerId)
    const farmerAddressNotes = farmer?.addresses?.find((addr) => addr.isDefault)?.notes
    const locationNotes = [farmerAddressNotes, payload.notes?.trim()].filter(Boolean).join(' · ')
    const bankAccount = farmer?.bankAccount ?? {
      bankName: 'BRI',
      accountNumber: '123401002345501',
      accountHolderName: offer.farmerName,
    }
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
      id: 'ord-' + crypto.randomUUID(),
      buyerId: activeUser.id,
      farmerId: offer.farmerId,
      farmerName: offer.farmerName,
      offerId: offer.id,
      commodityName: offer.commodityName,
      commodityPhotoUrl: offer.photos[0],
      quantityKg: payload.quantityKg,
      pricePerKg: currentPricePerKg,
      totalPrice: Math.round(payload.quantityKg * currentPricePerKg),
      scheduleSlot: selectedSlot,
      paymentDeadline: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      status: 'pending_payment',
      pickupLocation: {
        address: offer.pickupAddressFull || offer.pickupAddressArea,
        latitude: offer.latitude ?? -6.8167,
        longitude: offer.longitude ?? 107.6167,
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
    offersCollection.update(offer.id, (draft) => {
      draft.availableStockKg =
        Math.round((draft.availableStockKg - payload.quantityKg) * 1000) / 1000
      draft.reservedStockKg = Math.round((draft.reservedStockKg + payload.quantityKg) * 1000) / 1000
    })
    return { handled: true, data: newOrder }
  }

  if (endpoint.startsWith('/api/orders/') && endpoint.endsWith('/cancel') && method === 'POST') {
    const orderId = endpoint.split('/')[3]
    const order = ordersCollection.get(orderId)
    if (!order) {
      throw new ApiError(404, 'Pesanan tidak ditemukan', 'NOT_FOUND')
    }

    if (order.status === 'cancelled') return { handled: true, data: order }
    if (order.status !== 'pending_payment' || order.paymentProofUrl) {
      throw new ApiError(
        409,
        'Ajukan peninjauan untuk pembatalan setelah pembayaran',
        'INVALID_ORDER_STATUS'
      )
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
    if (!['pending_payment', 'payment_submitted'].includes(order.status)) {
      throw new ApiError(
        409,
        'Bukti pembayaran tidak dapat diubah pada status ini',
        'INVALID_ORDER_STATUS'
      )
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

  if (isFarmerPickup) {
    const orderId = endpoint.split('/')[3]
    const order = ordersCollection.get(orderId)
    if (!order) {
      throw new ApiError(404, 'Pesanan tidak ditemukan', 'NOT_FOUND')
    }

    if (order.status !== 'processing') {
      throw new ApiError(409, 'Pesanan belum dapat ditandai siap diambil', 'INVALID_ORDER_STATUS')
    }
    ordersCollection.update(orderId, (draft) => {
      draft.status = 'ready_for_pickup'
      draft.updatedAt = new Date().toISOString()
    })

    const buyer = usersCollection.get(order.buyerId)
    if (buyer && buyer.preferences?.orderStatusUpdates !== false) {
      const id = 'order-ready-' + order.id
      if (!notificationsCollection.get(id))
        notificationsCollection.insert({
          id,
          userId: buyer.id,
          type: 'order_update',
          title: 'Pesanan siap diambil',
          message: 'Lihat jadwal dan lokasi pengambilan ' + order.commodityName + '.',
          link: '/pesanan/' + order.id,
          isRead: false,
          createdAt: new Date().toISOString(),
        })
    }
    return { handled: true, data: ordersCollection.get(orderId) }
  }

  if (
    endpoint.startsWith('/api/orders/') &&
    endpoint.endsWith('/schedule-proposal') &&
    method === 'POST'
  ) {
    const orderId = endpoint.split('/')[3]
    const rawPayload = parseJsonBody<Record<string, unknown>>(body)
    const parsed = RespondScheduleProposalRequestSchema.safeParse(rawPayload)
    if (!parsed.success) {
      throw new ApiError(400, 'Tindakan peninjauan jadwal tidak valid', 'INVALID_PROPOSAL_ACTION')
    }

    const order = ordersCollection.get(orderId)
    if (!order) {
      throw new ApiError(404, 'Pesanan tidak ditemukan', 'NOT_FOUND')
    }
    if (!order.proposedScheduleSlot) {
      throw new ApiError(400, 'Tidak ada usulan jadwal baru untuk pesanan ini', 'NO_PROPOSAL')
    }
    if (!['processing', 'ready_for_pickup'].includes(order.status)) {
      throw new ApiError(400, 'Jadwal pesanan ini tidak lagi dapat diubah', 'ORDER_FINALIZED')
    }

    const now = new Date().toISOString()
    ordersCollection.update(orderId, (draft) => {
      if (parsed.data.action === 'accept' && order.proposedScheduleSlot) {
        draft.scheduleSlot = order.proposedScheduleSlot
        draft.proposedScheduleSlot = undefined
        draft.scheduleProposalStatus = 'accepted'
        draft.scheduleProposalNote = undefined
      } else {
        draft.proposedScheduleSlot = undefined
        draft.scheduleProposalStatus = 'rejected'
        draft.scheduleProposalNote =
          parsed.data.reason?.trim() ||
          'Pembeli menolak usulan jadwal baru; jadwal awal tetap digunakan.'
      }
      draft.updatedAt = now
    })

    return { handled: true, data: ordersCollection.get(orderId) }
  }

  if (
    endpoint.startsWith('/api/orders/') &&
    endpoint.endsWith('/confirm-receipt') &&
    method === 'POST'
  ) {
    const orderId = endpoint.split('/')[3]
    const rawPayload = parseJsonBody<Record<string, unknown>>(body)
    const parsed = ConfirmReceiptRequestSchema.safeParse(rawPayload)
    if (!parsed.success) {
      throw new ApiError(400, 'Berat aktual yang diterima tidak valid', 'INVALID_ACTUAL_WEIGHT')
    }

    const order = ordersCollection.get(orderId)
    if (!order) {
      throw new ApiError(404, 'Pesanan tidak ditemukan', 'NOT_FOUND')
    }
    const actualWeightKg = parsed.data.confirmedWeightKg
    if (order.receiptConfirmedAt && order.confirmedWeightKg === actualWeightKg) {
      return { handled: true, data: order }
    }
    if (order.status !== 'ready_for_pickup') {
      throw new ApiError(
        409,
        'Konfirmasi hanya tersedia untuk pesanan siap diambil',
        'INVALID_ORDER_STATUS'
      )
    }

    const { isShortage, isSurplus } = analyzeWeightDiscrepancy(
      order.quantityKg,
      actualWeightKg,
      order.pricePerKg
    )
    const now = new Date().toISOString()

    const offer = offersCollection.get(order.offerId)
    if (offer) {
      offersCollection.update(offer.id, (draft) => {
        draft.reservedStockKg = Math.max(0, draft.reservedStockKg - order.quantityKg)
        draft.soldStockKg += actualWeightKg
      })
    }

    ordersCollection.update(orderId, (draft) => {
      draft.confirmedWeightKg = actualWeightKg
      draft.receiptConfirmedAt = now
      draft.status = isShortage ? 'disputed' : 'completed'
      draft.weightDiscrepancyNote =
        parsed.data.note?.trim() ||
        (isShortage
          ? 'Selisih berat kurang tercatat saat serah terima dan menunggu peninjauan.'
          : isSurplus
            ? 'Berat diterima melebihi pesanan tanpa biaya tambahan.'
            : undefined)
      draft.updatedAt = now
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
