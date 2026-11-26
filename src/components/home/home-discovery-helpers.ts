import { z } from 'zod'
import { provinceGroups, type SelectedLocation } from '@/lib/data/regions'
import type { NeedRequest, NeedRequestStatus } from '@/types/api/needs-board'
import { calculateStraightLineDistanceKm, getLocationCoordinates } from './offer-card-helpers'

export interface NearbyHarvestHub {
  id: string
  provinceId: string
  provinceName: string
  name: string
  count: number
  distanceKm: number | null
  isSelectedLocation: boolean
  highlights: string
  href: string
}

export interface NeedFulfillmentSummary {
  offeredKg: number
  remainingKg: number
  responseCount: number
  percent: number
}

export interface NeedStatusMeta {
  label: string
  isOpenForResponses: boolean
}

const SafeSlugSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9-]+$/)

const SafeNeedIdSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-zA-Z0-9_-]+$/)

const regionCommodityHighlights: Record<string, string> = {
  'bandung-barat': 'Tomat ceri, mangga, jagung pipil',
  'kab-bandung': 'Buncis, kol hijau, kentang granola',
  garut: 'Wortel brastagi, alpukat mentega, cabai',
  cianjur: 'Beras medium, ubi cilembu, sayuran daun',
  bogor: 'Sayuran segar, ubi, buah kebun lokal',
  subang: 'Nanas madu, kacang tanah, mangga',
  sukabumi: 'Pisang, umbi-umbian, sayuran bukit',
  majalengka: 'Bawang merah, kedelai lokal, mangga',
  magelang: 'Cabai, sawi, beras lokal',
  wonosobo: 'Kentang dieng, kubis, carica',
  boyolali: 'Sayuran dataran tinggi, jagung, kedelai',
  brebes: 'Bawang merah, cabai merah, beras',
  'malang-batu': 'Apel, wortel, kentang, jeruk',
  sleman: 'Salak pondoh, beras, sayuran segar',
  tabanan: 'Beras organik, sayuran bukit, rempah',
  karo: 'Jeruk berastagi, wortel, kol, kentang',
}

const defaultRegionHighlight = 'Sayuran segar, buah kebun, dan palawija'

const shortDateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const needStatusLabels: Record<NeedRequestStatus, NeedStatusMeta> = {
  open: { label: 'Menunggu pasokan', isOpenForResponses: true },
  partially_fulfilled: { label: 'Sebagian ditanggapi', isOpenForResponses: true },
  fulfilled: { label: 'Terpenuhi', isOpenForResponses: false },
  closed: { label: 'Ditutup', isOpenForResponses: false },
  expired: { label: 'Kedaluwarsa', isOpenForResponses: false },
}

export function buildRegionMapHref(provinceId: string, regionId: string): string {
  const parsedProvince = SafeSlugSchema.safeParse(provinceId.trim())
  const parsedRegion = SafeSlugSchema.safeParse(regionId.trim())
  if (!parsedProvince.success || !parsedRegion.success) {
    return '/pasar?view=map'
  }

  const params = new URLSearchParams()
  params.set('province', parsedProvince.data)
  params.set('region', parsedRegion.data)
  params.set('view', 'map')
  return `/pasar?${params.toString()}`
}

export function buildProvinceMapHref(location: SelectedLocation): string {
  const parsedProvince = SafeSlugSchema.safeParse(location.provinceId.trim())
  if (!parsedProvince.success) {
    return '/pasar?view=map'
  }

  const params = new URLSearchParams()
  params.set('province', parsedProvince.data)
  if (location.regionId) {
    const parsedRegion = SafeSlugSchema.safeParse(location.regionId.trim())
    if (parsedRegion.success) {
      params.set('region', parsedRegion.data)
    }
  }
  params.set('view', 'map')
  return `/pasar?${params.toString()}`
}

export function buildNeedDetailHref(needId: string): string {
  const parsed = SafeNeedIdSchema.safeParse(needId.trim())
  if (!parsed.success) {
    return '/papan-kebutuhan'
  }
  return `/papan-kebutuhan?request=${encodeURIComponent(parsed.data)}`
}

export function getNearbyHarvestHubs(location: SelectedLocation, limit = 6): NearbyHarvestHub[] {
  const referenceCoordinates = getLocationCoordinates(location)
  const targetLimit = Math.max(1, Math.min(limit, 12))

  const activeProvince =
    provinceGroups.find((province) => province.id === location.provinceId) ?? provinceGroups[0]

  function mapRegion(
    provinceId: string,
    provinceName: string,
    region: (typeof activeProvince.regions)[number]
  ): NearbyHarvestHub {
    const distanceKm = referenceCoordinates
      ? calculateStraightLineDistanceKm(referenceCoordinates, {
          lat: region.lat,
          lng: region.lng,
        })
      : null

    return {
      id: region.id,
      provinceId,
      provinceName,
      name: region.name,
      count: region.count,
      distanceKm,
      isSelectedLocation: provinceId === location.provinceId && region.id === location.regionId,
      highlights: regionCommodityHighlights[region.id] ?? defaultRegionHighlight,
      href: buildRegionMapHref(provinceId, region.id),
    }
  }

  const sortHubs = (a: NearbyHarvestHub, b: NearbyHarvestHub) => {
    if (a.isSelectedLocation !== b.isSelectedLocation) {
      return a.isSelectedLocation ? -1 : 1
    }
    const aDist = a.distanceKm ?? Number.POSITIVE_INFINITY
    const bDist = b.distanceKm ?? Number.POSITIVE_INFINITY
    if (aDist !== bDist) {
      return aDist - bDist
    }
    return b.count - a.count
  }

  const primaryHubs = activeProvince.regions
    .map((region) => mapRegion(activeProvince.id, activeProvince.name, region))
    .sort(sortHubs)

  if (primaryHubs.length >= targetLimit) {
    return primaryHubs.slice(0, targetLimit)
  }

  const supplementalHubs = provinceGroups
    .filter((province) => province.id !== activeProvince.id)
    .flatMap((province) =>
      province.regions.map((region) => mapRegion(province.id, province.name, region))
    )
    .sort(sortHubs)

  return [...primaryHubs, ...supplementalHubs].slice(0, targetLimit)
}

export function getNeedFulfillmentSummary(need: NeedRequest): NeedFulfillmentSummary {
  const responses = need.responses ?? []
  const rawOfferedKg = responses.reduce((sum, item) => sum + item.offeredQuantityKg, 0)
  const offeredKg = Math.round(rawOfferedKg * 1000) / 1000
  const remainingKg = Math.max(0, Math.round((need.neededQuantityKg - offeredKg) * 1000) / 1000)
  const rawPercent =
    need.neededQuantityKg > 0 ? Math.round((offeredKg / need.neededQuantityKg) * 100) : 0
  const percent = Math.max(0, Math.min(100, rawPercent))

  return {
    offeredKg,
    remainingKg,
    responseCount: responses.length,
    percent,
  }
}

export function getNeedStatusMeta(status: NeedRequestStatus): NeedStatusMeta {
  return needStatusLabels[status]
}

export function formatTargetDateLabel(dateIso: string): string {
  const parsed = new Date(`${dateIso}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return dateIso
  }
  return shortDateFormatter.format(parsed)
}
