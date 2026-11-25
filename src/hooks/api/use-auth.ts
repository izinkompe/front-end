'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { ApiError } from '@/lib/api/errors'
import { queryKeys } from '@/lib/api/query-keys'
import {
  UserSchema,
  type BuyerRegisterRequest,
  type LoginRequest,
  type User,
} from '@/types/api/auth'

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      try {
        return await apiClient<User | null>('/api/auth/me', UserSchema.nullable(), {
          silentStatuses: [401, 404],
        })
      } catch (error) {
        if (error instanceof ApiError && (error.status === 401 || error.status === 404)) {
          return null
        }
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: LoginRequest) =>
      apiClient<{ token: string; user: User }>('/api/auth/login', undefined, {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.auth.me, data.user)
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me })
    },
  })
}

export function useRegisterBuyer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BuyerRegisterRequest) =>
      apiClient<{ token: string; user: User }>('/api/auth/register', undefined, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.auth.me, data.user)
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me })
    },
  })
}
