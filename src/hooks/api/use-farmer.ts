'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { OrderSchema, type Order } from '@/types/api/orders'

export function useMarkOrderReady(orderId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      apiClient<Order>('/api/orders/' + orderId + '/ready-for-pickup', OrderSchema, {
        method: 'POST',
      }),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(queryKeys.orders.detail(orderId), updatedOrder)
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
    },
  })
}

export function useFarmerVerificationStatus() {
  return useQuery({
    queryKey: queryKeys.verifications.farmerStatus,
    queryFn: () => apiClient<{ isVerified: boolean }>('/api/auth/me'),
    select: (data) => Boolean(data?.isVerified),
  })
}
