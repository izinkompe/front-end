import { z } from 'zod'
import { CommodityCategorySchema } from './auth'

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

export const FarmerFarmStatusSchema = z.enum(['active', 'archived'])
export type FarmerFarmStatus = z.infer<typeof FarmerFarmStatusSchema>

export const FarmerFarmSchema = z.object({
  id: z.string(),
  farmerId: z.string(),
  name: z.string().trim().min(3).max(100),
  areaName: z.string().trim().min(3).max(120),
  fullAddress: z.string().trim().min(8).max(300),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
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
  primaryCommodities: z.array(CommodityCategorySchema).min(1, 'Pilih minimal satu komoditas'),
  pickupNotes: z.string().trim().max(240).optional(),
})
export type CreateFarmerFarmRequest = z.infer<typeof CreateFarmerFarmRequestSchema>

export const UpdateFarmerFarmRequestSchema = CreateFarmerFarmRequestSchema.extend({
  status: FarmerFarmStatusSchema,
})
export type UpdateFarmerFarmRequest = z.infer<typeof UpdateFarmerFarmRequestSchema>
