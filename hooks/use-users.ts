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

// New hook for fetching individual user data that can be shared across components
export function useUserById(userId: string | undefined, organizationId: string | undefined) {
  return useQuery({
    queryKey: ['user', userId, organizationId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}?organizationId=${organizationId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch user')
      }
      return response.json()
    },
    enabled: !!userId && !!organizationId,
    staleTime: 10 * 60 * 1000, // 10 minutes - user profiles change less frequently
    gcTime: 30 * 60 * 1000, // 30 minutes cache
  })
}

// Hook to get user data from the users list cache
export function useUserFromList(userId: string | undefined, organizationId: string | undefined) {
  const { data: usersData } = useUsers(organizationId, 1, 100) // Fetch more users to increase cache hit rate
  
  if (!userId || !usersData) {
    return { data: null, isLoading: false, error: null }
  }
  
  const user = usersData.users.find(u => u.id === userId)
  return { 
    data: user || null, 
    isLoading: false, 
    error: null 
  }
}
