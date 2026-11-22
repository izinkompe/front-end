import { z } from 'zod'

export const DistributionStatsSchema = z.object({
  totalDistributedWeightKg: z.number().nonnegative(),
  totalRescuedFoodKg: z.number().nonnegative(),
  totalCarbonSavedKgCo2e: z.number().nonnegative(),
  totalCompletedTransactions: z.number().nonnegative(),
  activeFarmersCount: z.number().nonnegative(),
  activeBuyersCount: z.number().nonnegative(),
})
export type DistributionStats = z.infer<typeof DistributionStatsSchema>

export const CarbonFactorSchema = z.object({
  id: z.string(),
  category: z.string(),
  commodityName: z.string(),
  factorKgCo2ePerKg: z.number().positive(),
  source: z.string(),
  version: z.string(),
  updatedAt: z.string(),
})
export type CarbonFactor = z.infer<typeof CarbonFactorSchema>
