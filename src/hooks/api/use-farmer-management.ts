'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { apiClient } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import {
  FarmerFarmSchema,
  FarmerStoreSettingsSchema,
  type CreateFarmerFarmRequest,
  type FarmerFarm,
  type FarmerStoreSettings,
  type UpdateFarmerFarmRequest,
  type UpdateFarmerStoreSettingsRequest,
} from '@/types/api/farmer-management'
import { OfferSchema, type Offer } from '@/types/api/offers'
import { useCurrentUser } from './use-auth'

const FarmerFarmListSchema = z.array(FarmerFarmSchema)
const FarmerOfferListSchema = z.array(OfferSchema)

export function useFarmerOffers() {
  const { data: user } = useCurrentUser()
  const isFarmer = user?.role === 'farmer'

  return useQuery({
    queryKey: ['farmer-management', 'offers', user?.id ?? 'anon'] as const,
    queryFn: () => apiClient<Offer[]>('/api/farmer/offers', FarmerOfferListSchema),
    enabled: isFarmer,
    staleTime: 30 * 1000,
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
