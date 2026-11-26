'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type L from 'leaflet'
import type { BuyerRadiusOption } from '@/components/home/hero-search-params'
import { formatPricePerKg, type Coordinates } from '@/components/home/offer-card-helpers'
import { radiusKmToMeters, type CatalogMapCluster } from '@/lib/data/catalog-map-helpers'
import {
  buildClusterMapPillHtml,
  buildReferencePinHtml,
  buildSingleMapPillHtml,
} from './catalog-map-marker-html'

function getClusterVisualSpec(params: {
  cluster: CatalogMapCluster
  selectedOfferId: string | null
  hoveredOfferId: string | null
  activeClusterId: string | null
}): { html: string; zIndexOffset: number } {
  const { cluster, selectedOfferId, hoveredOfferId, activeClusterId } = params

  if (cluster.items.length === 1) {
    const { offer, isExpired } = cluster.items[0]
    const isSelected = offer.id === selectedOfferId
    const isHovered = offer.id === hoveredOfferId
    return {
      html: buildSingleMapPillHtml({
        pricePerKg: offer.pricePerKg,
        isSelected,
        isHovered,
        isExpired,
      }),
      zIndexOffset: isSelected ? 600 : isHovered ? 400 : 120,
    }
  }

  const isSelected = cluster.items.some((entry) => entry.offer.id === selectedOfferId)
  const isHovered = cluster.items.some((entry) => entry.offer.id === hoveredOfferId)
  const isOpen = cluster.id === activeClusterId
  const allExpired = cluster.items.every((entry) => entry.isExpired)

  return {
    html: buildClusterMapPillHtml({
      count: cluster.items.length,
      minPricePerKg: cluster.minPricePerKg,
      isSelected,
      isHovered,
      isOpen,
      allExpired,
    }),
    zIndexOffset: isSelected || isOpen ? 650 : isHovered ? 450 : 200,
  }
}

interface UseCatalogLeafletMapParams {
  referenceCoordinates: Coordinates | null
  locationLabel: string
  radiusKm: BuyerRadiusOption | null
  boundsPoints: Array<[number, number]>
  onMapFailure: (reason: string) => void
  onSelectSingleOffer: (offerId: string) => void
  onHoverSingleOffer: (offerId: string | null) => void
  onClusterHoverStart: (clusterId: string) => void
  onClusterHoverEnd: (clusterId: string) => void
  onClusterTogglePin: (clusterId: string) => void
  onCloseClusterPopover: () => void
}

export function useCatalogLeafletMap(params: UseCatalogLeafletMapParams) {
  const {
    referenceCoordinates,
    locationLabel,
    radiusKm,
    boundsPoints,
    onMapFailure,
    onSelectSingleOffer,
    onHoverSingleOffer,
    onClusterHoverStart,
    onClusterHoverEnd,
    onClusterTogglePin,
    onCloseClusterPopover,
  } = params

  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const leafletRef = useRef<typeof L | null>(null)
  const referenceLayerRef = useRef<L.LayerGroup | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  const markerRecordsRef = useRef<Array<{ cluster: CatalogMapCluster; marker: L.Marker }>>([])
  const initialCoordinatesRef = useRef(referenceCoordinates)
  const suppressMoveDirtyRef = useRef(false)
  const lastFittedBoundsKeyRef = useRef<string | null>(null)

  const boundsKey = boundsPoints
    .map(([lat, lng]) => `${lat.toFixed(5)},${lng.toFixed(5)}`)
    .join('|')

  const callbacksRef = useRef({
    onMapFailure,
    onSelectSingleOffer,
    onHoverSingleOffer,
    onClusterHoverStart,
    onClusterHoverEnd,
    onClusterTogglePin,
    onCloseClusterPopover,
  })

  useEffect(() => {
    callbacksRef.current = {
      onMapFailure,
      onSelectSingleOffer,
      onHoverSingleOffer,
      onClusterHoverStart,
      onClusterHoverEnd,
      onClusterTogglePin,
      onCloseClusterPopover,
    }
  }, [
    onClusterHoverEnd,
    onClusterHoverStart,
    onClusterTogglePin,
    onCloseClusterPopover,
    onHoverSingleOffer,
    onMapFailure,
    onSelectSingleOffer,
  ])

  const [mapInstance, setMapInstance] = useState<L.Map | null>(null)
  const [viewportVersion, setViewportVersion] = useState(0)
  const [mapMoved, setMapMoved] = useState(false)

  const mapReady = mapInstance !== null

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      callbacksRef.current.onMapFailure(
        'Koneksi internet terputus sehingga peta tidak dapat dimuat. Daftar penawaran tetap tersedia di bawah.'
      )
      return
    }

    let cancelled = false

    async function initMap() {
      try {
        const leafletModule = await import('leaflet')
        if (cancelled || !containerRef.current) return

        const leaflet = leafletModule.default
        leafletRef.current = leaflet

        const initialCoords = initialCoordinatesRef.current
        const initialCenter: [number, number] = initialCoords
          ? [initialCoords.lat, initialCoords.lng]
          : [-6.8167, 107.6167]

        const map = leaflet.map(containerRef.current, {
          center: initialCenter,
          zoom: 11,
          zoomControl: false,
          scrollWheelZoom: true,
        })

        leaflet.control.zoom({ position: 'topright' }).addTo(map)

        let hasLoadedTile = false
        let tileErrorCount = 0

        const tileLayer = leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap',
          maxZoom: 18,
        })

        tileLayer.on('tileload', () => {
          hasLoadedTile = true
        })

        tileLayer.on('tileerror', () => {
          tileErrorCount += 1
          if (!cancelled && !hasLoadedTile && tileErrorCount >= 4) {
            callbacksRef.current.onMapFailure(
              'Peta sedang tidak dapat dijangkau. Daftar penawaran tetap diurutkan dari jarak garis lurus terdekat.'
            )
          }
        })

        tileLayer.addTo(map)

        map.on('zoomend', () => {
          setViewportVersion((prev) => prev + 1)
          callbacksRef.current.onCloseClusterPopover()
        })

        map.on('moveend', () => {
          setViewportVersion((prev) => prev + 1)
          if (suppressMoveDirtyRef.current) {
            suppressMoveDirtyRef.current = false
            return
          }
          setMapMoved(true)
        })

        map.on('dragstart', () => callbacksRef.current.onCloseClusterPopover())
        map.on('zoomstart', () => callbacksRef.current.onCloseClusterPopover())
        map.on('click', () => callbacksRef.current.onCloseClusterPopover())

        const referenceLayer = leaflet.layerGroup().addTo(map)
        const markersLayer = leaflet.layerGroup().addTo(map)

        mapRef.current = map
        referenceLayerRef.current = referenceLayer
        markersLayerRef.current = markersLayer

        setMapInstance(map)
      } catch {
        if (!cancelled) {
          callbacksRef.current.onMapFailure(
            'Komponen peta gagal dimuat di perangkat ini. Menampilkan daftar penawaran sebagai pengganti.'
          )
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
      referenceLayerRef.current = null
      markersLayerRef.current = null
      markerRecordsRef.current = []
      leafletRef.current = null
      lastFittedBoundsKeyRef.current = null
      setMapInstance(null)
    }
  }, [])

  useEffect(() => {
    const leaflet = leafletRef.current
    const referenceLayer = referenceLayerRef.current
    if (!mapReady || !leaflet || !referenceLayer) return

    referenceLayer.clearLayers()
    if (!referenceCoordinates) return

    const radiusMeters = radiusKmToMeters(radiusKm)
    if (radiusMeters !== null) {
      leaflet
        .circle([referenceCoordinates.lat, referenceCoordinates.lng], {
          radius: radiusMeters,
          color: '#0e7c5b',
          fillColor: '#0e7c5b',
          fillOpacity: 0.08,
          weight: 2,
          dashArray: '6 4',
        })
        .addTo(referenceLayer)
    }

    const refIcon = leaflet.divIcon({
      className: 'bg-transparent border-0',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      html: buildReferencePinHtml(locationLabel),
    })

    leaflet
      .marker([referenceCoordinates.lat, referenceCoordinates.lng], {
        icon: refIcon,
        zIndexOffset: 20,
        keyboard: false,
      })
      .addTo(referenceLayer)
  }, [locationLabel, mapReady, radiusKm, referenceCoordinates])

  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map || boundsPoints.length === 0) return
    if (lastFittedBoundsKeyRef.current === boundsKey) return

    lastFittedBoundsKeyRef.current = boundsKey
    suppressMoveDirtyRef.current = true
    if (boundsPoints.length === 1) {
      map.setView(boundsPoints[0], 12)
      return
    }

    map.fitBounds(boundsPoints, {
      padding: [40, 40],
      maxZoom: 13,
      animate: false,
    })
  }, [boundsKey, boundsPoints, mapReady])

  const syncClusterLayers = useCallback(
    (
      clusters: ReadonlyArray<CatalogMapCluster>,
      visual: {
        selectedOfferId: string | null
        hoveredOfferId: string | null
        activeClusterId: string | null
      }
    ) => {
      const leaflet = leafletRef.current
      const markersLayer = markersLayerRef.current
      if (!mapReady || !leaflet || !markersLayer) return

      markersLayer.clearLayers()
      const nextRecords: Array<{ cluster: CatalogMapCluster; marker: L.Marker }> = []

      for (const cluster of clusters) {
        const spec = getClusterVisualSpec({ cluster, ...visual })
        const icon = leaflet.divIcon({
          className: 'bg-transparent border-0',
          iconSize: [0, 0],
          iconAnchor: [0, 0],
          html: spec.html,
        })

        const isSingle = cluster.items.length === 1
        const title = isSingle
          ? `${cluster.items[0].offer.commodityName} (${formatPricePerKg(cluster.items[0].offer.pricePerKg)})`
          : `${cluster.items.length} panen di ${cluster.primaryArea} (arahkan kursor untuk memilih)`

        const marker = leaflet.marker([cluster.lat, cluster.lng], {
          icon,
          zIndexOffset: spec.zIndexOffset,
          title,
        })

        if (isSingle) {
          const onlyOfferId = cluster.items[0].offer.id
          marker.on('click', (event) => {
            leaflet.DomEvent.stopPropagation(event)
            callbacksRef.current.onSelectSingleOffer(onlyOfferId)
          })
          marker.on('mouseover', () => {
            callbacksRef.current.onHoverSingleOffer(onlyOfferId)
          })
          marker.on('mouseout', () => {
            callbacksRef.current.onHoverSingleOffer(null)
          })
        } else {
          marker.on('mouseover', () => {
            callbacksRef.current.onClusterHoverStart(cluster.id)
          })
          marker.on('mouseout', () => {
            callbacksRef.current.onClusterHoverEnd(cluster.id)
          })
          marker.on('click', (event) => {
            leaflet.DomEvent.stopPropagation(event)
            callbacksRef.current.onClusterTogglePin(cluster.id)
          })
          marker.on('keydown', (event) => {
            const key = event.originalEvent.key
            if (key === 'Enter' || key === ' ') {
              event.originalEvent.preventDefault()
              callbacksRef.current.onClusterTogglePin(cluster.id)
            }
          })
        }

        marker.addTo(markersLayer)
        nextRecords.push({ cluster, marker })
      }

      markerRecordsRef.current = nextRecords
    },
    [mapReady]
  )

  const syncClusterVisuals = useCallback(
    (visual: {
      selectedOfferId: string | null
      hoveredOfferId: string | null
      activeClusterId: string | null
    }) => {
      if (!mapReady) return

      for (const record of markerRecordsRef.current) {
        const spec = getClusterVisualSpec({ cluster: record.cluster, ...visual })
        const element = record.marker.getElement()
        if (element) {
          element.innerHTML = spec.html
        }
        record.marker.setZIndexOffset(spec.zIndexOffset)
      }
    },
    [mapReady]
  )

  const getMapCenter = useCallback((): Coordinates | null => {
    const center = mapRef.current?.getCenter()
    return center ? { lat: center.lat, lng: center.lng } : null
  }, [])

  const resetMapPosition = useCallback(() => {
    const map = mapRef.current
    if (!map) return

    suppressMoveDirtyRef.current = true
    setMapMoved(false)

    if (boundsPoints.length > 1) {
      map.fitBounds(boundsPoints, {
        padding: [40, 40],
        maxZoom: 13,
        animate: true,
      })
      return
    }

    if (boundsPoints.length === 1) {
      map.setView(boundsPoints[0], 12, { animate: true })
      return
    }

    if (referenceCoordinates) {
      map.setView([referenceCoordinates.lat, referenceCoordinates.lng], 12, { animate: true })
    }
  }, [boundsPoints, referenceCoordinates])

  return {
    containerRef,
    mapInstance,
    mapReady,
    viewportVersion,
    mapMoved,
    setMapMoved,
    syncClusterLayers,
    syncClusterVisuals,
    getMapCenter,
    resetMapPosition,
  }
}
