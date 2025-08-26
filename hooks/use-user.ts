import { useQuery } from '@tanstack/react-query'

interface ApiError {
  status?: number
  message?: string
}

interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

async function fetchUser(): Promise<User> {
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
