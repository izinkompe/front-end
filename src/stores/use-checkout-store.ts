'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface CheckoutState {
  idempotencyKey: string | null
  offerId: string | null
  expectedPricePerKg: number | null
  pendingOrderId: string | null
  startCheckoutAttempt: (offerId: string, expectedPricePerKg: number) => string
  setPendingOrderId: (orderId: string | null) => void
  resetCheckoutAttempt: () => void
}

function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set, get) => ({
      idempotencyKey: null,
      offerId: null,
      expectedPricePerKg: null,
      pendingOrderId: null,
      startCheckoutAttempt: (offerId, expectedPricePerKg) => {
        const current = get()
        if (
          current.idempotencyKey &&
          current.offerId === offerId &&
          current.expectedPricePerKg === expectedPricePerKg
        ) {
          return current.idempotencyKey
        }
        const key = generateIdempotencyKey()
        set({
          idempotencyKey: key,
          offerId,
          expectedPricePerKg,
          pendingOrderId: null,
        })
        return key
      },
      setPendingOrderId: (pendingOrderId) => set({ pendingOrderId }),
      resetCheckoutAttempt: () =>
        set({
          idempotencyKey: null,
          offerId: null,
          expectedPricePerKg: null,
          pendingOrderId: null,
        }),
    }),
    {
      name: 'pangantani:checkout-attempt',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
