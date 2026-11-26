import { describe, expect, test } from 'bun:test'
import { mockOffersData } from '@/lib/api/db/fixtures/offers.fixture'
import {
  clusterMapMarkersByProximity,
  computeClusterPopupPlacement,
  computeMapBoundsPoints,
  escapeHtmlText,
  formatCompactMarkerPrice,
  radiusKmToMeters,
  spreadOverlappingOfferMarkers,
} from './catalog-map-helpers'

describe('catalog map helpers', () => {
  test('formats compact Indonesian Rupiah price labels for map pins', () => {
    expect(formatCompactMarkerPrice(14000)).toBe('Rp 14rb')
    expect(formatCompactMarkerPrice(12500)).toBe('Rp 12,5rb')
    expect(formatCompactMarkerPrice(5500)).toBe('Rp 5,5rb')
    expect(formatCompactMarkerPrice(1200000)).toBe('Rp 1,2jt')
    expect(formatCompactMarkerPrice(850)).toBe('Rp 850')
  })

  test('converts radius options to meters safely', () => {
    expect(radiusKmToMeters('5')).toBe(5000)
    expect(radiusKmToMeters('25')).toBe(25000)
    expect(radiusKmToMeters(null)).toBeNull()
  })

  test('spreads overlapping coordinates while keeping unique markers exact', () => {
    const lembangItems = mockOffersData
      .filter((offer) => offer.pickupAddressArea.includes('Lembang'))
      .map((offer) => ({ offer, distanceKm: 0, isExpired: false }))

    expect(lembangItems.length).toBeGreaterThan(1)

    const markers = spreadOverlappingOfferMarkers(lembangItems)
    expect(markers.length).toBe(lembangItems.length)

    const coordKeys = new Set(markers.map((marker) => `${marker.lat},${marker.lng}`))
    expect(coordKeys.size).toBe(lembangItems.length)
  })

  test('computes bounds points including radius perimeter', () => {
    const reference = { lat: -6.8167, lng: 107.6167 }
    const points = computeMapBoundsPoints(reference, [], '10')
    expect(points.length).toBe(5)
    expect(points[0]).toEqual([reference.lat, reference.lng])
  })

  test('escapes unsafe HTML characters in marker labels', () => {
    expect(escapeHtmlText('<script>alert("x")</script>')).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;'
    )
  })

  test('clusters co-located and overlapping screen markers while preserving separated points', () => {
    const lembangItems = mockOffersData
      .filter((offer) => offer.pickupAddressArea.includes('Lembang'))
      .map((offer) => ({ offer, distanceKm: 0, isExpired: false }))
    const pangalenganItem = mockOffersData
      .filter((offer) => offer.pickupAddressArea.includes('Pangalengan'))
      .slice(0, 1)
      .map((offer) => ({ offer, distanceKm: 35, isExpired: false }))

    const clusters = clusterMapMarkersByProximity(
      [...lembangItems, ...pangalenganItem],
      (lat, lng) => ({ x: lng * 1000, y: lat * 1000 })
    )

    expect(clusters.length).toBe(2)
    expect(clusters[0].items.length).toBe(lembangItems.length)
    expect(clusters[0].minPricePerKg).toBe(
      Math.min(...lembangItems.map((entry) => entry.offer.pricePerKg))
    )
    expect(clusters[0].primaryArea).toBe('Lembang, Bandung Barat')
    expect(clusters[1].items.length).toBe(1)
  })

  test('computes viewport-clamped popup placement above or below cluster anchor', () => {
    const highAnchor = computeClusterPopupPlacement({
      anchor: { x: 20, y: 80 },
      containerWidth: 420,
      containerHeight: 500,
    })
    expect(highAnchor.openAbove).toBe(false)
    expect(highAnchor.left).toBe(12)
    expect(highAnchor.top).toBe(90)

    const lowAnchor = computeClusterPopupPlacement({
      anchor: { x: 250, y: 360 },
      containerWidth: 480,
      containerHeight: 520,
    })
    expect(lowAnchor.openAbove).toBe(true)
    expect(lowAnchor.bottom).toBe(204)
  })
})
