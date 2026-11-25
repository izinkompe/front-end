import { z } from 'zod'
import type { SelectedLocation } from '@/lib/data/regions'

export const BuyerSearchModeSchema = z.enum(['katalog', 'peta', 'segera-ditutup'])
export type BuyerSearchMode = z.infer<typeof BuyerSearchModeSchema>

export const BuyerCategoryFilterSchema = z.enum([
  'semua',
  'sayuran',
  'buah',
  'padi-biji',
  'rempah-umbi',
])
export type BuyerCategoryFilter = z.infer<typeof BuyerCategoryFilterSchema>

export const BuyerRadiusOptionSchema = z.enum(['5', '10', '25', '50'])
export type BuyerRadiusOption = z.infer<typeof BuyerRadiusOptionSchema>

export const BuyerMinStockOptionSchema = z.enum(['semua', '10', '25', '50', '100'])
export type BuyerMinStockOption = z.infer<typeof BuyerMinStockOptionSchema>

export const BuyerDeadlineOptionSchema = z.enum(['semua', '3h', '6h', 'today'])
export type BuyerDeadlineOption = z.infer<typeof BuyerDeadlineOptionSchema>

export const BuyerPickupDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .nullable()

export const BuyerSearchParamsInputSchema = z.object({
  mode: BuyerSearchModeSchema,
  query: z.string().max(100),
  category: BuyerCategoryFilterSchema,
  radiusKm: BuyerRadiusOptionSchema,
  minStockKg: BuyerMinStockOptionSchema,
  deadlineWindow: BuyerDeadlineOptionSchema,
  pickupDate: BuyerPickupDateSchema,
  provinceId: z.string().min(1).max(64),
  regionId: z.string().min(1).max(64).nullable(),
})

export interface BuyerSearchFormState {
  mode: BuyerSearchMode
  query: string
  category: BuyerCategoryFilter
  radiusKm: BuyerRadiusOption
  minStockKg: BuyerMinStockOption
  deadlineWindow: BuyerDeadlineOption
  pickupDate: string | null
  location: SelectedLocation
}

export const categoryFilterOptions: ReadonlyArray<{ value: BuyerCategoryFilter; label: string }> = [
  { value: 'semua', label: 'Semua kategori' },
  { value: 'sayuran', label: 'Sayuran' },
  { value: 'buah', label: 'Buah' },
  { value: 'padi-biji', label: 'Padi & Biji-bijian' },
  { value: 'rempah-umbi', label: 'Rempah & Umbi' },
]

export const radiusOptions: ReadonlyArray<{ value: BuyerRadiusOption; label: string }> = [
  { value: '5', label: 'Radius 5 km' },
  { value: '10', label: 'Radius 10 km' },
  { value: '25', label: 'Radius 25 km' },
  { value: '50', label: 'Radius 50 km' },
]

export const minStockOptions: ReadonlyArray<{ value: BuyerMinStockOption; label: string }> = [
  { value: 'semua', label: 'Semua stok' },
  { value: '10', label: 'Min. 10 kg' },
  { value: '25', label: 'Min. 25 kg' },
  { value: '50', label: 'Min. 50 kg' },
  { value: '100', label: 'Min. 100 kg' },
]

export const deadlineOptions: ReadonlyArray<{ value: BuyerDeadlineOption; label: string }> = [
  { value: 'semua', label: 'Semua batas waktu' },
  { value: '3h', label: 'Kurang dari 3 jam' },
  { value: '6h', label: 'Kurang dari 6 jam' },
  { value: 'today', label: 'Ditutup hari ini' },
]

export const buyerHeroCategories: ReadonlyArray<{ href: string; label: string }> = [
  { href: '/pasar', label: 'Semua Komoditas' },
  { href: '/pasar/sayuran', label: 'Sayuran' },
  { href: '/pasar/buah', label: 'Buah' },
  { href: '/pasar/padi-biji', label: 'Padi & Biji-bijian' },
  { href: '/pasar/rempah-umbi', label: 'Rempah & Umbi' },
]

export function formatPickupDateIso(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatPickupDateLabel(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
  }).format(date)
}

export function buildBuyerSearchHref(input: BuyerSearchFormState): string {
  const parsed = BuyerSearchParamsInputSchema.safeParse({
    mode: input.mode,
    query: input.query.trim().slice(0, 100),
    category: input.category,
    radiusKm: input.radiusKm,
    minStockKg: input.minStockKg,
    deadlineWindow: input.deadlineWindow,
    pickupDate: input.pickupDate,
    provinceId: input.location.provinceId,
    regionId: input.location.regionId,
  })

  if (!parsed.success) {
    return '/pasar'
  }

  const {
    mode,
    query,
    category,
    radiusKm,
    minStockKg,
    deadlineWindow,
    pickupDate,
    provinceId,
    regionId,
  } = parsed.data
  const params = new URLSearchParams()

  if (query.length > 0) {
    params.set('q', query)
  }

  if (mode === 'katalog') {
    if (category !== 'semua') {
      params.set('category', category)
    }
    if (pickupDate) {
      params.set('pickup', pickupDate)
    }
  } else if (mode === 'peta') {
    params.set('radius', radiusKm)
    if (minStockKg !== 'semua') {
      params.set('minStock', minStockKg)
    }
  } else {
    if (deadlineWindow !== 'semua') {
      params.set('deadline', deadlineWindow)
    }
    if (pickupDate) {
      params.set('pickup', pickupDate)
    }
  }

  params.set('province', provinceId)

  if (regionId) {
    params.set('region', regionId)
  }

  if (mode === 'peta') {
    params.set('view', 'map')
  } else if (mode === 'segera-ditutup') {
    params.set('sort', 'expiring')
  } else {
    params.set('view', 'list')
  }

  const search = params.toString()
  return search ? `/pasar?${search}` : '/pasar'
}
