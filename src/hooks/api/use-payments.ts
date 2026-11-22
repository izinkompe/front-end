'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { OrderSchema, type Order } from '@/types/api/orders'
import type { SubmitPaymentProof } from '@/types/api/payments'

export function useSubmitPaymentProof(orderId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: SubmitPaymentProof) =>
      apiClient<Order>('/api/orders/' + orderId + '/payments', OrderSchema, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(queryKeys.orders.detail(orderId), updatedOrder)
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
    },
  })
}
