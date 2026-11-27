import { ApiError } from '../errors'
import { createUniqueId } from '@/lib/utils'
import { complaintsCollection } from './collections/complaints'
import { notificationsCollection } from './collections/notifications'
import { offersCollection } from './collections/offers'
import { ordersCollection } from './collections/orders'
import { usersCollection } from './collections/users'
import type { RouteContext } from './route-context'
import { isComplaintPhoto } from '@/lib/data/complaint-helpers'
import type { User } from '@/types/api/auth'
import { ReplyComplaintRequestSchema } from '@/types/api/complaints'
import {
  FarmerProposeScheduleRequestSchema,
  FarmerRestockDecisionRequestSchema,
} from '@/types/api/orders'

export function handleFarmerOrderRoute(
  ctx: RouteContext,
  farmer: User
): { handled: boolean; data?: unknown } {
  const { endpoint, method, params, body, parseJsonBody } = ctx

  const scheduleMatch = /^\/api\/farmer\/orders\/([^/]+)\/schedule-proposal$/.exec(endpoint)
  if (scheduleMatch && method === 'POST') {
    const orderId = decodeURIComponent(scheduleMatch[1])
    const order = ordersCollection.get(orderId)
    if (!order || order.farmerId !== farmer.id) {
      throw new ApiError(404, 'Pesanan tidak ditemukan', 'NOT_FOUND')
    }
    if (!['processing', 'ready_for_pickup'].includes(order.status)) {
      throw new ApiError(
        409,
        'Usulan jadwal hanya tersedia untuk pesanan aktif sebelum serah terima',
        'INVALID_ORDER_STATUS'
      )
    }
    const parsed = FarmerProposeScheduleRequestSchema.safeParse(parseJsonBody(body))
    if (!parsed.success) {
      throw new ApiError(
        400,
        parsed.error.issues[0]?.message ?? 'Periksa jadwal dan alasan pengajuan',
        'INVALID_SCHEDULE_PROPOSAL'
      )
    }
    const payload = parsed.data
    if (payload.endTime <= payload.startTime) {
      throw new ApiError(400, 'Jam selesai harus lebih lambat dari jam mulai', 'INVALID_TIME_RANGE')
    }
    const now = new Date().toISOString()
    ordersCollection.update(order.id, (draft) => {
      draft.proposedScheduleSlot = {
        id: createUniqueId('slot-prop-').slice(0, 18),
        date: payload.date,
        startTime: payload.startTime,
        endTime: payload.endTime,
        isAvailable: true,
      }
      draft.scheduleProposalStatus = 'pending'
      draft.scheduleProposalNote = payload.reason
      draft.updatedAt = now
    })

    const buyer = usersCollection.get(order.buyerId)
    if (buyer && buyer.preferences?.orderStatusUpdates !== false) {
      notificationsCollection.insert({
        id: createUniqueId('notif-sched-'),
        userId: buyer.id,
        type: 'schedule_proposal',
        title: 'Usulan jadwal pengambilan baru',
        message: `${order.commodityName} diusulkan menjadi ${payload.date} (${payload.startTime}-${payload.endTime}).`,
        link: '/pesanan/' + order.id,
        isRead: false,
        createdAt: now,
      })
    }

    return { handled: true, data: ordersCollection.get(order.id) }
  }

  const restockMatch = /^\/api\/farmer\/orders\/([^/]+)\/restock-decision$/.exec(endpoint)
  if (restockMatch && method === 'POST') {
    const orderId = decodeURIComponent(restockMatch[1])
    const order = ordersCollection.get(orderId)
    if (!order || order.farmerId !== farmer.id) {
      throw new ApiError(404, 'Pesanan tidak ditemukan', 'NOT_FOUND')
    }
    if (order.status !== 'cancelled') {
      throw new ApiError(
        409,
        'Konfirmasi stok hanya berlaku untuk pesanan yang dibatalkan',
        'INVALID_ORDER_STATUS'
      )
    }
    if (order.restockDecision) {
      return { handled: true, data: order }
    }
    const parsed = FarmerRestockDecisionRequestSchema.safeParse(parseJsonBody(body))
    if (!parsed.success) {
      throw new ApiError(400, 'Pilihan kelayakan stok tidak valid', 'INVALID_RESTOCK_DECISION')
    }
    const offer = offersCollection.get(order.offerId)
    if (parsed.data.decision === 'restocked') {
      if (!offer || offer.status !== 'active') {
        throw new ApiError(
          409,
          'Penawaran sudah tidak aktif sehingga stok tidak dapat dikembalikan ke katalog',
          'OFFER_INACTIVE'
        )
      }
      offersCollection.update(offer.id, (draft) => {
        draft.reservedStockKg = Math.max(
          0,
          Math.round((draft.reservedStockKg - order.quantityKg) * 1000) / 1000
        )
        draft.availableStockKg =
          Math.round((draft.availableStockKg + order.quantityKg) * 1000) / 1000
      })
    } else if (offer) {
      offersCollection.update(offer.id, (draft) => {
        draft.reservedStockKg = Math.max(
          0,
          Math.round((draft.reservedStockKg - order.quantityKg) * 1000) / 1000
        )
      })
    }

    const now = new Date().toISOString()
    ordersCollection.update(order.id, (draft) => {
      draft.restockDecision = parsed.data.decision
      draft.restockDecidedAt = now
      draft.restockNote = parsed.data.note || undefined
      draft.updatedAt = now
    })
    return { handled: true, data: ordersCollection.get(order.id) }
  }

  if (endpoint === '/api/farmer/complaints' && method === 'GET') {
    const targetOrderId = params?.orderId ? String(params.orderId) : undefined
    const items = Array.from(complaintsCollection.values()).filter((report) => {
      const order = ordersCollection.get(report.orderId)
      if (!order || order.farmerId !== farmer.id) return false
      if (targetOrderId && report.orderId !== targetOrderId) return false
      return true
    })
    return {
      handled: true,
      data: items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    }
  }

  const complaintReplyMatch = /^\/api\/farmer\/complaints\/([^/]+)\/messages$/.exec(endpoint)
  if (complaintReplyMatch && method === 'POST') {
    const complaintId = decodeURIComponent(complaintReplyMatch[1])
    const report = complaintsCollection.get(complaintId)
    const order = report ? ordersCollection.get(report.orderId) : undefined
    if (!report || !order || order.farmerId !== farmer.id) {
      throw new ApiError(404, 'Laporan pengaduan tidak ditemukan', 'NOT_FOUND')
    }
    if (!['open', 'in_investigation'].includes(report.status)) {
      throw new ApiError(
        409,
        'Klarifikasi hanya tersedia untuk laporan yang masih ditinjau',
        'COMPLAINT_CLOSED'
      )
    }
    const parsed = ReplyComplaintRequestSchema.safeParse(parseJsonBody(body))
    if (!parsed.success || parsed.data.attachments?.some((photo) => !isComplaintPhoto(photo))) {
      throw new ApiError(400, 'Periksa isi klarifikasi dan foto bukti', 'INVALID_REPLY')
    }
    complaintsCollection.update(report.id, (draft) => {
      draft.clarificationMessages = [
        ...(draft.clarificationMessages ?? []),
        {
          ...parsed.data,
          id: createUniqueId(),
          senderRole: 'farmer',
          senderName: farmer.organization ? `${farmer.name} (${farmer.organization})` : farmer.name,
          createdAt: new Date().toISOString(),
        },
      ]
    })
    return { handled: true, data: complaintsCollection.get(report.id) }
  }

  return { handled: false }
}
