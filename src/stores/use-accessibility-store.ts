'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AccessibilityState {
  highContrast: boolean
  textScale: number
  setHighContrast: (enabled: boolean) => void
  setTextScale: (scale: number) => void
  hydrateFromUserPreferences: (prefs?: { highContrast?: boolean; textScale?: number }) => void
}

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set) => ({
      highContrast: false,
      textScale: 1,
      setHighContrast: (highContrast) => set({ highContrast }),
      setTextScale: (textScale) => set({ textScale: Math.min(1.5, Math.max(0.85, textScale)) }),
      hydrateFromUserPreferences: (prefs) => {
        if (!prefs) return
        set((state) => ({
          highContrast: prefs.highContrast ?? state.highContrast,
          textScale: prefs.textScale ?? state.textScale,
        }))
      },
    }),
    {
      name: 'pangantani:accessibility',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
