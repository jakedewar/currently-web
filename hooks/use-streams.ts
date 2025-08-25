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
  })
}
