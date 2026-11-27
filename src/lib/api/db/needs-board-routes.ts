import { ApiError } from '../errors'
import { createUniqueId } from '@/lib/utils'
import { needsBoardCollection } from './collections/needs-board'
import { notificationsCollection } from './collections/notifications'
import { offersCollection } from './collections/offers'
import { usersCollection } from './collections/users'
import { requireBuyer, requireFarmer, type RouteContext } from './route-context'
import { getCategoryMeta } from '@/lib/data/categories'
import { getJakartaDate, getNeedStatus, isActiveNeed } from '@/lib/data/needs-board-helpers'
import {
  CreateNeedRequestSchema,
  FarmerNeedResponseRequestSchema,
  UpdateNeedStatusSchema,
  type NeedRequest,
  type NeedResponse,
} from '@/types/api/needs-board'

export function handleNeedsBoardRoute({
  endpoint,
  method,
  body,
  activeSessionUserId,
  parseJsonBody,
}: RouteContext) {
  const match = /^\/api\/needs-board(?:\/([\w-]+)(?:\/(status|responses)(?:\/([\w-]+))?)?)?$/.exec(
    endpoint
  )
  if (!match) return { handled: false }
  const [, id, subPath, responseId] = match
  const today = getJakartaDate()
  const normalize = (need: NeedRequest) => ({ ...need, status: getNeedStatus(need, today) })

  if (!id && method === 'GET') {
    return {
      handled: true,
      data: Array.from(needsBoardCollection.values())
        .map(normalize)
        .filter((need) => isActiveNeed(need) || need.buyerId === activeSessionUserId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    }
  }

  if (id && !subPath && method === 'GET') {
    const entry = needsBoardCollection.get(id)
    if (!entry || (!isActiveNeed(normalize(entry)) && entry.buyerId !== activeSessionUserId)) {
      throw new ApiError(404, 'Permintaan tidak ditemukan', 'NOT_FOUND')
    }
    return { handled: true, data: normalize(entry) }
  }

  if (!id && method === 'POST') {
    const buyer = requireBuyer(activeSessionUserId)
    const result = CreateNeedRequestSchema.safeParse(parseJsonBody(body))
    if (!result.success || result.data.targetDate < today) {
      throw new ApiError(400, 'Periksa isian dan tanggal kebutuhan', 'INVALID_NEED')
    }
    const now = new Date().toISOString()
    const request: NeedRequest = {
      ...result.data,
      id: createUniqueId('need-'),
      buyerId: buyer.id,
      buyerName: buyer.name,
      organization: buyer.organization,
      category: getCategoryMeta(result.data.category).label,
      status: 'open',
      responses: [],
      createdAt: now,
      updatedAt: now,
    }
    needsBoardCollection.insert(request)
    return { handled: true, data: request }
  }

  if (id && subPath === 'status' && !responseId && method === 'PATCH') {
    const buyer = requireBuyer(activeSessionUserId)
    const request = needsBoardCollection.get(id)
    if (request?.buyerId !== buyer.id)
      throw new ApiError(404, 'Permintaan tidak ditemukan', 'NOT_FOUND')
    const result = UpdateNeedStatusSchema.safeParse(parseJsonBody(body))
    if (!result.success)
      throw new ApiError(400, 'Status permintaan tidak valid', 'INVALID_NEED_STATUS')
    if (request.status === result.data.status) return { handled: true, data: request }
    if (!isActiveNeed(normalize(request)))
      throw new ApiError(409, 'Permintaan sudah tidak aktif', 'NEED_INACTIVE')
    needsBoardCollection.update(id, (draft) => {
      draft.status = result.data.status
      if (draft.status === 'fulfilled') draft.fulfilledQuantityKg = draft.neededQuantityKg
      draft.updatedAt = new Date().toISOString()
    })
    return { handled: true, data: needsBoardCollection.get(id) }
  }

  if (id && subPath === 'responses') {
    const farmer = requireFarmer(activeSessionUserId)
    const request = needsBoardCollection.get(id)
    if (!request) {
      throw new ApiError(404, 'Permintaan tidak ditemukan', 'NOT_FOUND')
    }
    const normalizedNeed = normalize(request)
    if (!isActiveNeed(normalizedNeed)) {
      throw new ApiError(409, 'Permintaan ini sudah ditutup atau kedaluwarsa', 'NEED_INACTIVE')
    }

    if (!responseId && method === 'POST') {
      if (!farmer.isVerifiedFarmer) {
        throw new ApiError(
          403,
          'Akun petani harus terverifikasi sebelum menanggapi Papan Kebutuhan',
          'FARMER_UNVERIFIED'
        )
      }
      const parsed = FarmerNeedResponseRequestSchema.safeParse(parseJsonBody(body))
      if (!parsed.success || parsed.data.availableDate < today) {
        throw new ApiError(
          400,
          parsed.error?.issues[0]?.message ?? 'Periksa isian dan tanggal ketersediaan',
          'INVALID_NEED_RESPONSE'
        )
      }
      const offer = offersCollection.get(parsed.data.offerId)
      if (!offer || offer.farmerId !== farmer.id || offer.status !== 'active') {
        throw new ApiError(400, 'Pilih penawaran aktif milik Anda', 'INVALID_OFFER')
      }
      if (parsed.data.offeredQuantityKg > offer.availableStockKg) {
        throw new ApiError(
          400,
          'Jumlah yang ditawarkan melebihi stok tersedia pada penawaran',
          'INSUFFICIENT_STOCK'
        )
      }
      const now = new Date().toISOString()
      const newResponse: NeedResponse = {
        id: createUniqueId('resp-'),
        farmerId: farmer.id,
        farmerName: farmer.organization ? `${farmer.name} (${farmer.organization})` : farmer.name,
        offerId: offer.id,
        offeredQuantityKg: parsed.data.offeredQuantityKg,
        offeredPricePerKg: parsed.data.offeredPricePerKg,
        availableDate: parsed.data.availableDate,
        message: parsed.data.message || undefined,
        createdAt: now,
      }
      needsBoardCollection.update(id, (draft) => {
        draft.responses = [...(draft.responses ?? []), newResponse]
        draft.updatedAt = now
      })

      const buyer = usersCollection.get(request.buyerId)
      if (buyer && buyer.preferences?.orderStatusUpdates !== false) {
        notificationsCollection.insert({
          id: createUniqueId('notif-need-'),
          userId: buyer.id,
          type: 'order_update',
          title: 'Tanggapan baru di Papan Kebutuhan',
          message: `${newResponse.farmerName} menawarkan ${parsed.data.offeredQuantityKg} kg untuk ${request.commodityName}.`,
          link: '/papan-kebutuhan?request=' + request.id,
          isRead: false,
          createdAt: now,
        })
      }

      return { handled: true, data: needsBoardCollection.get(id) }
    }

    if (responseId && method === 'PATCH') {
      if (!farmer.isVerifiedFarmer) {
        throw new ApiError(403, 'Akun petani harus terverifikasi', 'FARMER_UNVERIFIED')
      }
      const existingResp = (request.responses ?? []).find((item) => item.id === responseId)
      if (!existingResp || existingResp.farmerId !== farmer.id) {
        throw new ApiError(404, 'Tanggapan tidak ditemukan', 'NOT_FOUND')
      }
      const parsed = FarmerNeedResponseRequestSchema.safeParse(parseJsonBody(body))
      if (!parsed.success || parsed.data.availableDate < today) {
        throw new ApiError(
          400,
          parsed.error?.issues[0]?.message ?? 'Periksa isian tanggapan',
          'INVALID_NEED_RESPONSE'
        )
      }
      const offer = offersCollection.get(parsed.data.offerId)
      if (!offer || offer.farmerId !== farmer.id || offer.status !== 'active') {
        throw new ApiError(400, 'Pilih penawaran aktif milik Anda', 'INVALID_OFFER')
      }
      if (parsed.data.offeredQuantityKg > offer.availableStockKg) {
        throw new ApiError(
          400,
          'Jumlah yang ditawarkan melebihi stok tersedia pada penawaran',
          'INSUFFICIENT_STOCK'
        )
      }
      const now = new Date().toISOString()
      needsBoardCollection.update(id, (draft) => {
        draft.responses = (draft.responses ?? []).map((item) =>
          item.id === responseId
            ? {
                ...item,
                offerId: offer.id,
                offeredQuantityKg: parsed.data.offeredQuantityKg,
                offeredPricePerKg: parsed.data.offeredPricePerKg,
                availableDate: parsed.data.availableDate,
                message: parsed.data.message || undefined,
              }
            : item
        )
        draft.updatedAt = now
      })
      return { handled: true, data: needsBoardCollection.get(id) }
    }

    if (responseId && method === 'DELETE') {
      const existingResp = (request.responses ?? []).find((item) => item.id === responseId)
      if (!existingResp || existingResp.farmerId !== farmer.id) {
        throw new ApiError(404, 'Tanggapan tidak ditemukan', 'NOT_FOUND')
      }
      needsBoardCollection.update(id, (draft) => {
        draft.responses = (draft.responses ?? []).filter((item) => item.id !== responseId)
        draft.updatedAt = new Date().toISOString()
      })
      return { handled: true, data: needsBoardCollection.get(id) }
    }
  }

  return { handled: false }
}
