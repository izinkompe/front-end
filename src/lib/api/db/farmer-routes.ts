import { saveBuyerPreferences } from './buyer-preferences'
import { requireBuyer } from './route-context'
import { ApiError } from '../errors'
import { offersCollection } from './collections/offers'
import { usersCollection } from './collections/users'
import { farmerReviewsCollection } from './collections/farmer-reviews'
import { mockFarmerStoreMeta } from './fixtures/farmer-stores.fixture'
import {
  FarmerReviewTopicSchema,
  type FarmerReviewsResponse,
  type FarmerStoreProfile,
} from '@/types/api/farmers'
import type { User } from '@/types/api/auth'

interface FarmerRouteContext {
  endpoint: string
  method: string
  activeSessionUserId: string | null
}

const helpfulByUserReview = new Map<string, Set<string>>()

function buildReviewSummary(farmerId: string) {
  const reviews = Array.from(farmerReviewsCollection.values()).filter(
    (item) => item.farmerId === farmerId
  )
  const totalReviews = reviews.length
  const totalRatings = totalReviews

  const ratingCounts = new Map<number, number>([
    [5, 0],
    [4, 0],
    [3, 0],
    [2, 0],
    [1, 0],
  ])

  const topicCountMap = new Map<string, number>()
  for (const topic of FarmerReviewTopicSchema.options) {
    topicCountMap.set(topic, 0)
  }

  let ratingSum = 0
  let satisfiedCount = 0

  for (const review of reviews) {
    ratingSum += review.rating
    if (review.rating >= 4) {
      satisfiedCount += 1
    }
    ratingCounts.set(review.rating, (ratingCounts.get(review.rating) ?? 0) + 1)
    for (const topic of review.topics) {
      topicCountMap.set(topic, (topicCountMap.get(topic) ?? 0) + 1)
    }
  }

  const averageRating = totalRatings > 0 ? Math.round((ratingSum / totalRatings) * 10) / 10 : 0
  const satisfactionPercent =
    totalRatings > 0 ? Math.round((satisfiedCount / totalRatings) * 100) : 0

  return {
    summary: {
      averageRating,
      totalRatings,
      totalReviews,
      satisfactionPercent,
      breakdown: [5, 4, 3, 2, 1].map((stars) => ({
        stars,
        count: ratingCounts.get(stars) ?? 0,
      })),
      topicCounts: FarmerReviewTopicSchema.options.map((topic) => ({
        topic,
        count: topicCountMap.get(topic) ?? 0,
      })),
    },
    reviews,
  }
}

function countFollowers(farmerId: string) {
  return Array.from(usersCollection.values()).filter((user) =>
    user.followedFarmerIds?.includes(farmerId)
  ).length
}

function toPublicFarmerStoreProfile(
  farmer: User,
  activeSessionUserId: string | null
): FarmerStoreProfile {
  const meta = mockFarmerStoreMeta[farmer.id]
  const farmerOffers = Array.from(offersCollection.values()).filter(
    (offer) => offer.farmerId === farmer.id
  )
  const activeOffersCount = farmerOffers.filter(
    (offer) => offer.status === 'active' && offer.availableStockKg > 0
  ).length
  const offerSoldKg = farmerOffers.reduce((sum, offer) => sum + offer.soldStockKg, 0)
  const defaultAddress = farmer.addresses?.find((addr) => addr.isDefault) ?? farmer.addresses?.[0]
  const fallbackArea = farmerOffers[0]?.pickupAddressArea ?? 'Jawa Barat'
  const reviewStats = buildReviewSummary(farmer.id).summary
  const viewer = activeSessionUserId ? usersCollection.get(activeSessionUserId) : undefined

  return {
    id: farmer.id,
    farmName: (farmer.organization ?? '').trim() || farmer.name,
    farmerDisplayName: farmer.name,
    farmerType: farmer.farmerType ?? 'individual',
    isVerifiedFarmer: Boolean(farmer.isVerifiedFarmer),
    areaName: defaultAddress?.areaName ?? fallbackArea,
    avatarUrl: farmer.avatarUrl,
    description:
      meta?.description ??
      `${(farmer.organization ?? '').trim() || farmer.name} menyalurkan hasil panen surplus langsung dari kebun.`,
    publicPickupNotes:
      meta?.publicPickupNotes ??
      'Pengambilan mandiri sesuai slot jadwal pada penawaran. Alamat lengkap tersedia setelah reservasi.',
    primaryCommodities: farmer.primaryCommodities ?? [],
    joinedAt: farmer.createdAt,
    stats: {
      averageRating: reviewStats.averageRating,
      totalRatings: reviewStats.totalRatings,
      totalReviews: reviewStats.totalReviews,
      satisfactionPercent: reviewStats.satisfactionPercent,
      totalDistributedKg: (meta?.baseDistributedKg ?? 0) + offerSoldKg,
      followerCount: (meta?.baseFollowerCount ?? 0) + countFollowers(farmer.id),
      activeOffersCount,
    },
    isFollowing: Boolean(viewer?.followedFarmerIds?.includes(farmer.id)),
  }
}

export function getPublicFarmerStoreById(
  farmerId: string,
  activeSessionUserId: string | null = null
): FarmerStoreProfile | null {
  const user = usersCollection.get(farmerId)
  if (!user || user.role !== 'farmer') {
    return null
  }
  return toPublicFarmerStoreProfile(user, activeSessionUserId)
}

export function getAllPublicFarmerIds(): string[] {
  return Array.from(usersCollection.values())
    .filter((user) => user.role === 'farmer')
    .map((user) => user.id)
}

export function handleFarmerRoute(ctx: FarmerRouteContext): { handled: boolean; data?: unknown } {
  const { endpoint, method, activeSessionUserId } = ctx

  const reviewsMatch = /^\/api\/farmers\/([^/]+)\/reviews$/.exec(endpoint)
  if (reviewsMatch && method === 'GET') {
    const farmerId = decodeURIComponent(reviewsMatch[1])
    const farmer = usersCollection.get(farmerId)
    if (!farmer || farmer.role !== 'farmer') {
      throw new ApiError(404, 'Profil toko petani tidak ditemukan', 'NOT_FOUND')
    }
    const result = buildReviewSummary(farmerId)
    const viewerKey = activeSessionUserId ?? 'guest'
    const helpfulSet = helpfulByUserReview.get(viewerKey)
    const response: FarmerReviewsResponse = {
      summary: result.summary,
      reviews: result.reviews.map((review) => ({
        ...review,
        isHelpfulByMe: helpfulSet ? helpfulSet.has(review.id) : false,
      })),
    }
    return { handled: true, data: response }
  }

  const followMatch = /^\/api\/farmers\/([^/]+)\/follow$/.exec(endpoint)
  if (followMatch && method === 'POST') {
    const buyer = requireBuyer(activeSessionUserId)
    const farmerId = decodeURIComponent(followMatch[1])
    const farmer = usersCollection.get(farmerId)
    if (!farmer || farmer.role !== 'farmer') {
      throw new ApiError(404, 'Profil toko petani tidak ditemukan', 'NOT_FOUND')
    }
    const ids = buyer.followedFarmerIds ?? []
    const isFollowing = !ids.includes(farmerId)
    usersCollection.update(buyer.id, (draft) => {
      draft.followedFarmerIds = isFollowing
        ? [...ids, farmerId]
        : ids.filter((id) => id !== farmerId)
    })
    const updated = usersCollection.get(buyer.id)
    if (updated) saveBuyerPreferences(updated)
    const meta = mockFarmerStoreMeta[farmerId]
    return {
      handled: true,
      data: {
        farmerId,
        isFollowing,
        followerCount: (meta?.baseFollowerCount ?? 0) + countFollowers(farmer.id),
      },
    }
  }

  const helpfulMatch = /^\/api\/reviews\/([^/]+)\/helpful$/.exec(endpoint)
  if (helpfulMatch && method === 'POST') {
    const reviewId = decodeURIComponent(helpfulMatch[1])
    const review = farmerReviewsCollection.get(reviewId)
    if (!review) {
      throw new ApiError(404, 'Ulasan tidak ditemukan', 'NOT_FOUND')
    }
    const viewerKey = activeSessionUserId ?? 'guest'
    let userSet = helpfulByUserReview.get(viewerKey)
    if (!userSet) {
      userSet = new Set<string>()
      helpfulByUserReview.set(viewerKey, userSet)
    }
    const currentlyMarked = userSet.has(reviewId)
    let nextHelpfulCount = review.helpfulCount
    if (currentlyMarked) {
      userSet.delete(reviewId)
      nextHelpfulCount = Math.max(0, review.helpfulCount - 1)
    } else {
      userSet.add(reviewId)
      nextHelpfulCount = review.helpfulCount + 1
    }
    farmerReviewsCollection.update(reviewId, (draft) => {
      draft.helpfulCount = nextHelpfulCount
    })
    return {
      handled: true,
      data: {
        reviewId,
        helpfulCount: nextHelpfulCount,
        isHelpfulByMe: !currentlyMarked,
      },
    }
  }

  const storeMatch = /^\/api\/farmers\/([^/]+)$/.exec(endpoint)
  if (storeMatch && method === 'GET') {
    const farmerId = decodeURIComponent(storeMatch[1])
    const profile = getPublicFarmerStoreById(farmerId, activeSessionUserId)
    if (!profile) {
      throw new ApiError(404, 'Profil toko petani tidak ditemukan', 'NOT_FOUND')
    }
    return { handled: true, data: profile }
  }

  return { handled: false }
}
