'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { apiClient } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { ComplaintSchema, type Complaint, type ReplyComplaintRequest } from '@/types/api/complaints'
import {
  OrderSchema,
  type FarmerProposeScheduleRequest,
  type FarmerRestockDecisionRequest,
  type Order,
} from '@/types/api/orders'
import { useCurrentUser } from './use-auth'

export function useFarmerOrders(status?: string) {
  const { data: user } = useCurrentUser()
  return useQuery({
    queryKey: queryKeys.orders.list({ status, userId: user?.id, actor: 'farmer' }),
    queryFn: () =>
      apiClient<Order[]>('/api/orders', z.array(OrderSchema), {
        params: { status },
      }),
    enabled: user?.role === 'farmer',
    staleTime: 15 * 1000,
  })
}

export function useMarkOrderReady(orderId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      apiClient<Order>('/api/orders/' + orderId + '/ready-for-pickup', OrderSchema, {
        method: 'POST',
      }),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(queryKeys.orders.detail(orderId, updatedOrder.buyerId), updatedOrder)
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
    },
  })
}

export function useFarmerProposeOrderSchedule(orderId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: FarmerProposeScheduleRequest) =>
      apiClient<Order>(
        '/api/farmer/orders/' + encodeURIComponent(orderId) + '/schedule-proposal',
        OrderSchema,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
    },
  })
}

export function useFarmerRestockDecision(orderId: string) {
  const queryClient = useQueryClient()
  const { data: user } = useCurrentUser()

  return useMutation({
    mutationFn: (payload: FarmerRestockDecisionRequest) =>
      apiClient<Order>(
        '/api/farmer/orders/' + encodeURIComponent(orderId) + '/restock-decision',
        OrderSchema,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.farmerManagement.offers(user?.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.offers.all })
    },
  })
}

export function useFarmerOrderComplaints(orderId?: string) {
  const { data: user } = useCurrentUser()

  return useQuery({
    queryKey: queryKeys.farmerManagement.complaints(user?.id, orderId),
    queryFn: () =>
      apiClient<Complaint[]>('/api/farmer/complaints', z.array(ComplaintSchema), {
        params: orderId ? { orderId } : undefined,
      }),
    enabled: user?.role === 'farmer',
    staleTime: 15 * 1000,
  })
}

export function useReplyFarmerComplaint(complaintId: string) {
  const queryClient = useQueryClient()
  const { data: user } = useCurrentUser()

  return useMutation({
    mutationFn: (payload: ReplyComplaintRequest) =>
      apiClient<Complaint>(
        '/api/farmer/complaints/' + encodeURIComponent(complaintId) + '/messages',
        ComplaintSchema,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.farmerManagement.complaints(user?.id),
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.complaints.all })
    },
  })
}

export function useFarmerVerificationStatus() {
  return useQuery({
    queryKey: queryKeys.verifications.farmerStatus,
    queryFn: () => apiClient<{ isVerifiedFarmer?: boolean } | null>('/api/auth/me'),
    select: (data) => Boolean(data?.isVerifiedFarmer),
  })
}
