import { useQuery } from '@tanstack/react-query'
import type { StreamsData } from '@/lib/data/streams'

async function fetchStreams(organizationId: string): Promise<StreamsData> {
  const response = await fetch(`/api/streams?organizationId=${organizationId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch streams')
  }
  return response.json()
}

export function useStreams(organizationId: string | undefined) {
  return useQuery({
    queryKey: ['streams', organizationId],
    queryFn: () => fetchStreams(organizationId!),
    enabled: !!organizationId, // Only fetch when organizationId is available
    staleTime: 2 * 60 * 1000, // 2 minutes - streams can change frequently
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    // Add refetch interval for real-time updates
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    refetchIntervalInBackground: false, // Only refetch when tab is active
  })
}

// New hook for individual stream that leverages the streams list cache
export function useStreamFromList(streamId: string | undefined, organizationId: string | undefined) {
  const { data: streamsData } = useStreams(organizationId)
  
  if (!streamId || !streamsData) {
    return { data: null, isLoading: false, error: null }
  }
  
  const stream = streamsData.streams.find(s => s.id === streamId)
  return { 
    data: stream ? { stream, currentUser: streamsData.currentUser } : null, 
    isLoading: false, 
    error: null 
  }
}
