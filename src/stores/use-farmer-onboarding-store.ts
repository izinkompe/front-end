'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CommodityCategory, FarmerType } from '@/types/api/auth'

export interface FarmerOnboardingDraft {
  step: number
  highestCompletedStep: number
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
  bankName?: string
  accountHolderName?: string
}

interface FarmerOnboardingState {
  draft: FarmerOnboardingDraft
  setStep: (step: number) => void
  updateDraft: (partial: Partial<FarmerOnboardingDraft>) => void
  resetDraft: () => void
}

const initialDraft: FarmerOnboardingDraft = {
  step: 1,
  highestCompletedStep: 0,
}

export const useFarmerOnboardingStore = create<FarmerOnboardingState>()(
  persist(
    (set) => ({
      draft: initialDraft,
      setStep: (step) => set((state) => ({ draft: { ...state.draft, step } })),
      updateDraft: (partial) =>
        set((state) => ({
          draft: { ...state.draft, ...partial },
        })),
      resetDraft: () => set({ draft: initialDraft }),
    }),
    {
      name: 'pangantani:farmer-onboarding-draft',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
