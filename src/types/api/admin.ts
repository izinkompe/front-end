import { z } from 'zod'
import { CommodityCategorySchema, FarmerTypeSchema, UserRoleSchema } from './auth'
import { OfferStatusSchema } from './offers'

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

export const AdminFarmerItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  organization: z.string().optional(),
  farmerType: FarmerTypeSchema.optional(),
  primaryCommodities: z.array(CommodityCategorySchema).optional(),
  isVerifiedFarmer: z.boolean(),
  onboardingCompleted: z.boolean(),
  bankName: z.string().optional(),
  areaName: z.string().optional(),
  createdAt: z.string(),
})
export type AdminFarmerItem = z.infer<typeof AdminFarmerItemSchema>

export const VerifyFarmerRequestSchema = z.object({
  isVerifiedFarmer: z.boolean(),
})
export type VerifyFarmerRequest = z.infer<typeof VerifyFarmerRequestSchema>

export const AdminOfferModerationItemSchema = z.object({
  id: z.string(),
  farmerId: z.string(),
  farmerName: z.string(),
  commodityName: z.string(),
  category: z.string(),
  pricePerKg: z.number(),
  availableStockKg: z.number(),
  reservedStockKg: z.number(),
  soldStockKg: z.number(),
  pickupAddressArea: z.string(),
  orderDeadline: z.string(),
  status: OfferStatusSchema,
})
export type AdminOfferModerationItem = z.infer<typeof AdminOfferModerationItemSchema>

export const ModerateOfferRequestSchema = z.object({
  status: z.enum(['active', 'closed']),
})
export type ModerateOfferRequest = z.infer<typeof ModerateOfferRequestSchema>

export const AdminUserItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  role: UserRoleSchema,
  organization: z.string().optional(),
  isVerifiedFarmer: z.boolean().optional(),
  createdAt: z.string(),
})
export type AdminUserItem = z.infer<typeof AdminUserItemSchema>
