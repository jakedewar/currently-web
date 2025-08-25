import { useQuery } from '@tanstack/react-query'

interface UserProfile {
  id: string
  full_name: string | null
  avatar_url: string | null
  department: string | null
  location: string | null
  timezone: string | null
}

async function fetchUser(): Promise<UserProfile> {
  const response = await fetch('/api/users/me')
  if (!response.ok) {
    throw new Error('Failed to fetch user')
  }
  return response.json()
}

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
    staleTime: 10 * 60 * 1000, // 10 minutes - user data doesn't change often
    gcTime: 30 * 60 * 1000, // 30 minutes cache
  })
}
