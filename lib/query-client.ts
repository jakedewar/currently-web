import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - cache garbage collection
      retry: (failureCount, error) => {
        // Don't retry on 401 errors (authentication issues)
        if ((error as { status?: number })?.status === 401) {
          return false
        }
        return failureCount < 1 // Only retry once for other errors
      },
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnReconnect: true, // Refetch when reconnecting to network
    },
    mutations: {
      retry: 1, // Only retry mutations once
    },
  },
})
