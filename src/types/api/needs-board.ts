import { z } from 'zod'

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
  targetDate: z.string(),
  targetArea: z.string(),
  notes: z.string().optional(),
  status: NeedRequestStatusSchema,
  responses: z.array(NeedResponseSchema).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type NeedRequest = z.infer<typeof NeedRequestSchema>
