'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { apiClient } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { NotificationSchema, type Notification } from '@/types/api/notifications'

const NotificationListSchema = z.array(NotificationSchema)

export function useNotifications(userId?: string) {
  return useQuery({
    queryKey: userId ? [...queryKeys.notifications.list(), userId] : queryKeys.notifications.list(),
    queryFn: async () => {
      const data = await apiClient<Notification[]>('/api/notifications', NotificationListSchema)
      return userId ? data.filter((notif) => notif.userId === userId) : data
    },
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  })
}

export function useUnreadNotificationsCount(userId?: string) {
  const { data: notifications = [] } = useNotifications(userId)
  return notifications.filter((notif) => !notif.isRead).length
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiClient<Notification>('/api/notifications/' + id + '/read', NotificationSchema, {
        method: 'PATCH',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
    },
  })
}

export function useMarkAllNotificationsRead(userId?: string) {
  const queryClient = useQueryClient()
  const { data: notifications = [] } = useNotifications(userId)

  return useMutation({
    mutationFn: async () => {
      const unreadList = notifications.filter((notif) => !notif.isRead)
      await Promise.all(
        unreadList.map((notif) =>
          apiClient<Notification>('/api/notifications/' + notif.id + '/read', NotificationSchema, {
            method: 'PATCH',
          })
        )
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
    },
  })
}
