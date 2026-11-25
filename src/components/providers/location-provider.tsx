'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { defaultLocation, findNearestLocation, type SelectedLocation } from '@/lib/data/regions'

interface LocationContextValue {
  selectedLocation: SelectedLocation
  hasUpdatedLocation: boolean
  setSelectedLocation: (location: SelectedLocation) => void
  locating: boolean
  locationMessage: string | null
  clearLocationMessage: () => void
  detectCurrentLocation: (onSuccess?: (location: SelectedLocation) => void) => void
}

const LocationContext = createContext<LocationContextValue | null>(null)

export function LocationProvider({ children }: { children: ReactNode }) {
  const [selectedLocation, setSelectedLocationState] = useState<SelectedLocation>(defaultLocation)
  const [hasUpdatedLocation, setHasUpdatedLocation] = useState(false)
  const [locating, setLocating] = useState(false)
  const [locationMessage, setLocationMessage] = useState<string | null>(null)

  const setSelectedLocation = useCallback((location: SelectedLocation) => {
    setSelectedLocationState(location)
    setHasUpdatedLocation(true)
    setLocationMessage(null)
  }, [])

  const clearLocationMessage = useCallback(() => {
    setLocationMessage(null)
  }, [])

  const detectCurrentLocation = useCallback((onSuccess?: (location: SelectedLocation) => void) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationMessage('Browser tidak mendukung deteksi lokasi.')
      return
    }

    setLocating(true)
    setLocationMessage(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nearest = findNearestLocation(position.coords.latitude, position.coords.longitude)
        const nextLocation: SelectedLocation = {
          provinceId: nearest.provinceId,
          regionId: nearest.regionId,
          label: nearest.label,
        }
        setSelectedLocationState(nextLocation)
        setHasUpdatedLocation(true)
        setLocating(false)
        setLocationMessage(null)
        onSuccess?.(nextLocation)
      },
      () => {
        setLocating(false)
        setLocationMessage('Izin lokasi ditolak. Pilih wilayah secara manual.')
      },
      { timeout: 8000 }
    )
  }, [])

  const value = useMemo<LocationContextValue>(
    () => ({
      selectedLocation,
      hasUpdatedLocation,
      setSelectedLocation,
      locating,
      locationMessage,
      clearLocationMessage,
      detectCurrentLocation,
    }),
    [
      selectedLocation,
      hasUpdatedLocation,
      setSelectedLocation,
      locating,
      locationMessage,
      clearLocationMessage,
      detectCurrentLocation,
    ]
  )

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
}

export function useSelectedLocation() {
  const context = useContext(LocationContext)
  if (!context) {
    throw new Error('useSelectedLocation must be used within LocationProvider')
  }
  return context
}
