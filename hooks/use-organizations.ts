import { useQuery } from '@tanstack/react-query'

interface ApiError {
  status?: number
  message?: string
}

interface Organization {
  id: string
  name: string
  slug: string
  avatar_url?: string
  role: "owner" | "admin" | "member"
}

interface OrganizationsResponse {
  organizations: Organization[]
}

async function fetchOrganizations(): Promise<OrganizationsResponse> {
  const response = await fetch('/api/users/me/organizations')
  if (!response.ok) {
    throw new Error('Failed to fetch organizations')
  }
  return response.json()
}

export function useOrganizations() {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: fetchOrganizations,
    staleTime: 10 * 60 * 1000, // 10 minutes - organizations don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    retry: (failureCount, error) => {
      // Don't retry on 401 errors (authentication issues)
      if ((error as ApiError)?.status === 401) {
        return false
      }
      return failureCount < 1
    },
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount if data is fresh
  })
}
