import { CreateBookmarkListRequestSchema, type BookmarkList } from '@/types/api/auth'
import { ApiError } from '../errors'
import { offersCollection } from './collections/offers'
import { usersCollection } from './collections/users'
import { getPublicFarmerStoreById } from './farmer-routes'
import { saveBuyerPreferences } from './buyer-preferences'
import { toPublicOffer } from './offer-routes'
import { requireBuyer, type RouteContext } from './route-context'

function hydrateBookmarkList(list: BookmarkList) {
  const offers = list.offerIds.flatMap((id) => {
    const offer = offersCollection.get(id)
    return offer && offer.status !== 'draft' ? [toPublicOffer(offer)] : []
  })
  return {
    ...list,
    offers,
  }
}

export function handleFavoriteRoute({
  endpoint,
  method,
  body,
  activeSessionUserId,
  parseJsonBody,
}: RouteContext) {
  if (endpoint === '/api/favorites' && method === 'GET') {
    const user = requireBuyer(activeSessionUserId)
    const offers = (user.favoriteOfferIds ?? []).flatMap((id) => {
      const offer = offersCollection.get(id)
      return offer && offer.status !== 'draft' ? [toPublicOffer(offer)] : []
    })
    const farmers = (user.followedFarmerIds ?? []).flatMap((id) => {
      const profile = getPublicFarmerStoreById(id, user.id)
      return profile ? [profile] : []
    })
    return { handled: true, data: { offers, farmers } }
  }

  if (endpoint === '/api/favorites/lists' && method === 'GET') {
    const user = requireBuyer(activeSessionUserId)
    const lists = (user.bookmarkLists ?? []).map(hydrateBookmarkList)
    return { handled: true, data: { lists } }
  }

  if (endpoint === '/api/favorites/lists' && method === 'POST') {
    const user = requireBuyer(activeSessionUserId)
    const parsed = CreateBookmarkListRequestSchema.safeParse(parseJsonBody(body))
    if (!parsed.success) {
      throw new ApiError(
        400,
        parsed.error.issues[0]?.message ?? 'Data daftar bookmark tidak valid',
        'VALIDATION_ERROR'
      )
    }
    const existingLists = user.bookmarkLists ?? []
    const duplicate = existingLists.some(
      (item) => item.name.toLowerCase() === parsed.data.name.toLowerCase()
    )
    if (duplicate) {
      throw new ApiError(409, 'Nama daftar bookmark sudah ada', 'DUPLICATE_BOOKMARK_LIST')
    }
    const created: BookmarkList = {
      id: 'bml-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      name: parsed.data.name,
      description: parsed.data.description || undefined,
      offerIds: [],
      createdAt: new Date().toISOString(),
    }
    usersCollection.update(user.id, (draft) => {
      draft.bookmarkLists = [created, ...(draft.bookmarkLists ?? [])]
    })
    const updated = usersCollection.get(user.id)!
    saveBuyerPreferences(updated)
    return { handled: true, data: hydrateBookmarkList(created) }
  }

  const deleteListMatch = /^\/api\/favorites\/lists\/([\w-]+)$/.exec(endpoint)
  if (deleteListMatch && method === 'DELETE') {
    const user = requireBuyer(activeSessionUserId)
    const listId = deleteListMatch[1]
    const existingLists = user.bookmarkLists ?? []
    if (!existingLists.some((item) => item.id === listId)) {
      throw new ApiError(404, 'Daftar bookmark tidak ditemukan', 'NOT_FOUND')
    }
    usersCollection.update(user.id, (draft) => {
      draft.bookmarkLists = (draft.bookmarkLists ?? []).filter((item) => item.id !== listId)
    })
    const updated = usersCollection.get(user.id)!
    saveBuyerPreferences(updated)
    return { handled: true, data: { deletedId: listId } }
  }

  const toggleListOfferMatch = /^\/api\/favorites\/lists\/([\w-]+)\/offers\/([\w-]+)\/toggle$/.exec(
    endpoint
  )
  if (toggleListOfferMatch && method === 'POST') {
    const user = requireBuyer(activeSessionUserId)
    const [, listId, offerId] = toggleListOfferMatch
    const offer = offersCollection.get(offerId)
    if (!offer || offer.status === 'draft') {
      throw new ApiError(404, 'Penawaran tidak ditemukan', 'NOT_FOUND')
    }
    const existingLists = user.bookmarkLists ?? []
    const targetList = existingLists.find((item) => item.id === listId)
    if (!targetList) {
      throw new ApiError(404, 'Daftar bookmark tidak ditemukan', 'NOT_FOUND')
    }
    const nextOfferIds = targetList.offerIds.includes(offer.id)
      ? targetList.offerIds.filter((id) => id !== offer.id)
      : [offer.id, ...targetList.offerIds]
    usersCollection.update(user.id, (draft) => {
      draft.bookmarkLists = (draft.bookmarkLists ?? []).map((item) =>
        item.id === listId ? { ...item, offerIds: nextOfferIds } : item
      )
    })
    const updated = usersCollection.get(user.id)!
    saveBuyerPreferences(updated)
    return { handled: true, data: { listId, offerIds: nextOfferIds } }
  }

  const match = /^\/api\/favorites\/offers\/([\w-]+)\/toggle$/.exec(endpoint)
  if (match && method === 'POST') {
    const user = requireBuyer(activeSessionUserId)
    const offer = offersCollection.get(match[1])
    if (!offer || offer.status === 'draft')
      throw new ApiError(404, 'Penawaran tidak ditemukan', 'NOT_FOUND')
    const ids = user.favoriteOfferIds ?? []
    usersCollection.update(user.id, (draft) => {
      draft.favoriteOfferIds = ids.includes(offer.id)
        ? ids.filter((id) => id !== offer.id)
        : [offer.id, ...ids]
    })
    const updated = usersCollection.get(user.id)!
    saveBuyerPreferences(updated)
    return { handled: true, data: { favoriteOfferIds: updated.favoriteOfferIds } }
  }
  return { handled: false }
}
