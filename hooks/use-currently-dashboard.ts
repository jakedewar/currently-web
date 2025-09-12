import { useQuery } from '@tanstack/react-query'
import type { CurrentlyDashboardData } from '@/lib/data/currently-dashboard'
import { apiClient } from '@/lib/api-client'

async function fetchCurrentlyDashboardData(organizationId: string): Promise<CurrentlyDashboardData> {
  return apiClient.fetch('/api/currently-dashboard', { 
    params: { organizationId },
    ttl: 2 * 60 * 1000 // 2 minutes TTL for more frequent updates
  })
}

export function useCurrentlyDashboardData(organizationId: string | undefined) {
  return useQuery({
    queryKey: ['currently-dashboard', organizationId],
    queryFn: () => fetchCurrentlyDashboardData(organizationId!),
    enabled: !!organizationId,
    staleTime: 2 * 60 * 1000, // 2 minutes - more frequent updates for personal dashboard
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchInterval: 60 * 1000, // Refetch every minute for real-time feel
    refetchIntervalInBackground: false,
  })
}
