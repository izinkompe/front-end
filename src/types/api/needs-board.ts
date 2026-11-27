import { z } from 'zod'
import { BuyerCategorySlugSchema } from '@/lib/data/categories'

export const NeedResponseSchema = z.object({
  id: z.string(),
  farmerId: z.string(),
  farmerName: z.string(),
  offerId: z.string(),
  offeredQuantityKg: z.number().positive(),
  offeredPricePerKg: z.number().positive(),
  availableDate: z.string(),
  message: z.string().optional(),
  createdAt: z.string(),
})
export type NeedResponse = z.infer<typeof NeedResponseSchema>

export const NeedRequestStatusSchema = z.enum([
  'open',
  'partially_fulfilled',
  'fulfilled',
  'closed',
  'expired',
])
export type NeedRequestStatus = z.infer<typeof NeedRequestStatusSchema>

export const NeedRequestSchema = z.object({
  id: z.string(),
  buyerId: z.string(),
  buyerName: z.string(),
  organization: z.string().optional(),
  commodityName: z.string(),
  category: z.string(),
  neededQuantityKg: z.number().positive(),
  maxPricePerKg: z.number().positive().optional(),
  fulfilledQuantityKg: z.number().nonnegative().optional(),
  targetDate: z.string(),
  targetArea: z.string(),
  notes: z.string().optional(),
  status: NeedRequestStatusSchema,
  responses: z.array(NeedResponseSchema).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type NeedRequest = z.infer<typeof NeedRequestSchema>

export const CreateNeedRequestSchema = z.object({
  commodityName: z.string().trim().min(2).max(100),
  category: BuyerCategorySlugSchema,
  neededQuantityKg: z.number().min(0.001).max(100_000).multipleOf(0.001),
  maxPricePerKg: z.number().int().positive().max(1_000_000_000).optional(),
  targetDate: z.iso.date(),
  targetArea: z.string().trim().min(3).max(100),
  notes: z.string().trim().max(500).optional(),
})
export type CreateNeedRequest = z.infer<typeof CreateNeedRequestSchema>

export const UpdateNeedStatusSchema = z.object({ status: z.enum(['fulfilled', 'closed']) })
export type UpdateNeedStatus = z.infer<typeof UpdateNeedStatusSchema>['status']

export const FarmerNeedResponseRequestSchema = z.object({
  offerId: z.string().trim().min(1, 'Pilih penawaran aktif milik Anda'),
  offeredQuantityKg: z
    .number()
    .min(0.001, 'Berat minimal 0,001 kg')
    .max(100_000, 'Berat maksimal 100.000 kg')
    .multipleOf(0.001, 'Ketelitian berat maksimal 3 angka di belakang koma'),
  offeredPricePerKg: z
    .number()
    .int('Harga per kg harus bilangan bulat')
    .positive('Harga per kg harus lebih dari Rp 0')
    .max(1_000_000_000, 'Harga melebihi batas wajar'),
  availableDate: z.iso.date('Pilih tanggal siap diambil yang valid'),
  message: z.string().trim().max(300, 'Pesan maksimal 300 karakter').optional(),
})
export type FarmerNeedResponseRequest = z.infer<typeof FarmerNeedResponseRequestSchema>
