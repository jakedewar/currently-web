import { useQuery } from '@tanstack/react-query'
import type { DashboardData } from '@/lib/data/dashboard'

async function fetchDashboardData(organizationId: string): Promise<DashboardData> {
  const response = await fetch(`/api/dashboard?organizationId=${organizationId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data')
  }
  return response.json()
}

export function useDashboardData(organizationId: string | undefined) {
  return useQuery({
    queryKey: ['dashboard', organizationId],
    queryFn: () => fetchDashboardData(organizationId!),
    enabled: !!organizationId, // Only fetch when organizationId is available
    staleTime: 5 * 60 * 1000, // 5 minutes - dashboard data can be cached longer
    gcTime: 15 * 60 * 1000, // 15 minutes cache
  })
}
