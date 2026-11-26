import { z } from 'zod'
import { provinceGroups, type SelectedLocation } from '@/lib/data/regions'
import type { CommodityCondition, DynamicPriceRule, ScheduleSlot } from '@/types/api/offers'

export interface Coordinates {
  lat: number
  lng: number
}

export type OfferCountdownUrgency = 'expired' | 'critical' | 'soon' | 'normal'

export interface OfferCountdownState {
  remainingMs: number
  isExpired: boolean
  urgency: OfferCountdownUrgency
  label: string
}

export interface DynamicPriceSummary {
  hasDynamicRule: boolean
  hasDropped: boolean
  originalPriceFormatted: string | null
  scheduleHint: string | null
}

export interface CommodityConditionMeta {
  label: string
  shortLabel: string
}

const OfferIdSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-zA-Z0-9_-]+$/)

const EARTH_RADIUS_KM = 6371
const THREE_HOURS_MS = 3 * 60 * 60 * 1000
const SIX_HOURS_MS = 6 * 60 * 60 * 1000

const rupiahFormatter = new Intl.NumberFormat('id-ID')

const weightFormatter = new Intl.NumberFormat('id-ID', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 3,
})

const shortDateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
})

export const commodityConditionLabels: Record<CommodityCondition, CommodityConditionMeta> = {
  ripe_urgent: {
    label: 'Matang segera olah',
    shortLabel: 'Matang segera olah',
  },
  grade_b: {
    label: 'Grade B layak olah',
    shortLabel: 'Grade B',
  },
  surplus: {
    label: 'Panen surplus',
    shortLabel: 'Surplus panen',
  },
  imperfect_shape: {
    label: 'Bentuk tidak seragam',
    shortLabel: 'Bentuk tak seragam',
  },
}

export function getCommodityConditionMeta(condition: CommodityCondition): CommodityConditionMeta {
  return commodityConditionLabels[condition]
}

export function getLocationCoordinates(location: SelectedLocation): Coordinates | null {
  const province = provinceGroups.find((item) => item.id === location.provinceId)
  if (!province) return null

  if (location.regionId) {
    const region = province.regions.find((item) => item.id === location.regionId)
    if (region) {
      return { lat: region.lat, lng: region.lng }
    }
  }

  const fallbackRegion = province.regions[0]
  return fallbackRegion ? { lat: fallbackRegion.lat, lng: fallbackRegion.lng } : null
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

export function calculateStraightLineDistanceKm(from: Coordinates, to: Coordinates): number {
  const dLat = toRadians(to.lat - from.lat)
  const dLng = toRadians(to.lng - from.lng)
  const fromLatRad = toRadians(from.lat)
  const toLatRad = toRadians(to.lat)

  const sinHalfLat = Math.sin(dLat / 2)
  const sinHalfLng = Math.sin(dLng / 2)
  const haversine =
    sinHalfLat * sinHalfLat + Math.cos(fromLatRad) * Math.cos(toLatRad) * sinHalfLng * sinHalfLng
  const angularDistance = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))

  return Math.round(EARTH_RADIUS_KM * angularDistance * 10) / 10
}

export function formatStraightLineDistance(distanceKm: number): string {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) {
    return 'Jarak tidak tersedia'
  }
  if (distanceKm < 1) {
    return '< 1 km'
  }
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: distanceKm < 10 ? 1 : 0,
    maximumFractionDigits: 1,
  }).format(distanceKm)
  return `~${formatted} km`
}

function padTwoDigits(value: number): string {
  return String(value).padStart(2, '0')
}

export function getOfferCountdownState(
  orderDeadlineIso: string,
  nowMs: number
): OfferCountdownState {
  const deadlineMs = Date.parse(orderDeadlineIso)
  if (!Number.isFinite(deadlineMs)) {
    return {
      remainingMs: 0,
      isExpired: true,
      urgency: 'expired',
      label: 'Batas pesan berakhir',
    }
  }

  const remainingMs = deadlineMs - nowMs
  if (remainingMs <= 0) {
    return {
      remainingMs: 0,
      isExpired: true,
      urgency: 'expired',
      label: 'Batas pesan berakhir',
    }
  }

  const totalSeconds = Math.floor(remainingMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const urgency: OfferCountdownUrgency =
    remainingMs <= THREE_HOURS_MS ? 'critical' : remainingMs <= SIX_HOURS_MS ? 'soon' : 'normal'

  if (hours >= 24) {
    const days = Math.floor(hours / 24)
    const restHours = hours % 24
    return {
      remainingMs,
      isExpired: false,
      urgency,
      label: `${days}h ${restHours}j lagi`,
    }
  }

  if (hours >= 6) {
    return {
      remainingMs,
      isExpired: false,
      urgency,
      label: `${hours}j ${padTwoDigits(minutes)}m lagi`,
    }
  }

  return {
    remainingMs,
    isExpired: false,
    urgency,
    label: `${padTwoDigits(hours)}j ${padTwoDigits(minutes)}m ${padTwoDigits(seconds)}d`,
  }
}

export function formatPricePerKg(price: number): string {
  return `Rp ${rupiahFormatter.format(Math.round(price))}/kg`
}

export function formatPlainRupiah(price: number): string {
  return `Rp ${rupiahFormatter.format(Math.round(price))}`
}

export function formatWeightKg(weightKg: number): string {
  return `${weightFormatter.format(weightKg)} kg`
}

export function getDynamicPriceSummary(
  pricePerKg: number,
  rule?: DynamicPriceRule
): DynamicPriceSummary {
  if (!rule) {
    return {
      hasDynamicRule: false,
      hasDropped: false,
      originalPriceFormatted: null,
      scheduleHint: null,
    }
  }

  const hasDropped = pricePerKg < rule.startPrice
  const scheduleHint = `Turun ${formatPlainRupiah(rule.dropAmount)} / ${rule.dropIntervalHours} jam`

  return {
    hasDynamicRule: true,
    hasDropped,
    originalPriceFormatted: hasDropped ? formatPlainRupiah(rule.startPrice) : null,
    scheduleHint,
  }
}

export function formatNextPickupSlot(slots: ReadonlyArray<ScheduleSlot>): string {
  const nextSlot = slots.find((slot) => slot.isAvailable !== false) ?? slots[0]
  if (!nextSlot) {
    return 'Jadwal menyusul'
  }

  const parsedDate = new Date(`${nextSlot.date}T00:00:00`)
  const datePart = Number.isNaN(parsedDate.getTime())
    ? nextSlot.date
    : shortDateFormatter.format(parsedDate)
  const startTime = nextSlot.startTime.replace(':', '.')
  const endTime = nextSlot.endTime.replace(':', '.')

  return `${datePart}, ${startTime}-${endTime}`
}

export function formatFarmerDisplayName(farmerName: string): string {
  const trimmed = farmerName.trim()
  const parenIndex = trimmed.indexOf('(')
  if (parenIndex > 0) {
    return trimmed.slice(0, parenIndex).trim()
  }
  return trimmed
}

export function buildOfferDetailHref(offerId: string): string {
  const parsed = OfferIdSchema.safeParse(offerId.trim())
  if (!parsed.success) {
    return '/pasar'
  }
  return `/pasar/penawaran/${encodeURIComponent(parsed.data)}`
}

export function buildExpiringCatalogHref(location: SelectedLocation): string {
  const params = new URLSearchParams()
  params.set('sort', 'expiring')
  params.set('province', location.provinceId)
  if (location.regionId) {
    params.set('region', location.regionId)
  }
  return `/pasar?${params.toString()}`
}
