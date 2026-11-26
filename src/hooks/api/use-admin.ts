'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { apiClient } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import {
  AdminFarmerItemSchema,
  AdminOfferModerationItemSchema,
  AdminUserItemSchema,
  CarbonFactorSchema,
  DistributionStatsSchema,
  type AdminFarmerItem,
  type AdminOfferModerationItem,
  type AdminUserItem,
  type CarbonFactor,
  type DistributionStats,
} from '@/types/api/admin'
import { useCurrentUser } from './use-auth'

export function useDistributionStats() {
  const { data: user } = useCurrentUser()
  return useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: () =>
      apiClient<DistributionStats>('/api/admin/stats/distribution', DistributionStatsSchema),
    enabled: user?.role === 'admin',
    staleTime: 60 * 1000,
  })
}

export function useCarbonFactors() {
  const { data: user } = useCurrentUser()
  return useQuery({
    queryKey: queryKeys.admin.carbonFactors,
    queryFn: () =>
      apiClient<CarbonFactor[]>('/api/admin/stats/carbon-factors', z.array(CarbonFactorSchema)),
    enabled: user?.role === 'admin',
    staleTime: 5 * 60 * 1000,
  })
}

export function useAdminFarmers() {
  const { data: user } = useCurrentUser()
  return useQuery({
    queryKey: ['admin', 'farmers'] as const,
    queryFn: () =>
      apiClient<AdminFarmerItem[]>('/api/admin/farmers', z.array(AdminFarmerItemSchema)),
    enabled: user?.role === 'admin',
    staleTime: 30 * 1000,
  })
}

export function useVerifyAdminFarmer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ farmerId, isVerifiedFarmer }: { farmerId: string; isVerifiedFarmer: boolean }) =>
      apiClient<AdminFarmerItem>(
        `/api/admin/farmers/${encodeURIComponent(farmerId)}/verify`,
        AdminFarmerItemSchema,
        {
          method: 'PATCH',
          body: JSON.stringify({ isVerifiedFarmer }),
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'farmers'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useAdminOffers() {
  const { data: user } = useCurrentUser()
  return useQuery({
    queryKey: ['admin', 'offers'] as const,
    queryFn: () =>
      apiClient<AdminOfferModerationItem[]>(
        '/api/admin/offers',
        z.array(AdminOfferModerationItemSchema)
      ),
    enabled: user?.role === 'admin',
    staleTime: 30 * 1000,
  })
}

export function useModerateAdminOffer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ offerId, status }: { offerId: string; status: 'active' | 'closed' }) =>
      apiClient<AdminOfferModerationItem>(
        `/api/admin/offers/${encodeURIComponent(offerId)}/status`,
        AdminOfferModerationItemSchema,
        {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'offers'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.offers.all })
    },
  })
}

export function useAdminUsers() {
  const { data: user } = useCurrentUser()
  return useQuery({
    queryKey: ['admin', 'users'] as const,
    queryFn: () => apiClient<AdminUserItem[]>('/api/admin/users', z.array(AdminUserItemSchema)),
    enabled: user?.role === 'admin',
    staleTime: 30 * 1000,
  })
}
