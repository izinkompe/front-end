import { z } from 'zod'

export const CommodityConditionSchema = z.enum([
  'grade_b',
  'surplus',
  'imperfect_shape',
  'ripe_urgent',
])
export type CommodityCondition = z.infer<typeof CommodityConditionSchema>

export const DynamicPriceRuleSchema = z.object({
  startPrice: z.number().positive(),
  minPrice: z.number().positive(),
  dropIntervalHours: z.number().positive(),
  dropAmount: z.number().positive(),
})
export type DynamicPriceRule = z.infer<typeof DynamicPriceRuleSchema>

export const ScheduleSlotSchema = z.object({
  id: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  isAvailable: z.boolean().optional(),
})
export type ScheduleSlot = z.infer<typeof ScheduleSlotSchema>

export const OfferStatusSchema = z.enum(['draft', 'active', 'sold_out', 'closed', 'expired'])
export type OfferStatus = z.infer<typeof OfferStatusSchema>

export const OfferSchema = z.object({
  id: z.string(),
  farmerId: z.string(),
  farmerName: z.string(),
  farmId: z.string().optional(),
  commodityName: z.string(),
  category: z.string(),
  condition: CommodityConditionSchema,
  conditionNote: z.string().optional(),
  surplusReason: z.string().optional(),
  estimatedPortionNote: z.string().optional(),
  harvestDate: z.string(),
  availableStockKg: z.number().nonnegative(),
  reservedStockKg: z.number().nonnegative(),
  soldStockKg: z.number().nonnegative(),
  pricePerKg: z.number().positive(),
  dynamicPriceRule: DynamicPriceRuleSchema.optional(),
  dynamicPriceStartsAt: z.iso.datetime().optional(),
  orderDeadline: z.string(),
  pickupAddressArea: z.string(),
  pickupAddressFull: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  pickupScheduleSlots: z.array(ScheduleSlotSchema),
  photos: z.array(z.string()),
  status: OfferStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type Offer = z.infer<typeof OfferSchema>
