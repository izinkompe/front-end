'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CommodityCategory, FarmerType } from '@/types/api/auth'

interface FarmerOnboardingDraft {
  step: number
  farmerType?: FarmerType
  farmName?: string
  primaryCommodities?: CommodityCategory[]
  customCommodity?: string
  name?: string
  email?: string
  phone?: string
  provinceId?: string
  areaName?: string
  fullAddress?: string
  latitude?: number
  longitude?: number
  pickupNotes?: string
}

interface FarmerOnboardingState {
  draft: FarmerOnboardingDraft
  setStep: (step: number) => void
  updateDraft: (partial: Partial<FarmerOnboardingDraft>) => void
  resetDraft: () => void
}

export const useFarmerOnboardingStore = create<FarmerOnboardingState>()(
  persist(
    (set) => ({
      draft: { step: 1 },
      setStep: (step) => set((state) => ({ draft: { ...state.draft, step } })),
      updateDraft: (partial) =>
        set((state) => ({
          draft: { ...state.draft, ...partial },
        })),
      resetDraft: () => set({ draft: { step: 1 } }),
    }),
    {
      name: 'pangantani:farmer-onboarding-draft',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
