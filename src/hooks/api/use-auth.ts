'use client'

import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { useHydrated } from '@/hooks/use-hydrated'
import { apiClient } from '@/lib/api/client'
import { ApiError } from '@/lib/api/errors'
import { queryKeys } from '@/lib/api/query-keys'
import { isAuthRelaxed } from '@/lib/auth/rbac'
import {
  clearSessionRoleCookies,
  getCachedAuthUser,
  setCachedAuthUser,
  setPreviewRoleCookie,
  setSessionRoleCookies,
} from '@/lib/auth/session-cookies'
import {
  UserRoleSchema,
  UserSchema,
  type BuyerRegisterRequest,
  type FarmerRegisterRequest,
  type LoginRequest,
  type ForgotPasswordRequest,
  type ResetPasswordRequest,
  type SaveBuyerAddressRequest,
  type UpdateProfileRequest,
  type User,
  type UserRole,
  type VerifyPhoneRequest,
} from '@/types/api/auth'

function syncAuthUserCache(queryClient: QueryClient, user: User | null) {
  setCachedAuthUser(user)
  queryClient.setQueryData(queryKeys.auth.me, user)
  queryClient.invalidateQueries({ queryKey: queryKeys.auth.me })
}

export function useCurrentUser() {
  const hydrated = useHydrated()

  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      try {
        const user = await apiClient<User | null>('/api/auth/me', UserSchema.nullable(), {
          silentStatuses: [401, 404],
        })
        setCachedAuthUser(user)
        if (!user) {
          clearSessionRoleCookies()
        }
        return user
      } catch (error) {
        if (error instanceof ApiError && (error.status === 401 || error.status === 404)) {
          clearSessionRoleCookies()
          return null
        }
        throw error
      }
    },
    placeholderData: () => (hydrated ? (getCachedAuthUser() ?? undefined) : undefined),
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
      setSessionRoleCookies(data.user.role, data.token)
      syncAuthUserCache(queryClient, data.user)
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
      setSessionRoleCookies(data.user.role, data.token)
      syncAuthUserCache(queryClient, data.user)
      queryClient.invalidateQueries({ queryKey: queryKeys.verifications.farmerStatus })
    },
  })
}

export function useLoginAdmin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: LoginRequest) =>
      apiClient<{ token: string; user: User }>('/api/auth/login-admin', undefined, {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    onSuccess: (data) => {
      setSessionRoleCookies(data.user.role, data.token)
      syncAuthUserCache(queryClient, data.user)
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() })
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
      setSessionRoleCookies(data.user.role, data.token)
      syncAuthUserCache(queryClient, data.user)
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
      setSessionRoleCookies(data.user.role, data.token)
      syncAuthUserCache(queryClient, data.user)
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
      syncAuthUserCache(queryClient, updatedUser)
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
      syncAuthUserCache(queryClient, updatedUser)
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
      syncAuthUserCache(queryClient, updatedUser)
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
      syncAuthUserCache(queryClient, updatedUser)
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
      clearSessionRoleCookies()
      syncAuthUserCache(queryClient, null)
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
    },
  })
}

export function useSwitchPreviewRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (role: UserRole) => {
      if (!isAuthRelaxed()) {
        throw new ApiError(
          403,
          'Pengalih peran pratinjau tidak tersedia pada mode autentikasi ketat',
          'FORBIDDEN'
        )
      }
      const parsed = UserRoleSchema.parse(role)
      return apiClient<{ user: User }>('/api/auth/preview-role', z.object({ user: UserSchema }), {
        method: 'POST',
        body: JSON.stringify({ role: parsed }),
      })
    },
    onSuccess: (data) => {
      setPreviewRoleCookie(data.user.role)
      setSessionRoleCookies(data.user.role, 'preview-session')
      syncAuthUserCache(queryClient, data.user)
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() })
    },
  })
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordRequest) =>
      apiClient(
        '/api/auth/forgot-password',
        z.object({ success: z.literal(true), demoCode: z.string().optional() }),
        { method: 'POST', body: JSON.stringify(payload) }
      ),
  })
}

export function useConfirmPasswordReset() {
  return useMutation({
    mutationFn: (payload: ResetPasswordRequest) =>
      apiClient('/api/auth/reset-password', z.object({ success: z.literal(true) }), {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  })
}
