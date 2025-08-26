import { QueryClient } from '@tanstack/react-query'

interface ApiError {
  status?: number
  message?: string
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
      gcTime: 15 * 60 * 1000, // 15 minutes - cache garbage collection (increased from 10)
      retry: (failureCount, error) => {
        // Don't retry on 401 errors (authentication issues)
        if ((error as ApiError)?.status === 401) {
          return false
        }
        return failureCount < 1 // Only retry once for other errors
      },
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnReconnect: true, // Refetch when reconnecting to network
      refetchOnMount: false, // Don't refetch on mount if data is fresh
    },
    mutations: {
      retry: 1, // Only retry mutations once
    },
  },
})
