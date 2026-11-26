'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { apiClient } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import {
  OrderSchema,
  type ConfirmReceiptRequest,
  type CreateOrderRequest,
  type Order,
  type RespondScheduleProposalRequest,
} from '@/types/api/orders'

import { useCurrentUser } from './use-auth'

const OrderListSchema = z.array(OrderSchema)

export function useOrders(status?: string) {
  const { data: user } = useCurrentUser()
  return useQuery({
    queryKey: queryKeys.orders.list({ status, userId: user?.id }),
    queryFn: () =>
      apiClient<Order[]>('/api/orders', OrderListSchema, {
        params: { status },
      }),
    enabled: user?.role === 'buyer',
    staleTime: 10 * 1000,
  })
}

export function useOrderDetail(id: string) {
  const { data: user } = useCurrentUser()
  return useQuery({
    queryKey: queryKeys.orders.detail(id, user?.id),
    queryFn: () => apiClient<Order>('/api/orders/' + id, OrderSchema),
    enabled: Boolean(id) && user?.role === 'buyer',
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === 'pending_payment' || status === 'payment_submitted') {
        return 10 * 1000
      }
      return false
    },
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateOrderRequest) =>
      apiClient<Order>('/api/orders', OrderSchema, {
        method: 'POST',
        body: JSON.stringify(request),
      }),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.offers.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
      queryClient.setQueryData(queryKeys.orders.detail(order.id, order.buyerId), order)
    },
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderId: string) =>
      apiClient<Order>('/api/orders/' + orderId + '/cancel', OrderSchema, {
        method: 'POST',
      }),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.offers.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
      queryClient.setQueryData(queryKeys.orders.detail(order.id, order.buyerId), order)
    },
  })
}

export function useRespondScheduleProposal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, ...payload }: RespondScheduleProposalRequest & { orderId: string }) =>
      apiClient<Order>('/api/orders/' + orderId + '/schedule-proposal', OrderSchema, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
      queryClient.setQueryData(queryKeys.orders.detail(order.id, order.buyerId), order)
    },
  })
}

export function useConfirmReceipt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, ...payload }: ConfirmReceiptRequest & { orderId: string }) =>
      apiClient<Order>('/api/orders/' + orderId + '/confirm-receipt', OrderSchema, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.offers.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
      queryClient.setQueryData(queryKeys.orders.detail(order.id, order.buyerId), order)
    },
  })
}
