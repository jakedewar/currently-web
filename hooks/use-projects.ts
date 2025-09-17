import { useQuery } from '@tanstack/react-query'
import type { ProjectsData } from '@/lib/data/projects'
import { apiClient } from '@/lib/api-client'

async function fetchProjects(organizationId: string): Promise<ProjectsData> {
  return apiClient.fetch('/api/projects', { 
    params: { organizationId },
    ttl: 2 * 60 * 1000 // 2 minutes TTL for API client cache
  })
}

export function useProjects(organizationId: string | undefined) {
  return useQuery({
    queryKey: ['projects', organizationId],
    queryFn: () => fetchProjects(organizationId!),
    enabled: !!organizationId, // Only fetch when organizationId is available
    staleTime: 2 * 60 * 1000, // 2 minutes - projects can change frequently
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    // Add refetch interval for real-time updates
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    refetchIntervalInBackground: false, // Only refetch when tab is active
  })
}

// New hook for individual project that leverages the projects list cache
export function useProjectFromList(projectId: string | undefined, organizationId: string | undefined) {
  const { data: projectsData } = useProjects(organizationId)
  
  if (!projectId || !projectsData) {
    return { data: null, isLoading: false, error: null }
  }
  
  const project = projectsData.projects.find(p => p.id === projectId)
  return { 
    data: project ? { project, currentUser: projectsData.currentUser } : null, 
    isLoading: false, 
    error: null 
  }
}
