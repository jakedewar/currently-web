import { useQuery } from '@tanstack/react-query'

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
    staleTime: 5 * 60 * 1000, // 5 minutes - organizations might change
    gcTime: 15 * 60 * 1000, // 15 minutes cache
    retry: (failureCount, error) => {
      // Don't retry on 401 errors (authentication issues)
      if ((error as any)?.status === 401) {
        return false
      }
      return failureCount < 1
    },
  })
}
