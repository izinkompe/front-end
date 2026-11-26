'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { ApiError } from '@/lib/api/errors'
import { queryKeys } from '@/lib/api/query-keys'
import {
  UserSchema,
  type BuyerRegisterRequest,
  type FarmerRegisterRequest,
  type LoginRequest,
  type SaveBuyerAddressRequest,
  type UpdateProfileRequest,
  type User,
  type VerifyPhoneRequest,
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

export function useLoginFarmer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: LoginRequest) =>
      apiClient<{ token: string; user: User }>('/api/auth/login-farmer', undefined, {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.auth.me, data.user)
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me })
      queryClient.invalidateQueries({ queryKey: queryKeys.verifications.farmerStatus })
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

export function useRegisterFarmer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: FarmerRegisterRequest) =>
      apiClient<{ token: string; user: User }>('/api/auth/register-farmer', undefined, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.auth.me, data.user)
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me })
      queryClient.invalidateQueries({ queryKey: queryKeys.verifications.farmerStatus })
    },
  })
}

export function useSaveBuyerAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: SaveBuyerAddressRequest) =>
      apiClient<User>('/api/auth/addresses', UserSchema, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(queryKeys.auth.me, updatedUser)
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me })
    },
  })
}

export function useDeleteBuyerAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (addressId: string) =>
      apiClient<User>(`/api/auth/addresses/${encodeURIComponent(addressId)}`, UserSchema, {
        method: 'DELETE',
      }),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(queryKeys.auth.me, updatedUser)
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me })
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateProfileRequest) =>
      apiClient<User>('/api/profile', UserSchema, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(queryKeys.auth.me, updatedUser)
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me })
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.detail })
    },
  })
}

export function useVerifyPhone() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: VerifyPhoneRequest) =>
      apiClient<User>('/api/profile/verify-phone', UserSchema, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(queryKeys.auth.me, updatedUser)
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      apiClient<{ success: boolean }>('/api/auth/logout', undefined, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.auth.me, null)
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me })
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
    },
  })
}
