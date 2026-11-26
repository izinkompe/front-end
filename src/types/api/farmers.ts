import { z } from 'zod'
import { CommodityCategorySchema, FarmerTypeSchema } from './auth'

export const FarmerReviewTopicSchema = z.enum([
  'freshness',
  'weight_accuracy',
  'pickup_ease',
  'condition_match',
])
export type FarmerReviewTopic = z.infer<typeof FarmerReviewTopicSchema>

export const FarmerReviewSchema = z.object({
  id: z.string(),
  farmerId: z.string(),
  orderId: z.string(),
  offerId: z.string(),
  commodityName: z.string(),
  commodityPhotoUrl: z.string().optional(),
  quantityKg: z.number().positive(),
  buyerDisplayName: z.string(),
  rating: z.number().int().min(1).max(5),
  topics: z.array(FarmerReviewTopicSchema),
  comment: z.string(),
  photos: z.array(z.string()),
  helpfulCount: z.number().int().nonnegative(),
  isHelpfulByMe: z.boolean().optional(),
  farmerReply: z
    .object({
      message: z.string(),
      repliedAt: z.string(),
    })
    .optional(),
  createdAt: z.string(),
})
export type FarmerReview = z.infer<typeof FarmerReviewSchema>

export const RatingBreakdownItemSchema = z.object({
  stars: z.number().int().min(1).max(5),
  count: z.number().int().nonnegative(),
})
export type RatingBreakdownItem = z.infer<typeof RatingBreakdownItemSchema>

export const FarmerReviewTopicCountSchema = z.object({
  topic: FarmerReviewTopicSchema,
  count: z.number().int().nonnegative(),
})
export type FarmerReviewTopicCount = z.infer<typeof FarmerReviewTopicCountSchema>

export const FarmerReviewsSummarySchema = z.object({
  averageRating: z.number().min(0).max(5),
  totalRatings: z.number().int().nonnegative(),
  totalReviews: z.number().int().nonnegative(),
  satisfactionPercent: z.number().int().min(0).max(100),
  breakdown: z.array(RatingBreakdownItemSchema),
  topicCounts: z.array(FarmerReviewTopicCountSchema),
})
export type FarmerReviewsSummary = z.infer<typeof FarmerReviewsSummarySchema>

export const FarmerReviewsResponseSchema = z.object({
  summary: FarmerReviewsSummarySchema,
  reviews: z.array(FarmerReviewSchema),
})
export type FarmerReviewsResponse = z.infer<typeof FarmerReviewsResponseSchema>

export const FarmerStoreStatsSchema = z.object({
  averageRating: z.number().min(0).max(5),
  totalRatings: z.number().int().nonnegative(),
  totalReviews: z.number().int().nonnegative(),
  satisfactionPercent: z.number().int().min(0).max(100),
  totalDistributedKg: z.number().nonnegative(),
  followerCount: z.number().int().nonnegative(),
  activeOffersCount: z.number().int().nonnegative(),
})
export type FarmerStoreStats = z.infer<typeof FarmerStoreStatsSchema>

export const FarmerStoreProfileSchema = z.object({
  id: z.string(),
  farmName: z.string(),
  farmerDisplayName: z.string(),
  farmerType: FarmerTypeSchema,
  isVerifiedFarmer: z.boolean(),
  areaName: z.string(),
  avatarUrl: z.string().optional(),
  description: z.string(),
  publicPickupNotes: z.string(),
  primaryCommodities: z.array(CommodityCategorySchema),
  joinedAt: z.string(),
  stats: FarmerStoreStatsSchema,
  isFollowing: z.boolean(),
})
export type FarmerStoreProfile = z.infer<typeof FarmerStoreProfileSchema>

export const ToggleFollowFarmerResponseSchema = z.object({
  farmerId: z.string(),
  isFollowing: z.boolean(),
  followerCount: z.number().int().nonnegative(),
})
export type ToggleFollowFarmerResponse = z.infer<typeof ToggleFollowFarmerResponseSchema>

export const ToggleReviewHelpfulResponseSchema = z.object({
  reviewId: z.string(),
  helpfulCount: z.number().int().nonnegative(),
  isHelpfulByMe: z.boolean(),
})
export type ToggleReviewHelpfulResponse = z.infer<typeof ToggleReviewHelpfulResponseSchema>
