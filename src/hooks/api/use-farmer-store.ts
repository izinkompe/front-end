'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { apiClient } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import {
  FarmerReviewsResponseSchema,
  FarmerStoreProfileSchema,
  ToggleFollowFarmerResponseSchema,
  ToggleReviewHelpfulResponseSchema,
  type FarmerReviewsResponse,
  type FarmerStoreProfile,
  type ToggleFollowFarmerResponse,
  type ToggleReviewHelpfulResponse,
} from '@/types/api/farmers'
import { OfferSchema, type Offer } from '@/types/api/offers'

import { useCurrentUser } from './use-auth'

const OfferListSchema = z.array(OfferSchema)

export function useFarmerStore(farmerId: string) {
  const { data: user } = useCurrentUser()
  return useQuery({
    queryKey: queryKeys.farmers.detail(farmerId, user?.id),
    queryFn: () =>
      apiClient<FarmerStoreProfile>(
        '/api/farmers/' + encodeURIComponent(farmerId),
        FarmerStoreProfileSchema
      ),
    enabled: Boolean(farmerId),
    staleTime: 30 * 1000,
  })
}

export function useFarmerStoreOffers(farmerId: string) {
  return useQuery({
    queryKey: queryKeys.offers.list({ farmerId }),
    queryFn: () =>
      apiClient<Offer[]>('/api/offers', OfferListSchema, {
        params: { farmerId },
      }),
    enabled: Boolean(farmerId),
    staleTime: 30 * 1000,
  })
}

export function useFarmerReviews(farmerId: string) {
  return useQuery({
    queryKey: queryKeys.farmers.reviews(farmerId),
    queryFn: () =>
      apiClient<FarmerReviewsResponse>(
        '/api/farmers/' + encodeURIComponent(farmerId) + '/reviews',
        FarmerReviewsResponseSchema
      ),
    enabled: Boolean(farmerId),
    staleTime: 30 * 1000,
  })
}

export function useToggleFollowFarmer(farmerId: string) {
  const queryClient = useQueryClient()
  const { data: user } = useCurrentUser()

  return useMutation({
    mutationFn: () =>
      apiClient<ToggleFollowFarmerResponse>(
        '/api/farmers/' + encodeURIComponent(farmerId) + '/follow',
        ToggleFollowFarmerResponseSchema,
        { method: 'POST' }
      ),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites })
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me })
      queryClient.setQueryData<FarmerStoreProfile | undefined>(
        queryKeys.farmers.detail(farmerId, user?.id),
        (prev) =>
          prev
            ? {
                ...prev,
                isFollowing: result.isFollowing,
                stats: {
                  ...prev.stats,
                  followerCount: result.followerCount,
                },
              }
            : prev
      )
    },
  })
}

export function useToggleReviewHelpful(farmerId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reviewId: string) =>
      apiClient<ToggleReviewHelpfulResponse>(
        '/api/reviews/' + encodeURIComponent(reviewId) + '/helpful',
        ToggleReviewHelpfulResponseSchema,
        { method: 'POST' }
      ),
    onSuccess: (result) => {
      queryClient.setQueryData<FarmerReviewsResponse | undefined>(
        queryKeys.farmers.reviews(farmerId),
        (prev) =>
          prev
            ? {
                ...prev,
                reviews: prev.reviews.map((review) =>
                  review.id === result.reviewId
                    ? {
                        ...review,
                        helpfulCount: result.helpfulCount,
                        isHelpfulByMe: result.isHelpfulByMe,
                      }
                    : review
                ),
              }
            : prev
      )
    },
  })
}
