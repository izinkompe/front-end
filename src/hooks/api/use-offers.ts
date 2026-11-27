'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { OfferDetailResponseSchema, OfferListResponseSchema } from '@/lib/api/offer-response'
import { queryKeys } from '@/lib/api/query-keys'
import type { Offer } from '@/types/api/offers'

export function useOffers(filters?: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: queryKeys.offers.list(filters),
    queryFn: () => apiClient<Offer[]>('/api/offers', OfferListResponseSchema, { params: filters }),
    staleTime: 30 * 1000,
  })
}

export function useOfferDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.offers.detail(id),
    queryFn: () => apiClient<Offer>('/api/offers/' + id, OfferDetailResponseSchema),
    enabled: Boolean(id),
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
  })
}

export function useExpiringOffers() {
  return useQuery({
    queryKey: queryKeys.offers.expiringSoon(),
    queryFn: () => apiClient<Offer[]>('/api/offers/expiring-soon', OfferListResponseSchema),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  })
}
