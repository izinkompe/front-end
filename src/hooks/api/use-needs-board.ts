'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { apiClient } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { NeedRequestSchema, type NeedRequest } from '@/types/api/needs-board'

const NeedRequestListSchema = z.array(NeedRequestSchema)

export function useNeedsBoard() {
  return useQuery({
    queryKey: queryKeys.needsBoard.all,
    queryFn: () => apiClient<NeedRequest[]>('/api/needs-board', NeedRequestListSchema),
    staleTime: 30 * 1000,
  })
}

export function useCreateNeedRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (newNeed: Partial<NeedRequest>) =>
      apiClient<NeedRequest>('/api/needs-board', NeedRequestSchema, {
        method: 'POST',
        body: JSON.stringify(newNeed),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.needsBoard.all })
    },
  })
}
