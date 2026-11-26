import type { BuyerRadiusOption } from '@/components/home/hero-search-params'
import type { Coordinates } from '@/components/home/offer-card-helpers'
import type { CatalogOfferItem } from '@/lib/data/catalog-filters'

export interface CatalogMapMarkerPoint {
  item: CatalogOfferItem
  lat: number
  lng: number
}

export interface ProjectedMapPoint {
  x: number
  y: number
}

export interface CatalogMapCluster {
  id: string
  lat: number
  lng: number
  items: CatalogOfferItem[]
  minPricePerKg: number
  primaryArea: string
}

export interface ClusterPopupPlacement {
  left: number
  top: number | null
  bottom: number | null
  maxHeight: number
  openAbove: boolean
  width: number
}

const compactThousandFormatter = new Intl.NumberFormat('id-ID', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
})

export function formatCompactMarkerPrice(pricePerKg: number): string {
  if (!Number.isFinite(pricePerKg) || pricePerKg <= 0) {
    return 'Rp 0'
  }
  if (pricePerKg >= 1_000_000) {
    const millions = Math.round(pricePerKg / 100_000) / 10
    return `Rp ${compactThousandFormatter.format(millions)}jt`
  }
  if (pricePerKg >= 1_000) {
    const thousands = Math.round(pricePerKg / 100) / 10
    return `Rp ${compactThousandFormatter.format(thousands)}rb`
  }
  return `Rp ${Math.round(pricePerKg)}`
}

export function radiusKmToMeters(radiusKm: BuyerRadiusOption | null): number | null {
  if (!radiusKm) return null
  const km = Number(radiusKm)
  if (!Number.isFinite(km) || km <= 0) return null
  return km * 1000
}

export function spreadOverlappingOfferMarkers(
  items: ReadonlyArray<CatalogOfferItem>
): CatalogMapMarkerPoint[] {
  const withCoords = items.filter(
    (item) =>
      typeof item.offer.latitude === 'number' &&
      Number.isFinite(item.offer.latitude) &&
      typeof item.offer.longitude === 'number' &&
      Number.isFinite(item.offer.longitude)
  )

  const groups = new Map<string, CatalogOfferItem[]>()
  for (const item of withCoords) {
    const lat = item.offer.latitude as number
    const lng = item.offer.longitude as number
    const key = `${lat.toFixed(4)},${lng.toFixed(4)}`
    const existing = groups.get(key)
    if (existing) {
      existing.push(item)
    } else {
      groups.set(key, [item])
    }
  }

  const result: CatalogMapMarkerPoint[] = []
  const ringRadiusDeg = 0.0028

  for (const group of groups.values()) {
    if (group.length === 1) {
      const only = group[0]
      result.push({
        item: only,
        lat: only.offer.latitude as number,
        lng: only.offer.longitude as number,
      })
      continue
    }

    const stepAngle = (2 * Math.PI) / group.length
    group.forEach((item, index) => {
      const baseLat = item.offer.latitude as number
      const baseLng = item.offer.longitude as number
      const angle = index * stepAngle
      result.push({
        item,
        lat: Number((baseLat + Math.sin(angle) * ringRadiusDeg).toFixed(6)),
        lng: Number((baseLng + Math.cos(angle) * ringRadiusDeg).toFixed(6)),
      })
    })
  }

  return result
}

export function computeMapBoundsPoints(
  referenceCoordinates: Coordinates | null,
  markers: ReadonlyArray<CatalogMapMarkerPoint>,
  radiusKm: BuyerRadiusOption | null
): Array<[number, number]> {
  const points: Array<[number, number]> = markers.map((marker) => [marker.lat, marker.lng])

  if (referenceCoordinates) {
    points.push([referenceCoordinates.lat, referenceCoordinates.lng])

    if (radiusKm) {
      const km = Number(radiusKm)
      if (Number.isFinite(km) && km > 0) {
        const latDelta = km / 111.32
        const cosLat = Math.max(0.2, Math.cos((referenceCoordinates.lat * Math.PI) / 180))
        const lngDelta = km / (111.32 * cosLat)
        points.push([referenceCoordinates.lat + latDelta, referenceCoordinates.lng])
        points.push([referenceCoordinates.lat - latDelta, referenceCoordinates.lng])
        points.push([referenceCoordinates.lat, referenceCoordinates.lng + lngDelta])
        points.push([referenceCoordinates.lat, referenceCoordinates.lng - lngDelta])
      }
    }
  }

  return points
}

export function escapeHtmlText(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function summarizeClusterAreas(items: ReadonlyArray<CatalogOfferItem>): string {
  const uniqueAreas: string[] = []
  for (const item of items) {
    const area = item.offer.pickupAddressArea.trim()
    if (area && !uniqueAreas.includes(area)) {
      uniqueAreas.push(area)
    }
  }
  if (uniqueAreas.length === 0) return 'Area panen'
  if (uniqueAreas.length === 1) return uniqueAreas[0]
  return `${uniqueAreas[0]} (+${uniqueAreas.length - 1} area)`
}

export function clusterMapMarkersByProximity(
  items: ReadonlyArray<CatalogOfferItem>,
  project: (lat: number, lng: number) => ProjectedMapPoint,
  options?: { thresholdX?: number; thresholdY?: number }
): CatalogMapCluster[] {
  const thresholdX = options?.thresholdX ?? 96
  const thresholdY = options?.thresholdY ?? 40

  const groups: Array<{
    items: CatalogOfferItem[]
    sumLat: number
    sumLng: number
    lat: number
    lng: number
    point: ProjectedMapPoint
    minPricePerKg: number
  }> = []

  for (const item of items) {
    const lat = item.offer.latitude
    const lng = item.offer.longitude
    if (
      typeof lat !== 'number' ||
      !Number.isFinite(lat) ||
      typeof lng !== 'number' ||
      !Number.isFinite(lng)
    ) {
      continue
    }

    const point = project(lat, lng)
    const match = groups.find(
      (group) =>
        Math.abs(point.x - group.point.x) < thresholdX &&
        Math.abs(point.y - group.point.y) < thresholdY
    )

    if (match) {
      match.items.push(item)
      match.sumLat += lat
      match.sumLng += lng
      match.lat = Number((match.sumLat / match.items.length).toFixed(6))
      match.lng = Number((match.sumLng / match.items.length).toFixed(6))
      match.point = project(match.lat, match.lng)
      match.minPricePerKg = Math.min(match.minPricePerKg, item.offer.pricePerKg)
    } else {
      groups.push({
        items: [item],
        sumLat: lat,
        sumLng: lng,
        lat,
        lng,
        point,
        minPricePerKg: item.offer.pricePerKg,
      })
    }
  }

  return groups.map((group) => {
    const sortedIds = group.items.map((entry) => entry.offer.id).sort()
    return {
      id: `cluster-${sortedIds.join('__')}`,
      lat: group.lat,
      lng: group.lng,
      items: group.items,
      minPricePerKg: group.minPricePerKg,
      primaryArea: summarizeClusterAreas(group.items),
    }
  })
}

export function computeClusterPopupPlacement(params: {
  anchor: ProjectedMapPoint
  containerWidth: number
  containerHeight: number
  popupWidth?: number
}): ClusterPopupPlacement {
  const width = Math.min(params.popupWidth ?? 304, Math.max(220, params.containerWidth - 24))
  const maxLeft = Math.max(12, params.containerWidth - width - 12)
  const left = Math.round(Math.min(Math.max(12, params.anchor.x - width / 2), maxLeft))

  const topReserve = 60
  const pillTopOffset = 44
  const pillBottomOffset = 10
  const roomAbove = params.anchor.y - pillTopOffset - topReserve
  const roomBelow = params.containerHeight - (params.anchor.y + pillBottomOffset) - 16
  const openAbove = roomAbove >= 180 || roomAbove >= roomBelow

  if (openAbove) {
    return {
      left,
      top: null,
      bottom: Math.max(12, Math.round(params.containerHeight - (params.anchor.y - pillTopOffset))),
      maxHeight: Math.max(140, Math.min(260, Math.round(roomAbove))),
      openAbove: true,
      width: Math.round(width),
    }
  }

  const top = Math.max(topReserve, Math.round(params.anchor.y + pillBottomOffset))
  return {
    left,
    top,
    bottom: null,
    maxHeight: Math.max(140, Math.min(260, Math.round(params.containerHeight - top - 16))),
    openAbove: false,
    width: Math.round(width),
  }
}
