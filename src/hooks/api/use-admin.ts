'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { DistributionStatsSchema, type DistributionStats } from '@/types/api/admin'

export function useDistributionStats() {
  return useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: () =>
      apiClient<DistributionStats>('/api/admin/stats/distribution', DistributionStatsSchema),
    staleTime: 60 * 1000,
  })
}
