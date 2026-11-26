import { ApiError } from '../errors'
import { notificationsCollection } from './collections/notifications'
import { usersCollection } from './collections/users'
import type { RouteContext } from './route-context'

export function handleNotificationRoute({ endpoint, method, activeSessionUserId }: RouteContext) {
  if (endpoint !== '/api/notifications' && !endpoint.startsWith('/api/notifications/'))
    return { handled: false }
  if (!activeSessionUserId || !usersCollection.get(activeSessionUserId)) {
    throw new ApiError(401, 'Masuk untuk melihat notifikasi', 'UNAUTHORIZED')
  }

  if (endpoint === '/api/notifications' && method === 'GET') {
    return {
      handled: true,
      data: Array.from(notificationsCollection.values())
        .filter((notification) => notification.userId === activeSessionUserId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    }
  }

  if (endpoint === '/api/notifications/read-all' && method === 'PATCH') {
    for (const notification of notificationsCollection.values()) {
      if (notification.userId === activeSessionUserId && !notification.isRead) {
        notificationsCollection.update(notification.id, (draft) => {
          draft.isRead = true
        })
      }
    }
    return { handled: true, data: { success: true } }
  }

  const match = /^\/api\/notifications\/([\w:-]+)\/read$/.exec(endpoint)
  if (match && method === 'PATCH') {
    const [, id] = match
    if (notificationsCollection.get(id)?.userId !== activeSessionUserId) {
      throw new ApiError(404, 'Notifikasi tidak ditemukan', 'NOT_FOUND')
    }
    notificationsCollection.update(id, (draft) => {
      draft.isRead = true
    })
    return { handled: true, data: notificationsCollection.get(id) }
  }
  return { handled: false }
}
