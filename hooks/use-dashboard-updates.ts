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
    // Reduce refetch frequency for dashboard data
    refetchInterval: 60 * 1000, // Refetch every minute instead of every 30 seconds
    refetchIntervalInBackground: false,
  })
}

// New hook that combines dashboard data with streams data to reduce API calls
export function useOptimizedDashboardData(organizationId: string | undefined) {
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useDashboardData(organizationId)
  
  return {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
    // Add derived data that could come from other hooks
    derivedStats: dashboardData ? {
      ...dashboardData.stats,
      // Additional stats that could be calculated from streams data
      totalStreams: dashboardData.streams.length,
      completedWorkItems: dashboardData.workItems.filter(item => item.status === 'completed').length,
    } : null
  }
}
