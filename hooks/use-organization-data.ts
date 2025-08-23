import { useOrganization } from "@/components/organization-provider"
import { useEffect, useState } from "react"

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

// Example usage:
// const { data: projects, loading, error } = useOrganizationData(
//   (orgId) => fetchProjects(orgId)
// )
