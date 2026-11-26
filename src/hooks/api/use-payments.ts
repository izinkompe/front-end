'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { OrderSchema, type Order } from '@/types/api/orders'
import {
  PaymentDetailSchema,
  type PaymentDetail,
  type SubmitPaymentProof,
} from '@/types/api/payments'

import { useCurrentUser } from './use-auth'

export function usePaymentDetail(orderId: string) {
  const { data: user } = useCurrentUser()
  return useQuery({
    queryKey: queryKeys.payments.detail(orderId, user?.id),
    queryFn: () =>
      apiClient<PaymentDetail>('/api/orders/' + orderId + '/payment', PaymentDetailSchema),
    enabled: Boolean(orderId) && user?.role === 'buyer',
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === 'pending' || status === 'under_review') {
        return 10 * 1000
      }
      return false
    },
  })
}

export function useSubmitPaymentProof(orderId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: SubmitPaymentProof) =>
      apiClient<Order>('/api/orders/' + orderId + '/payments', OrderSchema, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(queryKeys.orders.detail(orderId, updatedOrder.buyerId), updatedOrder)
      queryClient.invalidateQueries({
        queryKey: queryKeys.payments.detail(orderId, updatedOrder.buyerId),
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
    },
  })
}
