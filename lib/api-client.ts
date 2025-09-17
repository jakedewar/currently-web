// Shared API client with caching to reduce redundant API calls
class ApiClient {
  private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>()

  private getCacheKey(endpoint: string, params?: Record<string, unknown>): string {
    if (!params || Object.keys(params).length === 0) {
      return endpoint
    }
    
    // Sort parameters to ensure consistent cache keys regardless of order
    const sortedParams = Object.keys(params).sort().reduce((acc, key) => {
      acc[key] = params[key]
      return acc
    }, {} as Record<string, unknown>)
    
    const paramString = JSON.stringify(sortedParams)
    return `${endpoint}${paramString}`
  }

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key)
    if (!cached) return false
    
    const now = Date.now()
    return (now - cached.timestamp) < cached.ttl
  }

  async fetch<T>(endpoint: string, options?: Omit<RequestInit, 'cache'> & { 
    cache?: boolean; 
    ttl?: number; 
    params?: Record<string, unknown> 
  }): Promise<T> {
    const { cache: useCache = true, ttl = 5 * 60 * 1000, params, ...fetchOptions } = options || {}
    const cacheKey = this.getCacheKey(endpoint, params)
    
    // Check cache first
    if (useCache && this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data as T
    }

    // Build URL with params
    const url = new URL(endpoint, window.location.origin)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })
    }

    const response = await fetch(url.toString(), {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    const data = await response.json()

    // Cache the result
    if (useCache) {
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl,
      })
    }

    return data
  }

  // Clear cache for specific endpoint or all cache
  clearCache(endpoint?: string) {
    if (endpoint) {
      for (const key of this.cache.keys()) {
        if (key.startsWith(endpoint)) {
          this.cache.delete(key)
        }
      }
    } else {
      this.cache.clear()
    }
  }

  // Prefetch data for better UX
  async prefetch<T>(endpoint: string, params?: Record<string, unknown>): Promise<void> {
    try {
      await this.fetch<T>(endpoint, { params, cache: true })
    } catch (error) {
      // Silently fail prefetch requests
      console.warn('Prefetch failed:', error)
    }
  }
}

export const apiClient = new ApiClient()

// Convenience methods for common API calls
export const api = {
  projects: {
    list: (organizationId: string) => 
      apiClient.fetch('/api/projects', { params: { organizationId } }),
    get: (projectId: string) => 
      apiClient.fetch(`/api/projects/${projectId}`),
    create: (data: Record<string, unknown>) => 
      apiClient.fetch('/api/projects', { 
        method: 'POST', 
        body: JSON.stringify(data),
        cache: false 
      }),
  },
  dashboard: {
    get: (organizationId: string) => 
      apiClient.fetch('/api/dashboard', { params: { organizationId } }),
  },
  users: {
    list: (organizationId: string, page = 1, limit = 10) => 
      apiClient.fetch('/api/users', { 
        params: { organizationId, page, limit } 
      }),
    get: (userId: string, organizationId: string) => 
      apiClient.fetch(`/api/users/${userId}`, { 
        params: { organizationId } 
      }),
  },
  organizations: {
    list: () => 
      apiClient.fetch('/api/users/me/organizations'),
  },
}
