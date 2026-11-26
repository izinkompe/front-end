'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { apiClient } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { NotificationSchema, type Notification } from '@/types/api/notifications'

import { useCurrentUser } from './use-auth'

const NotificationListSchema = z.array(NotificationSchema)

export function useNotifications() {
  const { data: user } = useCurrentUser()
  return useQuery({
    queryKey: queryKeys.notifications.list(user?.id),
    queryFn: () => apiClient<Notification[]>('/api/notifications', NotificationListSchema),
    enabled: Boolean(user),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  })
}

export function useUnreadNotificationsCount() {
  const { data: notifications = [] } = useNotifications()
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

export function useMarkAllNotificationsRead() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: () =>
      apiClient('/api/notifications/read-all', z.object({ success: z.boolean() }), {
        method: 'PATCH',
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  })
}
