'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface LocationState {
  selectedArea: string | null
  latitude: number | null
  longitude: number | null
  radiusKm: number
  setLocation: (location: {
    selectedArea: string | null
    latitude: number | null
    longitude: number | null
  }) => void
  setRadiusKm: (radiusKm: number) => void
  clearLocation: () => void
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      selectedArea: null,
      latitude: null,
      longitude: null,
      radiusKm: 25,
      setLocation: (location) => set(location),
      setRadiusKm: (radiusKm) => set({ radiusKm }),
      clearLocation: () => set({ selectedArea: null, latitude: null, longitude: null }),
    }),
    {
      name: 'pangantani:location',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
