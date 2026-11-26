'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { apiClient } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { useCurrentUser } from './use-auth'
import {
  NeedRequestSchema,
  type NeedRequest,
  type CreateNeedRequest,
  type UpdateNeedStatus,
} from '@/types/api/needs-board'

const NeedRequestListSchema = z.array(NeedRequestSchema)

export function useNeedsBoard() {
  const { data: user } = useCurrentUser()
  return useQuery({
    queryKey: queryKeys.needsBoard.list({ userId: user?.id }),
    queryFn: () => apiClient<NeedRequest[]>('/api/needs-board', NeedRequestListSchema),
    staleTime: 30 * 1000,
  })
}

export function useCreateNeedRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (newNeed: CreateNeedRequest) =>
      apiClient<NeedRequest>('/api/needs-board', NeedRequestSchema, {
        method: 'POST',
        body: JSON.stringify(newNeed),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.needsBoard.all }),
  })
}

export function useUpdateNeedStatus() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: UpdateNeedStatus }) =>
      apiClient('/api/needs-board/' + encodeURIComponent(id) + '/status', NeedRequestSchema, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.needsBoard.all }),
  })
}
