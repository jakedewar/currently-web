import { useQuery } from '@tanstack/react-query'

interface User {
  id: string
  full_name: string | null
  avatar_url: string | null
  department: string | null
  location: string | null
  timezone: string | null
  organization_role: string
  joined_at: string | null
}

interface UsersData {
  users: User[]
  total: number
  page: number
  limit: number
}

async function fetchUsers(organizationId: string, page: number = 1, limit: number = 10): Promise<UsersData> {
  const response = await fetch(`/api/users?organizationId=${organizationId}&page=${page}&limit=${limit}`)
  if (!response.ok) {
    throw new Error('Failed to fetch users')
  }
  return response.json()
}

export function useUsers(organizationId: string | undefined, page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ['users', organizationId, page, limit],
    queryFn: () => fetchUsers(organizationId!, page, limit),
    enabled: !!organizationId, // Only fetch when organizationId is available
    staleTime: 5 * 60 * 1000, // 5 minutes - user data doesn't change often
    gcTime: 15 * 60 * 1000, // 15 minutes cache
  })
}
