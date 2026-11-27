'use client'

import { create } from 'zustand'
import type { User } from '@/types/api/auth'

export type AuthPromptMode = 'login' | 'register' | 'reset'

interface AuthState {
  user: User | null
  isHydrated: boolean
  authPromptOpen: boolean
  authPromptMode: AuthPromptMode
  authRedirectPath: string | null
  setUser: (user: User | null) => void
  setHydrated: (hydrated: boolean) => void
  clearAuth: () => void
  openAuthPrompt: (mode?: AuthPromptMode, redirectPath?: string | null) => void
  closeAuthPrompt: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isHydrated: false,
  authPromptOpen: false,
  authPromptMode: 'login',
  authRedirectPath: null,
  setUser: (user) => set({ user, isHydrated: true }),
  setHydrated: (isHydrated) => set({ isHydrated }),
  clearAuth: () => set({ user: null, authPromptOpen: false, authRedirectPath: null }),
  openAuthPrompt: (mode = 'login', redirectPath = null) =>
    set({
      authPromptOpen: true,
      authPromptMode: mode,
      authRedirectPath: redirectPath,
    }),
  closeAuthPrompt: () => set({ authPromptOpen: false, authRedirectPath: null }),
}))
