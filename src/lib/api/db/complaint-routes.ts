import { ApiError } from '../errors'
import { createUniqueId } from '@/lib/utils'
import { complaintsCollection } from './collections/complaints'
import { ordersCollection } from './collections/orders'
import { requireBuyer, type RouteContext } from './route-context'
import {
  canReportOrder,
  isComplaintPhoto,
  isPostPaymentCancelable,
} from '@/lib/data/complaint-helpers'
import {
  CreateComplaintRequestSchema,
  ReplyComplaintRequestSchema,
  type Complaint,
} from '@/types/api/complaints'

export function handleComplaintRoute({
  endpoint,
  method,
  params,
  body,
  activeSessionUserId,
  parseJsonBody,
}: RouteContext) {
  const match = /^\/api\/complaints(?:\/([\w-]+)(\/messages)?)?$/.exec(endpoint)
  if (!match) return { handled: false }

  const buyer = requireBuyer(activeSessionUserId)
  const [, id, messagesPath] = match
  const ownComplaints = () =>
    Array.from(complaintsCollection.values()).filter((report) => report.reporterId === buyer.id)

  if (!id && method === 'GET') {
    return {
      handled: true,
      data: ownComplaints()
        .filter((report) => !params?.orderId || report.orderId === params.orderId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    }
  }

  if (!id && method === 'POST') {
    const result = CreateComplaintRequestSchema.safeParse(parseJsonBody(body))
    if (!result.success) throw new ApiError(400, 'Periksa isian pengaduan', 'INVALID_COMPLAINT')
    const payload = result.data
    const order = ordersCollection.get(payload.orderId)
    if (order?.buyerId !== buyer.id) throw new ApiError(404, 'Pesanan tidak ditemukan', 'NOT_FOUND')
    const isCancellation = payload.type === 'cancellation_request'
    const needsAccount =
      isCancellation ||
      payload.type === 'pickup_failure' ||
      (payload.type === 'weight_discrepancy' && (order.confirmedWeightKg ?? 0) < order.quantityKg)
    if (
      (needsAccount && !payload.refundBankAccount) ||
      payload.evidencePhotos?.some((photo) => !isComplaintPhoto(photo))
    ) {
      throw new ApiError(
        400,
        'Periksa rekening pengembalian dana dan foto bukti',
        'INVALID_COMPLAINT'
      )
    }
    if (
      ownComplaints().some(
        (report) =>
          report.orderId === order.id && ['open', 'in_investigation'].includes(report.status)
      )
    ) {
      throw new ApiError(409, 'Pesanan ini sudah memiliki laporan aktif', 'COMPLAINT_EXISTS')
    }
    if (!(isCancellation ? isPostPaymentCancelable(order.status) : canReportOrder(order.status))) {
      throw new ApiError(
        409,
        'Laporan ini tidak tersedia untuk status pesanan tersebut',
        'INVALID_ORDER_STATUS'
      )
    }

    const now = new Date().toISOString()
    const complaint: Complaint = {
      ...payload,
      id: createUniqueId('complaint-'),
      reporterId: buyer.id,
      reporterName: buyer.name,
      status: 'open',
      createdAt: now,
    }
    complaintsCollection.insert(complaint)
    if (order.status !== 'completed') {
      ordersCollection.update(order.id, (draft) => {
        draft.status = 'disputed'
        draft.updatedAt = now
      })
    }
    return { handled: true, data: complaint }
  }

  if (id) {
    const report = complaintsCollection.get(id)
    if (report?.reporterId !== buyer.id)
      throw new ApiError(404, 'Pengaduan tidak ditemukan', 'NOT_FOUND')
    if (!messagesPath && method === 'GET') return { handled: true, data: report }
    if (messagesPath && method === 'POST') {
      if (report.status !== 'in_investigation') {
        throw new ApiError(
          409,
          'Balasan tersedia selama peninjauan pengaduan',
          'COMPLAINT_NOT_IN_REVIEW'
        )
      }
      const result = ReplyComplaintRequestSchema.safeParse(parseJsonBody(body))
      if (!result.success || result.data.attachments?.some((photo) => !isComplaintPhoto(photo))) {
        throw new ApiError(400, 'Periksa isi balasan dan foto lampiran', 'INVALID_REPLY')
      }
      complaintsCollection.update(id, (draft) => {
        draft.clarificationMessages = [
          ...(draft.clarificationMessages ?? []),
          {
            ...result.data,
            id: createUniqueId(),
            senderRole: 'buyer',
            senderName: buyer.name,
            createdAt: new Date().toISOString(),
          },
        ]
      })
      return { handled: true, data: complaintsCollection.get(id) }
    }
  }

  return { handled: false }
}
