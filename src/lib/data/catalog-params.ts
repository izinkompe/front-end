import { z } from 'zod'
import {
  BuyerCategoryFilterSchema,
  BuyerDeadlineOptionSchema,
  BuyerPickupDateSchema,
  BuyerRadiusOptionSchema,
  deadlineOptions,
  formatPickupDateLabel,
  type BuyerCategoryFilter,
  type BuyerDeadlineOption,
  type BuyerRadiusOption,
} from '@/components/home/hero-search-params'
import { formatPlainRupiah, getCommodityConditionMeta } from '@/components/home/offer-card-helpers'
import { getCategoryMeta, type BuyerCategorySlug } from '@/lib/data/categories'
import { provinceGroups, type SelectedLocation } from '@/lib/data/regions'
import { CommodityConditionSchema, type CommodityCondition } from '@/types/api/offers'

export const CatalogSortOptionSchema = z.enum([
  'nearest',
  'expiring',
  'price_asc',
  'stock_desc',
  'newest',
])
export type CatalogSortOption = z.infer<typeof CatalogSortOptionSchema>

export const CatalogViewModeSchema = z.enum(['row', 'grid'])
export type CatalogViewMode = z.infer<typeof CatalogViewModeSchema>

const SafeSlugSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9-]+$/)

export interface CatalogFilterState {
  q: string
  category: BuyerCategoryFilter
  conditions: CommodityCondition[]
  minPrice: number | null
  maxPrice: number | null
  minStockKg: number | null
  radiusKm: BuyerRadiusOption | null
  pickupDate: string | null
  deadlineWindow: BuyerDeadlineOption
  dynamicOnly: boolean
  provinceId: string | null
  regionId: string | null
  sort: CatalogSortOption
  view: CatalogViewMode
}

export interface ActiveFilterChip {
  key: string
  label: string
  clear: (state: CatalogFilterState) => CatalogFilterState
}

export const catalogSortOptions: ReadonlyArray<{ value: CatalogSortOption; label: string }> = [
  { value: 'nearest', label: 'Terdekat' },
  { value: 'expiring', label: 'Segera ditutup' },
  { value: 'price_asc', label: 'Harga termurah' },
  { value: 'stock_desc', label: 'Stok terbanyak' },
  { value: 'newest', label: 'Panen terbaru' },
]

export const catalogConditionOptions: ReadonlyArray<{
  value: CommodityCondition
  label: string
  shortLabel: string
}> = [
  { value: 'ripe_urgent', label: 'Matang segera olah', shortLabel: 'Segera olah' },
  { value: 'grade_b', label: 'Grade B layak olah', shortLabel: 'Grade B' },
  { value: 'surplus', label: 'Panen surplus', shortLabel: 'Surplus' },
  { value: 'imperfect_shape', label: 'Bentuk tidak seragam', shortLabel: 'Tak seragam' },
]

export const catalogMinStockOptions: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'semua', label: 'Semua stok' },
  { value: '10', label: 'Min. 10 kg' },
  { value: '25', label: 'Min. 25 kg' },
  { value: '50', label: 'Min. 50 kg' },
  { value: '100', label: 'Min. 100 kg' },
]

export const catalogRadiusOptions: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'semua', label: 'Semua jarak' },
  { value: '5', label: 'Dalam 5 km' },
  { value: '10', label: 'Dalam 10 km' },
  { value: '25', label: 'Dalam 25 km' },
  { value: '50', label: 'Dalam 50 km' },
]

function readFirstParam(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value[0]
  return undefined
}

function readAllParams(value: string | string[] | undefined): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value
  return []
}

function parsePositiveNumberParam(raw: string | undefined, max: number): number | null {
  if (!raw) return null
  const parsed = Number(raw.trim())
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > max) {
    return null
  }
  return Math.round(parsed * 1000) / 1000
}

function parseConditionsParam(raw: string | string[] | undefined): CommodityCondition[] {
  const tokens = readAllParams(raw)
    .flatMap((item) => item.split(','))
    .map((item) => item.trim())
    .filter(Boolean)

  const seen = new Set<CommodityCondition>()
  for (const token of tokens) {
    const parsed = CommodityConditionSchema.safeParse(token)
    if (parsed.success) {
      seen.add(parsed.data)
    }
  }
  return Array.from(seen)
}

export function createDefaultCatalogState(fixedCategory?: BuyerCategorySlug): CatalogFilterState {
  return {
    q: '',
    category: fixedCategory ?? 'semua',
    conditions: [],
    minPrice: null,
    maxPrice: null,
    minStockKg: null,
    radiusKm: null,
    pickupDate: null,
    deadlineWindow: 'semua',
    dynamicOnly: false,
    provinceId: null,
    regionId: null,
    sort: 'nearest',
    view: 'row',
  }
}

export function parseCatalogSearchParams(
  rawParams: Record<string, string | string[] | undefined>,
  fixedCategory?: BuyerCategorySlug
): CatalogFilterState {
  const defaults = createDefaultCatalogState(fixedCategory)

  const rawQuery = readFirstParam(rawParams.q)
  const q = rawQuery ? rawQuery.trim().slice(0, 100) : ''

  const rawCategory = readFirstParam(rawParams.category)
  const parsedCategory = BuyerCategoryFilterSchema.safeParse(rawCategory)
  const category =
    fixedCategory ?? (parsedCategory.success ? parsedCategory.data : defaults.category)

  const conditions = parseConditionsParam(rawParams.condition)
  const minPrice = parsePositiveNumberParam(readFirstParam(rawParams.minPrice), 10_000_000)
  const maxPrice = parsePositiveNumberParam(readFirstParam(rawParams.maxPrice), 10_000_000)
  const minStockKg = parsePositiveNumberParam(readFirstParam(rawParams.minStock), 100_000)

  const rawRadius = readFirstParam(rawParams.radius)
  const parsedRadius = BuyerRadiusOptionSchema.safeParse(rawRadius)
  const radiusKm = parsedRadius.success ? parsedRadius.data : null

  const rawPickup = readFirstParam(rawParams.pickup)
  const parsedPickup = BuyerPickupDateSchema.safeParse(rawPickup ?? null)
  const pickupDate = parsedPickup.success ? parsedPickup.data : null

  const rawDeadline = readFirstParam(rawParams.deadline)
  const parsedDeadline = BuyerDeadlineOptionSchema.safeParse(rawDeadline)
  const deadlineWindow = parsedDeadline.success ? parsedDeadline.data : 'semua'

  const rawDynamic = readFirstParam(rawParams.dynamicOnly)
  const dynamicOnly = rawDynamic === 'true' || rawDynamic === '1'

  const rawProvince = readFirstParam(rawParams.province)
  const parsedProvince = SafeSlugSchema.safeParse(rawProvince)
  const provinceId = parsedProvince.success ? parsedProvince.data : null

  const rawRegion = readFirstParam(rawParams.region)
  const parsedRegion = SafeSlugSchema.safeParse(rawRegion)
  const regionId = provinceId && parsedRegion.success ? parsedRegion.data : null

  const rawSort = readFirstParam(rawParams.sort)
  const parsedSort = CatalogSortOptionSchema.safeParse(rawSort)
  const sort = parsedSort.success ? parsedSort.data : 'nearest'

  const rawView = readFirstParam(rawParams.view)
  const parsedView = CatalogViewModeSchema.safeParse(rawView)
  const view = parsedView.success ? parsedView.data : 'row'

  return {
    q,
    category,
    conditions,
    minPrice,
    maxPrice,
    minStockKg,
    radiusKm,
    pickupDate,
    deadlineWindow,
    dynamicOnly,
    provinceId,
    regionId,
    sort,
    view,
  }
}

export function buildCatalogHref(
  state: CatalogFilterState,
  fixedCategory?: BuyerCategorySlug
): string {
  const basePath = fixedCategory ? `/pasar/${fixedCategory}` : '/pasar'
  const params = new URLSearchParams()

  const trimmedQuery = state.q.trim().slice(0, 100)
  if (trimmedQuery.length > 0) {
    params.set('q', trimmedQuery)
  }

  if (!fixedCategory && state.category !== 'semua') {
    params.set('category', state.category)
  }

  if (state.conditions.length > 0) {
    params.set('condition', state.conditions.join(','))
  }

  if (state.minPrice !== null && state.minPrice > 0) {
    params.set('minPrice', String(Math.round(state.minPrice)))
  }

  if (state.maxPrice !== null && state.maxPrice > 0) {
    params.set('maxPrice', String(Math.round(state.maxPrice)))
  }

  if (state.minStockKg !== null && state.minStockKg > 0) {
    params.set('minStock', String(state.minStockKg))
  }

  if (state.radiusKm !== null) {
    params.set('radius', state.radiusKm)
  }

  if (state.pickupDate) {
    params.set('pickup', state.pickupDate)
  }

  if (state.deadlineWindow !== 'semua') {
    params.set('deadline', state.deadlineWindow)
  }

  if (state.dynamicOnly) {
    params.set('dynamicOnly', 'true')
  }

  if (state.provinceId) {
    params.set('province', state.provinceId)
    if (state.regionId) {
      params.set('region', state.regionId)
    }
  }

  if (state.sort !== 'nearest') {
    params.set('sort', state.sort)
  }

  if (state.view !== 'row') {
    params.set('view', state.view)
  }

  const search = params.toString()
  return search ? `${basePath}?${search}` : basePath
}

export function resolveSelectedLocationFromParams(
  provinceId: string | null,
  regionId: string | null
): SelectedLocation | null {
  if (!provinceId) return null
  const province = provinceGroups.find((item) => item.id === provinceId)
  if (!province) return null

  if (regionId) {
    const region = province.regions.find((item) => item.id === regionId)
    if (region) {
      return {
        provinceId: province.id,
        regionId: region.id,
        label: region.name,
      }
    }
  }

  return {
    provinceId: province.id,
    regionId: null,
    label: province.name,
  }
}

export function getActiveFilterChips(
  state: CatalogFilterState,
  fixedCategory?: BuyerCategorySlug
): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = []

  if (state.q.trim().length > 0) {
    chips.push({
      key: 'q',
      label: `Cari: ${state.q.trim()}`,
      clear: (current) => ({ ...current, q: '' }),
    })
  }

  if (!fixedCategory && state.category !== 'semua') {
    const meta = getCategoryMeta(state.category)
    chips.push({
      key: 'category',
      label: `Kategori: ${meta.label}`,
      clear: (current) => ({ ...current, category: 'semua' }),
    })
  }

  for (const condition of state.conditions) {
    const meta = getCommodityConditionMeta(condition)
    chips.push({
      key: `condition-${condition}`,
      label: meta.label,
      clear: (current) => ({
        ...current,
        conditions: current.conditions.filter((item) => item !== condition),
      }),
    })
  }

  if (state.minPrice !== null || state.maxPrice !== null) {
    const priceLabel =
      state.minPrice !== null && state.maxPrice !== null
        ? `Harga: ${formatPlainRupiah(state.minPrice)} s.d. ${formatPlainRupiah(state.maxPrice)}/kg`
        : state.minPrice !== null
          ? `Harga min. ${formatPlainRupiah(state.minPrice)}/kg`
          : `Harga maks. ${formatPlainRupiah(state.maxPrice as number)}/kg`

    chips.push({
      key: 'price',
      label: priceLabel,
      clear: (current) => ({ ...current, minPrice: null, maxPrice: null }),
    })
  }

  if (state.minStockKg !== null) {
    chips.push({
      key: 'minStock',
      label: `Stok min. ${state.minStockKg} kg`,
      clear: (current) => ({ ...current, minStockKg: null }),
    })
  }

  if (state.radiusKm !== null) {
    chips.push({
      key: 'radius',
      label: `Dalam ${state.radiusKm} km`,
      clear: (current) => ({ ...current, radiusKm: null }),
    })
  }

  if (state.pickupDate) {
    const parsedDate = new Date(`${state.pickupDate}T00:00:00`)
    const dateLabel = Number.isNaN(parsedDate.getTime())
      ? state.pickupDate
      : formatPickupDateLabel(parsedDate)
    chips.push({
      key: 'pickup',
      label: `Ambil: ${dateLabel}`,
      clear: (current) => ({ ...current, pickupDate: null }),
    })
  }

  if (state.deadlineWindow !== 'semua') {
    const deadlineMeta = deadlineOptions.find((option) => option.value === state.deadlineWindow)
    chips.push({
      key: 'deadline',
      label: deadlineMeta ? deadlineMeta.label : state.deadlineWindow,
      clear: (current) => ({ ...current, deadlineWindow: 'semua' }),
    })
  }

  if (state.dynamicOnly) {
    chips.push({
      key: 'dynamicOnly',
      label: 'Harga turun terjadwal',
      clear: (current) => ({ ...current, dynamicOnly: false }),
    })
  }

  return chips
}

export function countActiveCatalogFilters(
  state: CatalogFilterState,
  fixedCategory?: BuyerCategorySlug
): number {
  return getActiveFilterChips(state, fixedCategory).length
}

export function clearAllCatalogFilters(
  state: CatalogFilterState,
  fixedCategory?: BuyerCategorySlug
): CatalogFilterState {
  return {
    ...createDefaultCatalogState(fixedCategory),
    provinceId: state.provinceId,
    regionId: state.regionId,
    sort: state.sort,
    view: state.view,
  }
}
