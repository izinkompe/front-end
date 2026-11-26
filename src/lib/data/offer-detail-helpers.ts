import {
  calculateStraightLineDistanceKm,
  formatPlainRupiah,
  formatWeightKg,
  getOfferCountdownState,
  type Coordinates,
} from '@/components/home/offer-card-helpers'
import { matchesOfferCategory } from '@/lib/data/categories'
import type { DynamicPriceRule, Offer, ScheduleSlot } from '@/types/api/offers'

export interface DynamicPriceStage {
  stepNumber: number
  hoursFromStart: number
  pricePerKg: number
  priceFormatted: string
  status: 'passed' | 'current' | 'upcoming'
}

export interface RelatedOfferItem {
  offer: Offer
  distanceKm: number | null
}

const fullDateTimeFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const slotDateFormatter = new Intl.DateTimeFormat('id-ID', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

const CANDIDATE_WEIGHT_PRESETS = [1, 5, 10, 25, 50]

export function isSafeOfferPhotoUrl(candidate: string): string | null {
  const trimmed = candidate.trim()
  if (!trimmed) return null

  if (/^\/images\/[a-zA-Z0-9/_-]+\.(?:webp|png|jpe?g|avif)$/.test(trimmed)) {
    return trimmed
  }

  try {
    const parsed = new URL(trimmed)
    if (
      parsed.protocol === 'https:' &&
      parsed.hostname === 'images.unsplash.com' &&
      parsed.pathname.startsWith('/photo-')
    ) {
      return parsed.toString()
    }
  } catch {
    return null
  }

  return null
}

export function getSafeOfferPhotoUrls(photos: ReadonlyArray<string>): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const photo of photos) {
    const safeUrl = isSafeOfferPhotoUrl(photo)
    if (safeUrl && !seen.has(safeUrl)) {
      seen.add(safeUrl)
      result.push(safeUrl)
    }
  }

  return result
}

export function parseWeightInputKg(rawValue: string): number | null {
  const normalized = rawValue.trim().replace(',', '.')
  if (!normalized) return null
  if (!/^\d+(?:\.\d{1,3})?$/.test(normalized)) return null

  const parsed = Number(normalized)
  if (!Number.isFinite(parsed)) return null

  return Math.round(parsed * 1000) / 1000
}

export function validateOrderWeightKg(
  weightKg: number | null,
  availableStockKg: number
): string | null {
  if (weightKg === null) {
    return 'Masukkan berat pesanan dalam satuan kg (maksimal 3 angka di belakang koma).'
  }
  if (weightKg < 0.001) {
    return 'Berat pesanan minimal 0,001 kg.'
  }
  if (weightKg > availableStockKg) {
    return `Berat pesanan melebihi stok tersedia (${formatWeightKg(availableStockKg)}).`
  }
  return null
}

export function getWeightPresetsKg(availableStockKg: number): number[] {
  if (!Number.isFinite(availableStockKg) || availableStockKg <= 0) {
    return []
  }

  const presets = CANDIDATE_WEIGHT_PRESETS.filter((preset) => preset <= availableStockKg)
  if (presets.length > 0) {
    return presets.slice(0, 4)
  }

  const roundedAvailable = Math.round(availableStockKg * 1000) / 1000
  return roundedAvailable >= 0.001 ? [roundedAvailable] : []
}

export function getDynamicPriceScheduleSteps(
  currentPricePerKg: number,
  rule?: DynamicPriceRule
): DynamicPriceStage[] {
  if (!rule) return []
  if (rule.dropAmount <= 0 || rule.dropIntervalHours <= 0) return []

  const stages: DynamicPriceStage[] = []
  let stagePrice = rule.startPrice
  let stepIndex = 0
  const maxIterations = 24

  while (stepIndex < maxIterations) {
    const clampedPrice = Math.max(rule.minPrice, stagePrice)
    const status: DynamicPriceStage['status'] =
      clampedPrice > currentPricePerKg
        ? 'passed'
        : clampedPrice === currentPricePerKg
          ? 'current'
          : 'upcoming'

    stages.push({
      stepNumber: stepIndex + 1,
      hoursFromStart: stepIndex * rule.dropIntervalHours,
      pricePerKg: clampedPrice,
      priceFormatted: formatPlainRupiah(clampedPrice),
      status,
    })

    if (clampedPrice <= rule.minPrice) break
    stagePrice -= rule.dropAmount
    stepIndex += 1
  }

  return stages
}

export function formatDateTimeId(isoString: string): string {
  const timestamp = Date.parse(isoString)
  if (!Number.isFinite(timestamp)) return isoString
  return fullDateTimeFormatter.format(new Date(timestamp)).replace('.', ':')
}

export function formatHarvestAgeLabel(harvestIso: string, nowMs: number | null): string {
  const harvestMs = Date.parse(harvestIso)
  if (!Number.isFinite(harvestMs)) return 'Jadwal panen tersedia'
  if (nowMs === null) return formatDateTimeId(harvestIso)

  const diffMs = Math.max(0, nowMs - harvestMs)
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000))

  if (diffHours < 1) return 'Dipanen kurang dari 1 jam lalu'
  if (diffHours < 24) return `Dipanen ${diffHours} jam lalu`

  const diffDays = Math.floor(diffHours / 24)
  return `Dipanen ${diffDays} hari lalu`
}

export function formatPickupSlotLabel(slot: ScheduleSlot): string {
  const parsedDate = new Date(`${slot.date}T00:00:00`)
  const dateLabel = Number.isNaN(parsedDate.getTime())
    ? slot.date
    : slotDateFormatter.format(parsedDate)
  const start = slot.startTime.replace(':', '.')
  const end = slot.endTime.replace(':', '.')

  return `${dateLabel}, ${start}–${end}`
}

export function getRelatedOffers(
  currentOffer: Offer,
  allOffers: ReadonlyArray<Offer>,
  referenceCoordinates: Coordinates | null,
  nowMs: number | null,
  limit = 8
): RelatedOfferItem[] {
  const candidates = allOffers.filter((offer) => {
    if (offer.id === currentOffer.id) return false
    if (offer.status !== 'active' || offer.availableStockKg <= 0) return false
    if (nowMs !== null && getOfferCountdownState(offer.orderDeadline, nowMs).isExpired) {
      return false
    }
    return true
  })

  const scored = candidates.map((offer) => {
    const hasCoords = typeof offer.latitude === 'number' && typeof offer.longitude === 'number'
    const distanceKm =
      referenceCoordinates && hasCoords
        ? calculateStraightLineDistanceKm(referenceCoordinates, {
            lat: offer.latitude as number,
            lng: offer.longitude as number,
          })
        : null
    const sameCategory = matchesOfferCategory(offer.category, currentOffer.category)

    return {
      offer,
      distanceKm,
      sameCategory,
    }
  })

  scored.sort((a, b) => {
    if (a.sameCategory !== b.sameCategory) {
      return a.sameCategory ? -1 : 1
    }
    if (a.distanceKm !== null && b.distanceKm !== null && a.distanceKm !== b.distanceKm) {
      return a.distanceKm - b.distanceKm
    }
    if (a.distanceKm !== null && b.distanceKm === null) return -1
    if (a.distanceKm === null && b.distanceKm !== null) return 1
    return Date.parse(a.offer.orderDeadline) - Date.parse(b.offer.orderDeadline)
  })

  return scored.slice(0, limit).map(({ offer, distanceKm }) => ({
    offer,
    distanceKm,
  }))
}
