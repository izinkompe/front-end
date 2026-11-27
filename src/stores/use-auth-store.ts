'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User } from '@/types/api/auth'

export type AuthPromptMode = 'login' | 'register' | 'reset'

export interface BuyerRegisterDraft {
  name: string
  email: string
}

interface AuthState {
  user: User | null
  isHydrated: boolean
  authPromptOpen: boolean
  authPromptMode: AuthPromptMode
  authRedirectPath: string | null
  registerDraft: BuyerRegisterDraft
  setUser: (user: User | null) => void
  setHydrated: (hydrated: boolean) => void
  clearAuth: () => void
  openAuthPrompt: (mode?: AuthPromptMode, redirectPath?: string | null) => void
  closeAuthPrompt: () => void
  setRegisterDraft: (partial: Partial<BuyerRegisterDraft>) => void
  clearRegisterDraft: () => void
}

const initialRegisterDraft: BuyerRegisterDraft = {
  name: '',
  email: '',
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isHydrated: false,
      authPromptOpen: false,
      authPromptMode: 'login',
      authRedirectPath: null,
      registerDraft: initialRegisterDraft,
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
      setRegisterDraft: (partial) =>
        set((state) => ({
          registerDraft: { ...state.registerDraft, ...partial },
        })),
      clearRegisterDraft: () => set({ registerDraft: initialRegisterDraft }),
    }),
    {
      name: 'pangantani:auth-draft',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ registerDraft: state.registerDraft }),
    }
  )
)
