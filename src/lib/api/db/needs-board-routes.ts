import { ApiError } from '../errors'
import { needsBoardCollection } from './collections/needs-board'
import { requireBuyer, type RouteContext } from './route-context'
import { getCategoryMeta } from '@/lib/data/categories'
import { getJakartaDate, getNeedStatus, isActiveNeed } from '@/lib/data/needs-board-helpers'
import {
  CreateNeedRequestSchema,
  UpdateNeedStatusSchema,
  type NeedRequest,
} from '@/types/api/needs-board'

export function handleNeedsBoardRoute({
  endpoint,
  method,
  body,
  activeSessionUserId,
  parseJsonBody,
}: RouteContext) {
  const match = /^\/api\/needs-board(?:\/([\w-]+)(\/status)?)?$/.exec(endpoint)
  if (!match) return { handled: false }
  const [, id, statusPath] = match
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

  if (id && !statusPath && method === 'GET') {
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
      id: 'need-' + crypto.randomUUID(),
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

  if (id && statusPath && method === 'PATCH') {
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

  return { handled: false }
}
