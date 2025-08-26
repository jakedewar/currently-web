import { useQuery } from '@tanstack/react-query'
import type { DashboardData } from '@/lib/data/dashboard'
import { apiClient } from '@/lib/api-client'

async function fetchDashboardData(organizationId: string): Promise<DashboardData> {
  return apiClient.fetch('/api/dashboard', { 
    params: { organizationId },
    ttl: 5 * 60 * 1000 // 5 minutes TTL for API client cache
  })
}

export function useDashboardData(organizationId: string | undefined) {
  return useQuery({
    queryKey: ['dashboard', organizationId],
    queryFn: () => fetchDashboardData(organizationId!),
    enabled: !!organizationId, // Only fetch when organizationId is available
    staleTime: 5 * 60 * 1000, // 5 minutes - dashboard data can be cached longer
    gcTime: 15 * 60 * 1000, // 15 minutes cache
    // Reduce refetch frequency for dashboard data
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes instead of every minute
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
