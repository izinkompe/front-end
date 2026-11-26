'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

interface OfferAreaMapProps {
  areaLabel: string
  distanceLabel: string | null
  latitude?: number
  longitude?: number
}

function subscribeOnlineStatus(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => {}
  }
  window.addEventListener('online', onStoreChange)
  window.addEventListener('offline', onStoreChange)
  return () => {
    window.removeEventListener('online', onStoreChange)
    window.removeEventListener('offline', onStoreChange)
  }
}

function getOnlineSnapshot() {
  if (typeof navigator === 'undefined') {
    return true
  }
  return navigator.onLine
}

function getServerOnlineSnapshot() {
  return true
}

export function OfferAreaMap({ areaLabel, distanceLabel, latitude, longitude }: OfferAreaMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const isOnline = useSyncExternalStore(
    subscribeOnlineStatus,
    getOnlineSnapshot,
    getServerOnlineSnapshot
  )

  const hasCoords = typeof latitude === 'number' && typeof longitude === 'number'
  const coordKey = hasCoords ? `${latitude}:${longitude}` : ''

  const [readyKey, setReadyKey] = useState('')
  const [errorState, setErrorState] = useState<{ key: string; message: string } | null>(null)

  const mapReady = readyKey === coordKey && coordKey !== ''
  const mapError = !isOnline
    ? 'Peta tidak dapat dimuat saat luring. Gunakan keterangan area di samping.'
    : errorState?.key === coordKey
      ? errorState.message
      : null

  useEffect(() => {
    const container = containerRef.current
    if (!container || !hasCoords || !isOnline) return

    let cancelled = false

    async function initMap() {
      try {
        const leafletModule = await import('leaflet')
        if (cancelled || !containerRef.current) return

        const leaflet = leafletModule.default
        const lat = latitude as number
        const lng = longitude as number

        const map = leaflet.map(containerRef.current, {
          center: [lat, lng],
          zoom: 12,
          zoomControl: false,
          scrollWheelZoom: false,
        })

        leaflet.control.zoom({ position: 'topright' }).addTo(map)

        let hasLoadedTile = false
        let tileErrorCount = 0

        const tileLayer = leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap',
          maxZoom: 16,
        })

        tileLayer.on('tileload', () => {
          hasLoadedTile = true
        })

        tileLayer.on('tileerror', () => {
          tileErrorCount += 1
          if (!cancelled && !hasLoadedTile && tileErrorCount >= 4) {
            setErrorState({
              key: coordKey,
              message:
                'Peta area sedang tidak dapat dijangkau. Perkirakan jarak dari area yang tertera.',
            })
          }
        })

        tileLayer.addTo(map)

        leaflet
          .circle([lat, lng], {
            radius: 1500,
            color: '#1b6e4b',
            weight: 2,
            fillColor: '#1b6e4b',
            fillOpacity: 0.16,
          })
          .addTo(map)

        mapRef.current = map
        setReadyKey(coordKey)
      } catch {
        if (!cancelled) {
          setErrorState({
            key: coordKey,
            message: 'Peta area gagal dimuat di peramban ini.',
          })
        }
      }
    }

    void initMap()

    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [coordKey, hasCoords, isOnline, latitude, longitude])

  if (!hasCoords || mapError) {
    return (
      <Alert className='border-border bg-muted/40 text-foreground'>
        <MapPin aria-hidden='true' />
        <AlertTitle>Area pengambilan: {areaLabel}</AlertTitle>
        <AlertDescription>
          {mapError ??
            'Titik peta belum tersedia untuk penawaran ini. Alamat lengkap terbuka setelah reservasi.'}
          {distanceLabel ? ` Perkiraan jarak garis lurus ${distanceLabel}.` : ''}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className='relative isolate h-64 w-full overflow-hidden rounded-2xl border border-border bg-muted/40 sm:h-72'>
      {!mapReady && <Skeleton className='absolute inset-0 size-full rounded-none' />}
      <div
        ref={containerRef}
        aria-label={`Perkiraan area pengambilan di ${areaLabel}`}
        className='size-full'
      />
      <div className='pointer-events-none absolute bottom-3 left-3 z-400 rounded-lg border border-border bg-background/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-xs'>
        Perkiraan area {areaLabel}
        {distanceLabel ? ` (${distanceLabel})` : ''}
      </div>
    </div>
  )
}
