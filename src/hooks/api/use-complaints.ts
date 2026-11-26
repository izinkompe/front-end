'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { apiClient } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import {
  ComplaintSchema,
  type CreateComplaintRequest,
  type ReplyComplaintRequest,
} from '@/types/api/complaints'
import { useCurrentUser } from './use-auth'

export function useComplaints(orderId?: string) {
  const { data: user } = useCurrentUser()
  return useQuery({
    queryKey: queryKeys.complaints.list(user?.id, orderId),
    queryFn: () => apiClient('/api/complaints', z.array(ComplaintSchema), { params: { orderId } }),
    enabled: user?.role === 'buyer',
  })
}

export function useCreateComplaint() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateComplaintRequest) =>
      apiClient('/api/complaints', ComplaintSchema, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: queryKeys.complaints.all }),
        client.invalidateQueries({ queryKey: queryKeys.orders.all }),
      ]),
  })
}

export function useReplyComplaint(id: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (payload: ReplyComplaintRequest) =>
      apiClient('/api/complaints/' + encodeURIComponent(id) + '/messages', ComplaintSchema, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.complaints.all }),
  })
}
