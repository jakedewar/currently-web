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
  }, [currentOrganization?.id, fetcher])

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
  }, [currentOrganization?.id, queryClient])
}

// Example usage:
// const { data: projects, loading, error } = useOrganizationData(
//   (orgId) => fetchProjects(orgId)
// )
