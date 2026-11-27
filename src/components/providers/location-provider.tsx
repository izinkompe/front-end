'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { defaultLocation, findNearestLocation, type SelectedLocation } from '@/lib/data/regions'
import {
  getGeolocationErrorMessage,
  queryGeolocationPermission,
  requestCurrentPosition,
} from '@/lib/geolocation'

interface LocationContextValue {
  selectedLocation: SelectedLocation
  hasUpdatedLocation: boolean
  setSelectedLocation: (location: SelectedLocation) => void
  locating: boolean
  locationMessage: string | null
  clearLocationMessage: () => void
  detectCurrentLocation: (onSuccess?: (location: SelectedLocation) => void) => void
}

const STORAGE_KEY = 'pangantani:selected-location'
const LOCATION_CHANGE_EVENT = 'pangantani:location-change'

function parseStoredLocation(raw: string | null): SelectedLocation | null {
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    if (
      parsed &&
      typeof parsed === 'object' &&
      'provinceId' in parsed &&
      'regionId' in parsed &&
      'label' in parsed &&
      typeof parsed.provinceId === 'string' &&
      (parsed.regionId === null || typeof parsed.regionId === 'string') &&
      typeof parsed.label === 'string'
    ) {
      return {
        provinceId: parsed.provinceId,
        regionId: parsed.regionId,
        label: parsed.label,
      }
    }
    return null
  } catch {
    return null
  }
}

function subscribeStoredLocation(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const handler = () => onStoreChange()
  window.addEventListener('storage', handler)
  window.addEventListener(LOCATION_CHANGE_EVENT, handler)
  return () => {
    window.removeEventListener('storage', handler)
    window.removeEventListener(LOCATION_CHANGE_EVENT, handler)
  }
}

function getStoredLocationSnapshot(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function getStoredLocationServerSnapshot(): string | null {
  return null
}

function writeStoredLocation(location: SelectedLocation): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(location))
    window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT))
  } catch {
    return
  }
}

const LocationContext = createContext<LocationContextValue | null>(null)

export function LocationProvider({ children }: { children: ReactNode }) {
  const storedRaw = useSyncExternalStore(
    subscribeStoredLocation,
    getStoredLocationSnapshot,
    getStoredLocationServerSnapshot
  )
  const storedLocation = useMemo(() => parseStoredLocation(storedRaw), [storedRaw])
  const selectedLocation = storedLocation ?? defaultLocation
  const hasUpdatedLocation = storedLocation !== null

  const [locating, setLocating] = useState(false)
  const [locationMessage, setLocationMessage] = useState<string | null>(null)

  const setSelectedLocation = useCallback((location: SelectedLocation) => {
    setLocationMessage(null)
    writeStoredLocation(location)
  }, [])

  const clearLocationMessage = useCallback(() => {
    setLocationMessage(null)
  }, [])

  const detectCurrentLocation = useCallback(
    async (onSuccess?: (location: SelectedLocation) => void) => {
      setLocating(true)
      setLocationMessage(null)

      const result = await requestCurrentPosition()
      if (!result.ok) {
        setLocating(false)
        setLocationMessage(getGeolocationErrorMessage(result.reason, 'buyer'))
        return
      }

      const nearest = findNearestLocation(result.latitude, result.longitude)
      const nextLocation: SelectedLocation = {
        provinceId: nearest.provinceId,
        regionId: nearest.regionId,
        label: nearest.label,
      }
      setLocating(false)
      setLocationMessage(null)
      writeStoredLocation(nextLocation)
      onSuccess?.(nextLocation)
    },
    []
  )

  useEffect(() => {
    if (storedRaw !== null) return

    let cancelled = false
    void queryGeolocationPermission().then((state) => {
      if (!cancelled && state === 'granted') {
        void detectCurrentLocation()
      }
    })
    return () => {
      cancelled = true
    }
  }, [detectCurrentLocation, storedRaw])

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
