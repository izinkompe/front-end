import { z } from 'zod'
import { CommodityCategorySchema, FarmerBankAccountSchema } from './auth'
import { CommodityConditionSchema, DynamicPriceRuleSchema, ScheduleSlotSchema } from './offers'

const StoreImageSchema = z
  .string()
  .max(1_450_000, 'Ukuran gambar maksimal 1 MB')
  .regex(/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/, 'Format gambar tidak valid')

export const FarmerStoreSettingsSchema = z.object({
  farmerId: z.string(),
  storeName: z.string().trim().min(3).max(100),
  description: z.string().trim().max(500),
  publicPickupNotes: z.string().trim().max(240),
  primaryCommodities: z.array(CommodityCategorySchema).max(5),
  featuredOfferIds: z.array(z.string()).max(6).optional(),
  logoImage: StoreImageSchema.optional(),
  coverImage: StoreImageSchema.optional(),
  updatedAt: z.iso.datetime(),
})
export type FarmerStoreSettings = z.infer<typeof FarmerStoreSettingsSchema>

export const UpdateFarmerStoreSettingsRequestSchema = z.object({
  storeName: z.string().trim().min(3, 'Nama toko minimal 3 karakter').max(100),
  description: z.string().trim().max(500, 'Deskripsi toko maksimal 500 karakter'),
  publicPickupNotes: z.string().trim().max(240, 'Catatan pengambilan maksimal 240 karakter'),
  primaryCommodities: z.array(CommodityCategorySchema).max(5),
  logoImage: StoreImageSchema.nullable().optional(),
  coverImage: StoreImageSchema.nullable().optional(),
})
export type UpdateFarmerStoreSettingsRequest = z.infer<
  typeof UpdateFarmerStoreSettingsRequestSchema
>

export const UpdateFarmerBankAccountRequestSchema = FarmerBankAccountSchema
export type UpdateFarmerBankAccountRequest = z.infer<typeof UpdateFarmerBankAccountRequestSchema>

export const ToggleFeaturedOfferRequestSchema = z.object({
  offerId: z.string().trim().min(1),
  featured: z.boolean(),
})
export type ToggleFeaturedOfferRequest = z.infer<typeof ToggleFeaturedOfferRequestSchema>

export const ReplyFarmerReviewRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(3, 'Balasan minimal 3 karakter')
    .max(500, 'Balasan maksimal 500 karakter'),
})
export type ReplyFarmerReviewRequest = z.infer<typeof ReplyFarmerReviewRequestSchema>

export const FarmerFarmStatusSchema = z.enum(['active', 'archived'])
export type FarmerFarmStatus = z.infer<typeof FarmerFarmStatusSchema>

export const FarmerFarmSchema = z.object({
  id: z.string(),
  farmerId: z.string(),
  name: z.string().trim().min(3).max(100),
  areaName: z.string().trim().min(3).max(120),
  fullAddress: z.string().trim().min(8).max(300),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  primaryCommodities: z.array(CommodityCategorySchema),
  pickupNotes: z.string().trim().max(240).optional(),
  status: FarmerFarmStatusSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})
export type FarmerFarm = z.infer<typeof FarmerFarmSchema>

export const CreateFarmerFarmRequestSchema = z.object({
  name: z.string().trim().min(3, 'Nama kebun minimal 3 karakter').max(100),
  areaName: z.string().trim().min(3, 'Isi kecamatan atau kabupaten').max(120),
  fullAddress: z.string().trim().min(8, 'Alamat lengkap minimal 8 karakter').max(300),
  latitude: z.number().min(-90, 'Latitude tidak valid').max(90, 'Latitude tidak valid').optional(),
  longitude: z
    .number()
    .min(-180, 'Longitude tidak valid')
    .max(180, 'Longitude tidak valid')
    .optional(),
  primaryCommodities: z.array(CommodityCategorySchema).min(1, 'Pilih minimal satu komoditas'),
  pickupNotes: z.string().trim().max(240, 'Catatan maksimal 240 karakter').optional(),
})
export type CreateFarmerFarmRequest = z.infer<typeof CreateFarmerFarmRequestSchema>

export const UpdateFarmerFarmRequestSchema = CreateFarmerFarmRequestSchema.extend({
  status: FarmerFarmStatusSchema,
})
export type UpdateFarmerFarmRequest = z.infer<typeof UpdateFarmerFarmRequestSchema>

export const SaveFarmerOfferRequestSchema = z
  .object({
    farmId: z.string().trim().min(1, 'Pilih kebun asal panen'),
    commodityName: z.string().trim().min(3, 'Nama komoditas minimal 3 karakter').max(120),
    category: z.string().trim().min(1, 'Pilih kategori komoditas'),
    condition: CommodityConditionSchema,
    conditionNote: z.string().trim().max(240, 'Catatan kondisi maksimal 240 karakter').optional(),
    surplusReason: z.string().trim().max(280, 'Alasan surplus maksimal 280 karakter').optional(),
    estimatedPortionNote: z
      .string()
      .trim()
      .max(160, 'Catatan estimasi isi maksimal 160 karakter')
      .optional(),
    harvestDate: z.string().trim().min(1, 'Isi tanggal panen'),
    availableStockKg: z
      .number()
      .min(0.001, 'Stok minimal 0,001 kg')
      .max(100_000, 'Stok maksimal 100.000 kg')
      .multipleOf(0.001, 'Ketelitian berat maksimal 3 angka di belakang koma'),
    pricePerKg: z
      .number()
      .int('Harga harus bilangan bulat')
      .positive('Harga harus lebih dari Rp 0'),
    dynamicPriceRule: DynamicPriceRuleSchema.optional(),
    orderDeadline: z.string().trim().min(1, 'Isi batas waktu pemesanan'),
    pickupScheduleSlots: z
      .array(ScheduleSlotSchema)
      .min(1, 'Tambahkan minimal satu slot jadwal pengambilan'),
    photos: z.array(z.string()).max(5).optional(),
    status: z.enum(['draft', 'active']),
  })
  .refine(
    (data) =>
      !data.dynamicPriceRule || data.dynamicPriceRule.minPrice <= data.dynamicPriceRule.startPrice,
    {
      message: 'Harga minimum tidak boleh melebihi harga awal',
      path: ['dynamicPriceRule', 'minPrice'],
    }
  )
export type SaveFarmerOfferRequest = z.infer<typeof SaveFarmerOfferRequestSchema>

export const AdjustOfferStockRequestSchema = z.object({
  availableStockKg: z
    .number()
    .min(0, 'Stok tidak boleh negatif')
    .max(100_000, 'Stok maksimal 100.000 kg')
    .multipleOf(0.001, 'Ketelitian berat maksimal 3 angka di belakang koma'),
  condition: CommodityConditionSchema,
  conditionNote: z.string().trim().max(240, 'Catatan perubahan maksimal 240 karakter').optional(),
  closeOffer: z.boolean().optional(),
})
export type AdjustOfferStockRequest = z.infer<typeof AdjustOfferStockRequestSchema>
