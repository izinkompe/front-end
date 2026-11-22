'use client'

import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { apiClient } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { OfferSchema, type Offer } from '@/types/api/offers'

const OfferListSchema = z.array(OfferSchema)

export function useOffers(filters?: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: queryKeys.offers.list(filters),
    queryFn: () => apiClient<Offer[]>('/api/offers', OfferListSchema, { params: filters }),
    staleTime: 30 * 1000,
  })
}

export function useOfferDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.offers.detail(id),
    queryFn: () => apiClient<Offer>('/api/offers/' + id, OfferSchema),
    enabled: Boolean(id),
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
  })
}

export function useExpiringOffers() {
  return useQuery({
    queryKey: queryKeys.offers.expiringSoon(),
    queryFn: () => apiClient<Offer[]>('/api/offers/expiring-soon', OfferListSchema),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  })
}
