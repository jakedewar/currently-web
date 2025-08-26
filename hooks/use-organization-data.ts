import { useOrganization } from "@/components/organization-provider"
import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"

// Example hook for fetching organization-specific data
export function useOrganizationData<T>(fetcher: (orgId: string) => Promise<T>) {
  const { currentOrganization } = useOrganization()
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!currentOrganization) {
      setData(null)
      return
    }

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const result = await fetcher(currentOrganization.id)
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch data'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentOrganization, fetcher])

  return { data, loading, error, organization: currentOrganization }
}

// Hook to invalidate queries when organization changes
export function useOrganizationQueryInvalidation() {
  const { currentOrganization } = useOrganization()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (currentOrganization) {
      // Invalidate all organization-specific queries
      queryClient.invalidateQueries({ queryKey: ['streams'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  }, [currentOrganization, queryClient])
}

// New hook for organization membership validation that can be shared
export function useOrganizationMembership(organizationId: string | undefined) {
  const { currentOrganization } = useOrganization()
  
  // If we're already in the context of an organization, use that
  if (currentOrganization?.id === organizationId && currentOrganization) {
    return {
      data: { role: currentOrganization.role },
      isLoading: false,
      error: null
    }
  }
  
  // Otherwise, this would need to be implemented as a separate API call
  // but we can optimize by checking if the user is already a member of any organization
  return {
    data: null,
    isLoading: false,
    error: new Error('Organization membership validation not implemented')
  }
}

// Hook to prefetch organization data
export function useOrganizationPrefetch() {
  const { currentOrganization } = useOrganization()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (currentOrganization) {
      // Prefetch common data when organization changes
      queryClient.prefetchQuery({
        queryKey: ['streams', currentOrganization.id],
        queryFn: () => fetch(`/api/streams?organizationId=${currentOrganization.id}`).then(res => res.json()),
        staleTime: 2 * 60 * 1000,
      })
      
      queryClient.prefetchQuery({
        queryKey: ['dashboard', currentOrganization.id],
        queryFn: () => fetch(`/api/dashboard?organizationId=${currentOrganization.id}`).then(res => res.json()),
        staleTime: 5 * 60 * 1000,
      })
    }
  }, [currentOrganization, queryClient])
}

// Example usage:
// const { data: projects, loading, error } = useOrganizationData(
//   (orgId) => fetchProjects(orgId)
// )
