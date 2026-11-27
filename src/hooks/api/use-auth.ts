'use client'

import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { useHydrated } from '@/hooks/use-hydrated'
import { apiClient } from '@/lib/api/client'
import { ApiError } from '@/lib/api/errors'
import { queryKeys } from '@/lib/api/query-keys'
import { isAuthRelaxed } from '@/lib/auth/rbac'
import { AuthMeResponseSchema, AuthSessionResponseSchema } from '@/lib/auth/auth-response'
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
  type VerifyEmailOtpRequest,
  type VerifyPhoneRequest,
} from '@/types/api/auth'
import { useAuthStore } from '@/stores/use-auth-store'
import { useCheckoutStore } from '@/stores/use-checkout-store'
import { useFarmerOnboardingStore } from '@/stores/use-farmer-onboarding-store'

function syncAuthUserCache(queryClient: QueryClient, user: User | null) {
  setCachedAuthUser(user)
  useAuthStore.getState().setUser(user)
  queryClient.setQueryData(queryKeys.auth.me, user)
  queryClient.invalidateQueries({ queryKey: queryKeys.auth.me })
}

function clearSensitiveClientState(queryClient: QueryClient) {
  const authStore = useAuthStore.getState()
  authStore.clearAuth()
  authStore.clearRegisterDraft()
  useCheckoutStore.getState().resetCheckoutAttempt()
  useFarmerOnboardingStore.getState().resetDraft()
  syncAuthUserCache(queryClient, null)
  queryClient.removeQueries({ queryKey: queryKeys.profile.detail })
  queryClient.removeQueries({ queryKey: queryKeys.orders.all })
  queryClient.removeQueries({ queryKey: queryKeys.notifications.all })
  queryClient.removeQueries({ queryKey: queryKeys.favorites })
  queryClient.removeQueries({ queryKey: queryKeys.complaints.all })
  queryClient.removeQueries({ queryKey: ['farmer-management'] })
  queryClient.removeQueries({ queryKey: ['verifications'] })
  queryClient.removeQueries({ queryKey: ['admin'] })
  queryClient.removeQueries({ queryKey: ['payments'] })
}

export function useCurrentUser() {
  const hydrated = useHydrated()

  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      try {
        const user = await apiClient<User | null>('/api/auth/me', AuthMeResponseSchema, {
          silentStatuses: [401, 404],
        })
        setCachedAuthUser(user)
        useAuthStore.getState().setUser(user)
        if (!user) {
          void clearSessionRoleCookies()
        }
        return user
      } catch (error) {
        void clearSessionRoleCookies()
        useAuthStore.getState().setUser(null)
        if (error instanceof ApiError && (error.status === 401 || error.status === 404)) {
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
    mutationFn: async (credentials: LoginRequest) => {
      const data = await apiClient<{ token?: string; user: User }>(
        '/api/auth/login',
        AuthSessionResponseSchema,
        {
          method: 'POST',
          body: JSON.stringify(credentials),
        }
      )
      await setSessionRoleCookies(data.user.role, data.token)
      return data
    },
    onSuccess: (data) => {
      useAuthStore.getState().clearRegisterDraft()
      syncAuthUserCache(queryClient, data.user)
    },
  })
}

export function useLoginFarmer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const data = await apiClient<{ token?: string; user: User }>(
        '/api/auth/login-farmer',
        AuthSessionResponseSchema,
        {
          method: 'POST',
          body: JSON.stringify(credentials),
        }
      )
      await setSessionRoleCookies(data.user.role, data.token)
      return data
    },
    onSuccess: (data) => {
      useFarmerOnboardingStore.getState().resetDraft()
      syncAuthUserCache(queryClient, data.user)
      queryClient.invalidateQueries({ queryKey: queryKeys.verifications.farmerStatus })
    },
  })
}

export function useLoginAdmin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const data = await apiClient<{ token?: string; user: User }>(
        '/api/auth/login-admin',
        AuthSessionResponseSchema,
        {
          method: 'POST',
          body: JSON.stringify(credentials),
        }
      )
      await setSessionRoleCookies(data.user.role, data.token)
      return data
    },
    onSuccess: (data) => {
      syncAuthUserCache(queryClient, data.user)
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() })
    },
  })
}

export function useRegisterBuyer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: BuyerRegisterRequest) => {
      const data = await apiClient<{ token?: string; user: User }>(
        '/api/auth/register',
        AuthSessionResponseSchema,
        {
          method: 'POST',
          body: JSON.stringify({
            ...payload,
            password_confirmation: payload.password_confirmation ?? payload.password,
          }),
        }
      )
      await setSessionRoleCookies(data.user.role, data.token)
      return data
    },
    onSuccess: (data) => {
      syncAuthUserCache(queryClient, data.user)
    },
  })
}

export function useRegisterFarmer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: FarmerRegisterRequest) => {
      const data = await apiClient<{ token?: string; user: User }>(
        '/api/auth/register-farmer',
        AuthSessionResponseSchema,
        {
          method: 'POST',
          body: JSON.stringify({
            ...payload,
            role: 'farmer',
            organization: payload.farmName,
            password_confirmation: payload.password,
          }),
        }
      )
      await setSessionRoleCookies(data.user.role, data.token)
      return data
    },
    onSuccess: (data) => {
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
        silentStatuses: [401],
      }),
    onSettled: () => {
      void clearSessionRoleCookies()
      clearSensitiveClientState(queryClient)
    },
  })
}

export function useSwitchPreviewRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (role: UserRole) => {
      if (!isAuthRelaxed()) {
        throw new ApiError(
          403,
          'Pengalih peran pratinjau tidak tersedia pada mode autentikasi ketat',
          'FORBIDDEN'
        )
      }
      const parsed = UserRoleSchema.parse(role)
      const data = await apiClient<{ user: User }>(
        '/api/auth/preview-role',
        z.object({ user: UserSchema }),
        {
          method: 'POST',
          body: JSON.stringify({ role: parsed }),
        }
      )
      await setPreviewRoleCookie(data.user.role)
      await setSessionRoleCookies(data.user.role, 'preview-session')
      return data
    },
    onSuccess: (data) => {
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
        body: JSON.stringify({
          ...payload,
          password_confirmation: payload.password_confirmation ?? payload.password,
        }),
      }),
  })
}

export function useVerifyEmailUrl() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (verificationUrl: string) => {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ verificationUrl }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new ApiError(
          response.status,
          data.message || 'Gagal memverifikasi email',
          'VERIFY_EMAIL_FAILED',
          data.details
        )
      }
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me })
    },
  })
}

export function useResendVerificationEmail() {
  return useMutation({
    mutationFn: () =>
      apiClient<{ message?: string }>('/auth/email/verification-notification', undefined, {
        method: 'POST',
      }),
  })
}

export function useSendEmailOtp() {
  return useMutation({
    mutationFn: () =>
      apiClient<{ message?: string }>('/auth/email/otp', undefined, {
        method: 'POST',
      }),
  })
}

export function useVerifyEmailOtp() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: VerifyEmailOtpRequest) =>
      apiClient<{ message?: string }>('/auth/email/verify-otp', undefined, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me })
    },
  })
}
