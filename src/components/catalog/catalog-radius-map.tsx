'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import type { BuyerRadiusOption } from '@/components/home/hero-search-params'
import type { Coordinates } from '@/components/home/offer-card-helpers'
import { useSelectedLocation } from '@/components/providers/location-provider'
import { Skeleton } from '@/components/ui/skeleton'
import type { CatalogOfferItem } from '@/lib/data/catalog-filters'
import {
  clusterMapMarkersByProximity,
  computeClusterPopupPlacement,
  computeMapBoundsPoints,
  spreadOverlappingOfferMarkers,
  type CatalogMapCluster,
} from '@/lib/data/catalog-map-helpers'
import { findNearestLocation } from '@/lib/data/regions'
import { cn } from '@/lib/utils'
import { CatalogMapClusterPopover } from './catalog-map-cluster-popover'
import { CatalogMapControls } from './catalog-map-controls'
import { CatalogMapSelectedCard } from './catalog-map-selected-card'
import { useCatalogLeafletMap } from './use-catalog-leaflet-map'

interface CatalogRadiusMapProps {
  items: ReadonlyArray<CatalogOfferItem>
  referenceCoordinates: Coordinates | null
  radiusKm: BuyerRadiusOption | null
  selectedOfferId: string | null
  hoveredOfferId: string | null
  fullBleed?: boolean
  onRadiusChange: (nextRadius: BuyerRadiusOption | null) => void
  onSelectOffer: (offerId: string | null) => void
  onHoverOffer: (offerId: string | null) => void
  onMapFailure: (reason: string) => void
}

export function CatalogRadiusMap({
  items,
  referenceCoordinates,
  radiusKm,
  selectedOfferId,
  hoveredOfferId,
  fullBleed = false,
  onRadiusChange,
  onSelectOffer,
  onHoverOffer,
  onMapFailure,
}: CatalogRadiusMapProps) {
  const {
    selectedLocation,
    setSelectedLocation,
    locating,
    locationMessage,
    detectCurrentLocation,
  } = useSelectedLocation()

  const [hoveredClusterId, setHoveredClusterId] = useState<string | null>(null)
  const [pinnedClusterId, setPinnedClusterId] = useState<string | null>(null)
  const hoverCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeClusterId = pinnedClusterId ?? hoveredClusterId

  const cancelHoverClose = useCallback(() => {
    if (hoverCloseTimerRef.current) {
      clearTimeout(hoverCloseTimerRef.current)
      hoverCloseTimerRef.current = null
    }
  }, [])

  const closeClusterPopover = useCallback(() => {
    cancelHoverClose()
    setHoveredClusterId(null)
    setPinnedClusterId(null)
  }, [cancelHoverClose])

  const scheduleHoverClose = useCallback(
    (clusterId: string) => {
      cancelHoverClose()
      hoverCloseTimerRef.current = setTimeout(() => {
        setHoveredClusterId((prev) => (prev === clusterId ? null : prev))
      }, 180)
    },
    [cancelHoverClose]
  )

  useEffect(() => {
    return () => cancelHoverClose()
  }, [cancelHoverClose])

  useEffect(() => {
    if (!hoveredClusterId && !pinnedClusterId) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeClusterPopover()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [closeClusterPopover, hoveredClusterId, pinnedClusterId])

  const rawMarkerPoints = useMemo(() => spreadOverlappingOfferMarkers(items), [items])

  const selectedItem = useMemo(
    () => items.find((item) => item.offer.id === selectedOfferId) ?? null,
    [items, selectedOfferId]
  )

  const boundsPoints = useMemo(
    () => computeMapBoundsPoints(referenceCoordinates, rawMarkerPoints, radiusKm),
    [radiusKm, rawMarkerPoints, referenceCoordinates]
  )

  const handleSelectSingleOffer = useCallback(
    (offerId: string) => {
      closeClusterPopover()
      onSelectOffer(offerId)
    },
    [closeClusterPopover, onSelectOffer]
  )

  const handleClusterHoverStart = useCallback(
    (clusterId: string) => {
      cancelHoverClose()
      setHoveredClusterId(clusterId)
    },
    [cancelHoverClose]
  )

  const handleClusterTogglePin = useCallback(
    (clusterId: string) => {
      cancelHoverClose()
      setHoveredClusterId(null)
      setPinnedClusterId((prev) => (prev === clusterId ? null : clusterId))
    },
    [cancelHoverClose]
  )

  const {
    containerRef,
    mapInstance,
    mapReady,
    viewportVersion,
    mapMoved,
    setMapMoved,
    syncClusterLayers,
    syncClusterVisuals,
    getMapCenter,
  } = useCatalogLeafletMap({
    referenceCoordinates,
    locationLabel: selectedLocation.label,
    radiusKm,
    boundsPoints,
    onMapFailure,
    onSelectSingleOffer: handleSelectSingleOffer,
    onHoverSingleOffer: onHoverOffer,
    onClusterHoverStart: handleClusterHoverStart,
    onClusterHoverEnd: scheduleHoverClose,
    onClusterTogglePin: handleClusterTogglePin,
    onCloseClusterPopover: closeClusterPopover,
  })

  const clusters = useMemo(() => {
    if (!mapInstance || viewportVersion < 0) return []
    return clusterMapMarkersByProximity(items, (lat, lng) =>
      mapInstance.latLngToLayerPoint([lat, lng])
    )
  }, [items, mapInstance, viewportVersion])

  useEffect(() => {
    syncClusterLayers(clusters, {
      selectedOfferId: null,
      hoveredOfferId: null,
      activeClusterId: null,
    })
  }, [clusters, syncClusterLayers])

  useEffect(() => {
    syncClusterVisuals({
      selectedOfferId,
      hoveredOfferId,
      activeClusterId,
    })
  }, [activeClusterId, clusters, hoveredOfferId, selectedOfferId, syncClusterVisuals])

  const activeCluster = useMemo<CatalogMapCluster | null>(
    () =>
      clusters.find((cluster) => cluster.id === activeClusterId && cluster.items.length > 1) ??
      null,
    [activeClusterId, clusters]
  )

  const activeClusterPlacement = useMemo(() => {
    if (!activeCluster || !mapInstance || viewportVersion < 0) return null
    const size = mapInstance.getSize()
    if (size.x <= 0 || size.y <= 0) return null
    const anchor = mapInstance.latLngToContainerPoint([activeCluster.lat, activeCluster.lng])
    return computeClusterPopupPlacement({
      anchor,
      containerWidth: size.x,
      containerHeight: size.y,
    })
  }, [activeCluster, mapInstance, viewportVersion])

  function handleSearchMapCenter() {
    const center = getMapCenter()
    if (!center) return
    const nearest = findNearestLocation(center.lat, center.lng)
    setSelectedLocation({
      provinceId: nearest.provinceId,
      regionId: nearest.regionId,
      label: nearest.label,
    })
    setMapMoved(false)
  }

  return (
    <div
      className={cn(
        'relative isolate flex flex-col overflow-hidden bg-card',
        fullBleed
          ? 'h-full min-h-96 border-t border-border lg:border-t-0 lg:border-l'
          : 'h-[48dvh] min-h-92 rounded-2xl border border-border shadow-sm'
      )}
    >
      <div className='relative min-h-0 flex-1'>
        {!mapReady && <Skeleton className='absolute inset-0 size-full rounded-none' />}
        <div
          ref={containerRef}
          aria-label={`Peta radius panen dari ${selectedLocation.label}`}
          className='size-full bg-muted/40'
        />

        <CatalogMapControls
          radiusKm={radiusKm}
          locating={locating}
          mapMoved={mapMoved}
          locationMessage={locationMessage}
          onRadiusChange={onRadiusChange}
          onDetectLocation={detectCurrentLocation}
          onSearchMapCenter={handleSearchMapCenter}
        />

        {activeCluster && activeClusterPlacement && (
          <CatalogMapClusterPopover
            cluster={activeCluster}
            placement={activeClusterPlacement}
            selectedOfferId={selectedOfferId}
            onPickOffer={(offerId) => {
              closeClusterPopover()
              onHoverOffer(null)
              onSelectOffer(offerId)
            }}
            onHoverOffer={onHoverOffer}
            onClose={closeClusterPopover}
            onPointerEnter={cancelHoverClose}
            onPointerLeave={() => {
              if (!pinnedClusterId) {
                scheduleHoverClose(activeCluster.id)
              }
            }}
          />
        )}

        {selectedItem && (
          <CatalogMapSelectedCard item={selectedItem} onClose={() => onSelectOffer(null)} />
        )}
      </div>
    </div>
  )
}
