import { z } from 'zod'
import {
  CommodityConditionSchema,
  OfferSchema,
  OfferStatusSchema,
  ScheduleSlotSchema,
  type CommodityCondition,
  type Offer,
  type ScheduleSlot,
} from '@/types/api/offers'

const BackendSlotSchema = z.object({
  id: z.union([z.string(), z.number()]),
  starts_at: z.string(),
  ends_at: z.string(),
  active: z.boolean().optional(),
})

const BackendPhotoSchema = z.union([
  z.string(),
  z.object({
    url: z.string().optional(),
    path: z.string().optional(),
  }),
])

const RawOfferObjectSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    farmer_id: z.union([z.string(), z.number()]).optional(),
    farmerId: z.union([z.string(), z.number()]).optional(),
    farmer_name: z.string().optional(),
    farmerName: z.string().optional(),
    name: z.string().optional(),
    commodityName: z.string().optional(),
    commodity: z.string().nullable().optional(),
    category: z.string().optional(),
    condition: z.string().nullable().optional(),
    conditionNote: z.string().optional(),
    surplus_reason: z.string().nullable().optional(),
    surplusReason: z.string().optional(),
    harvest_date: z.string().nullable().optional(),
    harvestDate: z.string().optional(),
    stock_g: z.number().optional(),
    reserved_g: z.number().optional(),
    withheld_g: z.number().optional(),
    sold_g: z.number().optional(),
    availableStockKg: z.number().optional(),
    reservedStockKg: z.number().optional(),
    soldStockKg: z.number().optional(),
    catalog_price: z.number().optional(),
    price_per_kg: z.number().optional(),
    pricePerKg: z.number().optional(),
    closes_at: z.string().nullable().optional(),
    orderDeadline: z.string().optional(),
    area: z.string().nullable().optional(),
    pickupAddressArea: z.string().optional(),
    pickupAddressFull: z.string().optional(),
    latitude: z.union([z.number(), z.string()]).nullable().optional(),
    longitude: z.union([z.number(), z.string()]).nullable().optional(),
    slots: z.array(BackendSlotSchema).optional(),
    pickupScheduleSlots: z.array(ScheduleSlotSchema).optional(),
    photos: z.array(BackendPhotoSchema).optional(),
    status: z.string(),
    created_at: z.string().optional(),
    createdAt: z.string().optional(),
    updated_at: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .refine((data) => Boolean(data.name || data.commodityName), {
    message: 'Nama komoditas wajib ada',
  })

function normalizeCondition(raw: string | null | undefined): CommodityCondition {
  const parsed = CommodityConditionSchema.safeParse(raw)
  if (parsed.success) return parsed.data
  return 'surplus'
}

function normalizeStatus(raw: string): z.infer<typeof OfferStatusSchema> {
  const parsed = OfferStatusSchema.safeParse(raw)
  if (parsed.success) return parsed.data
  return 'active'
}

function normalizeSlot(raw: z.infer<typeof BackendSlotSchema>): ScheduleSlot {
  const start = raw.starts_at
  const end = raw.ends_at
  const date = start.slice(0, 10)
  const startTime = start.includes('T') ? start.slice(11, 16) : start.slice(11, 16) || '08:00'
  const endTime = end.includes('T') ? end.slice(11, 16) : end.slice(11, 16) || '17:00'
  return {
    id: String(raw.id),
    date,
    startTime,
    endTime,
    isAvailable: raw.active ?? true,
  }
}

function normalizePhotos(raw?: Array<z.infer<typeof BackendPhotoSchema>>): string[] {
  if (!raw) return []
  return raw
    .map((item) => {
      if (typeof item === 'string') return item
      return item.url ?? item.path ?? ''
    })
    .filter(Boolean)
}

function normalizeOfferPayload(raw: z.infer<typeof RawOfferObjectSchema>): Offer {
  const createdAt = raw.createdAt ?? raw.created_at ?? new Date().toISOString()
  const updatedAt = raw.updatedAt ?? raw.updated_at ?? createdAt
  const stockG = raw.stock_g ?? 0
  const reservedG = raw.reserved_g ?? 0
  const withheldG = raw.withheld_g ?? 0
  const soldG = raw.sold_g ?? 0
  const availableStockKg =
    raw.availableStockKg ?? Math.max(0, (stockG - reservedG - withheldG) / 1000)
  const reservedStockKg = raw.reservedStockKg ?? reservedG / 1000
  const soldStockKg = raw.soldStockKg ?? soldG / 1000
  const pricePerKg = raw.pricePerKg ?? raw.catalog_price ?? raw.price_per_kg ?? 1
  const lat = raw.latitude !== null && raw.latitude !== undefined ? Number(raw.latitude) : undefined
  const lng =
    raw.longitude !== null && raw.longitude !== undefined ? Number(raw.longitude) : undefined

  return OfferSchema.parse({
    id: String(raw.id),
    farmerId: String(raw.farmerId ?? raw.farmer_id ?? '0'),
    farmerName: raw.farmerName ?? raw.farmer_name ?? 'Petani Mitra',
    commodityName: raw.commodityName ?? raw.name ?? '',
    category: raw.category ?? raw.commodity ?? 'lainnya',
    condition: normalizeCondition(raw.condition),
    conditionNote:
      raw.conditionNote ??
      (raw.condition && !CommodityConditionSchema.safeParse(raw.condition).success
        ? raw.condition
        : undefined),
    surplusReason: raw.surplusReason ?? raw.surplus_reason ?? undefined,
    harvestDate: raw.harvestDate ?? raw.harvest_date ?? createdAt.slice(0, 10),
    availableStockKg,
    reservedStockKg,
    soldStockKg,
    pricePerKg: pricePerKg > 0 ? pricePerKg : 1,
    orderDeadline: raw.orderDeadline ?? raw.closes_at ?? updatedAt,
    pickupAddressArea: raw.pickupAddressArea ?? raw.area ?? '',
    pickupAddressFull: raw.pickupAddressFull,
    latitude: Number.isFinite(lat) ? lat : undefined,
    longitude: Number.isFinite(lng) ? lng : undefined,
    pickupScheduleSlots: raw.pickupScheduleSlots ?? raw.slots?.map(normalizeSlot) ?? [],
    photos: normalizePhotos(raw.photos),
    status: normalizeStatus(raw.status),
    createdAt,
    updatedAt,
  })
}

const DirectOfferSchema = z.union([
  OfferSchema,
  RawOfferObjectSchema.transform(normalizeOfferPayload),
])

export const OfferListResponseSchema: z.ZodType<Offer[]> = z.union([
  z.array(DirectOfferSchema),
  z
    .object({
      data: z.array(DirectOfferSchema),
    })
    .transform((page) => page.data),
])

export const OfferDetailResponseSchema: z.ZodType<Offer> = z.union([
  DirectOfferSchema,
  z
    .object({
      offer: DirectOfferSchema,
    })
    .transform((envelope) => envelope.offer),
])
