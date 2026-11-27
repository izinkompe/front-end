'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { apiClient } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import type { FarmerBankAccount } from '@/types/api/auth'
import {
  FarmerFarmSchema,
  FarmerStoreSettingsSchema,
  type AdjustOfferStockRequest,
  type CreateFarmerFarmRequest,
  type FarmerFarm,
  type FarmerStoreSettings,
  type ReplyFarmerReviewRequest,
  type SaveFarmerOfferRequest,
  type ToggleFeaturedOfferRequest,
  type UpdateFarmerBankAccountRequest,
  type UpdateFarmerFarmRequest,
  type UpdateFarmerStoreSettingsRequest,
} from '@/types/api/farmer-management'
import { FarmerReviewSchema, type FarmerReview } from '@/types/api/farmers'
import { OfferSchema, type Offer } from '@/types/api/offers'
import { useCurrentUser } from './use-auth'

const FarmerFarmListSchema = z.array(FarmerFarmSchema)
const FarmerOfferListSchema = z.array(OfferSchema)
const FarmerReviewListSchema = z.array(FarmerReviewSchema)

const FarmerBankAccountDraftSchema = z.object({
  bankName: z.string(),
  accountNumber: z.string(),
  accountHolderName: z.string(),
})

export function useFarmerOffers() {
  const { data: user } = useCurrentUser()
  const isFarmer = user?.role === 'farmer'

  return useQuery({
    queryKey: queryKeys.farmerManagement.offers(user?.id),
    queryFn: () => apiClient<Offer[]>('/api/farmer/offers', FarmerOfferListSchema),
    enabled: isFarmer,
    staleTime: 30 * 1000,
  })
}

export function useFarmerOffer(offerId: string) {
  const { data: user } = useCurrentUser()

  return useQuery({
    queryKey: queryKeys.farmerManagement.offer(offerId, user?.id),
    queryFn: () =>
      apiClient<Offer>('/api/farmer/offers/' + encodeURIComponent(offerId), OfferSchema),
    enabled: Boolean(offerId) && user?.role === 'farmer',
    staleTime: 30 * 1000,
  })
}

export function useCreateFarmerOffer() {
  const queryClient = useQueryClient()
  const { data: user } = useCurrentUser()

  return useMutation({
    mutationFn: (payload: SaveFarmerOfferRequest) =>
      apiClient<Offer>('/api/farmer/offers', OfferSchema, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.farmerManagement.offers(user?.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.offers.all })
    },
  })
}

export function useUpdateFarmerOffer(offerId: string) {
  const queryClient = useQueryClient()
  const { data: user } = useCurrentUser()

  return useMutation({
    mutationFn: (payload: SaveFarmerOfferRequest) =>
      apiClient<Offer>('/api/farmer/offers/' + encodeURIComponent(offerId), OfferSchema, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.farmerManagement.offer(offerId, user?.id), updated)
      queryClient.invalidateQueries({ queryKey: queryKeys.farmerManagement.offers(user?.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.offers.all })
    },
  })
}

export function useCloseFarmerOffer() {
  const queryClient = useQueryClient()
  const { data: user } = useCurrentUser()

  return useMutation({
    mutationFn: (offerId: string) =>
      apiClient<Offer>(
        '/api/farmer/offers/' + encodeURIComponent(offerId) + '/close',
        OfferSchema,
        {
          method: 'POST',
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.farmerManagement.offers(user?.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.offers.all })
    },
  })
}

export function useDuplicateFarmerOffer() {
  const queryClient = useQueryClient()
  const { data: user } = useCurrentUser()

  return useMutation({
    mutationFn: (offerId: string) =>
      apiClient<Offer>(
        '/api/farmer/offers/' + encodeURIComponent(offerId) + '/duplicate',
        OfferSchema,
        { method: 'POST' }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.farmerManagement.offers(user?.id) })
    },
  })
}

export function useAdjustFarmerOfferStock(offerId: string) {
  const queryClient = useQueryClient()
  const { data: user } = useCurrentUser()

  return useMutation({
    mutationFn: (payload: AdjustOfferStockRequest) =>
      apiClient<Offer>(
        '/api/farmer/offers/' + encodeURIComponent(offerId) + '/stock-adjustment',
        OfferSchema,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      ),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.farmerManagement.offer(offerId, user?.id), updated)
      queryClient.invalidateQueries({ queryKey: queryKeys.farmerManagement.offers(user?.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.offers.all })
    },
  })
}

export function useFarmerStoreSettings() {
  const { data: user } = useCurrentUser()
  const isFarmer = user?.role === 'farmer'

  return useQuery({
    queryKey: queryKeys.farmerManagement.store(user?.id),
    queryFn: () => apiClient<FarmerStoreSettings>('/api/farmer/store', FarmerStoreSettingsSchema),
    enabled: isFarmer,
    staleTime: 30 * 1000,
  })
}

export function useUpdateFarmerStoreSettings() {
  const queryClient = useQueryClient()
  const { data: user } = useCurrentUser()

  return useMutation({
    mutationFn: (payload: UpdateFarmerStoreSettingsRequest) =>
      apiClient<FarmerStoreSettings>('/api/farmer/store', FarmerStoreSettingsSchema, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: (settings) => {
      queryClient.setQueryData(queryKeys.farmerManagement.store(user?.id), settings)
      queryClient.invalidateQueries({ queryKey: queryKeys.farmers.detail(settings.farmerId) })
    },
  })
}

export function useToggleFeaturedOffer() {
  const queryClient = useQueryClient()
  const { data: user } = useCurrentUser()

  return useMutation({
    mutationFn: (payload: ToggleFeaturedOfferRequest) =>
      apiClient<FarmerStoreSettings>('/api/farmer/store/featured', FarmerStoreSettingsSchema, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: (settings) => {
      queryClient.setQueryData(queryKeys.farmerManagement.store(user?.id), settings)
      queryClient.invalidateQueries({ queryKey: queryKeys.farmers.detail(settings.farmerId) })
    },
  })
}

export function useFarmerBankAccount() {
  const { data: user } = useCurrentUser()

  return useQuery({
    queryKey: queryKeys.farmerManagement.bankAccount(user?.id),
    queryFn: () =>
      apiClient<FarmerBankAccount>('/api/farmer/bank-account', FarmerBankAccountDraftSchema),
    enabled: user?.role === 'farmer',
    staleTime: 30 * 1000,
  })
}

export function useUpdateFarmerBankAccount() {
  const queryClient = useQueryClient()
  const { data: user } = useCurrentUser()

  return useMutation({
    mutationFn: (payload: UpdateFarmerBankAccountRequest) =>
      apiClient<FarmerBankAccount>('/api/farmer/bank-account', FarmerBankAccountDraftSchema, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: (account) => {
      queryClient.setQueryData(queryKeys.farmerManagement.bankAccount(user?.id), account)
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me })
    },
  })
}

export function useFarmerOwnReviews() {
  const { data: user } = useCurrentUser()

  return useQuery({
    queryKey: queryKeys.farmerManagement.reviews(user?.id),
    queryFn: () => apiClient<FarmerReview[]>('/api/farmer/reviews', FarmerReviewListSchema),
    enabled: user?.role === 'farmer',
    staleTime: 30 * 1000,
  })
}

export function useReplyFarmerReview(reviewId: string) {
  const queryClient = useQueryClient()
  const { data: user } = useCurrentUser()

  return useMutation({
    mutationFn: (payload: ReplyFarmerReviewRequest) =>
      apiClient<FarmerReview>(
        '/api/farmer/reviews/' + encodeURIComponent(reviewId) + '/reply',
        FarmerReviewSchema,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.farmerManagement.reviews(user?.id) })
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.farmers.reviews(user.id) })
      }
    },
  })
}

export function useFarmerFarms() {
  const { data: user } = useCurrentUser()
  const isFarmer = user?.role === 'farmer'

  return useQuery({
    queryKey: queryKeys.farmerManagement.farms(user?.id),
    queryFn: () => apiClient<FarmerFarm[]>('/api/farmer/farms', FarmerFarmListSchema),
    enabled: isFarmer,
    staleTime: 30 * 1000,
  })
}

export function useFarmerFarm(farmId: string) {
  const { data: user } = useCurrentUser()

  return useQuery({
    queryKey: queryKeys.farmerManagement.farm(farmId, user?.id),
    queryFn: () =>
      apiClient<FarmerFarm>('/api/farmer/farms/' + encodeURIComponent(farmId), FarmerFarmSchema),
    enabled: Boolean(farmId) && user?.role === 'farmer',
    staleTime: 30 * 1000,
  })
}

export function useCreateFarmerFarm() {
  const queryClient = useQueryClient()
  const { data: user } = useCurrentUser()

  return useMutation({
    mutationFn: (payload: CreateFarmerFarmRequest) =>
      apiClient<FarmerFarm>('/api/farmer/farms', FarmerFarmSchema, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: (farm) => {
      queryClient.setQueryData<FarmerFarm[]>(
        queryKeys.farmerManagement.farms(user?.id),
        (previous) => [...(previous ?? []), farm]
      )
    },
  })
}

export function useUpdateFarmerFarm(farmId: string) {
  const queryClient = useQueryClient()
  const { data: user } = useCurrentUser()

  return useMutation({
    mutationFn: (payload: UpdateFarmerFarmRequest) =>
      apiClient<FarmerFarm>('/api/farmer/farms/' + encodeURIComponent(farmId), FarmerFarmSchema, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: (farm) => {
      queryClient.setQueryData(queryKeys.farmerManagement.farm(farmId, user?.id), farm)
      queryClient.invalidateQueries({ queryKey: queryKeys.farmerManagement.farms(user?.id) })
    },
  })
}
