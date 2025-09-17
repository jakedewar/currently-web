import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

interface ProjectData {
  project: {
    id: string
    name: string
    description: string | null
    progress: number
    start_date: string | null
    end_date: string | null
    status: string
    priority: string
    created_at: string | null
    updated_at: string | null
    created_by: string
    organization_id: string
    project_members: Array<{
      id: string
      user_id: string
      role: string
      joined_at: string | null
      project_id: string
      users: {
        id: string
        full_name: string | null
        avatar_url: string | null
      } | null
    }>
    work_items: Array<{
      id: string
      title: string
      description: string | null
      type: string
      status: string
      tool: string | null
      created_at: string | null
      updated_at: string | null
      project_id: string
      created_by: string
    }>
    project_tools: Array<{
      id: string
      tool_name: string
      tool_type: string | null
      connected_at: string | null
      project_id: string
    }>
    activity: Array<never>
  }
  currentUser: {
    id: string
    full_name: string | null
    avatar_url: string | null
    role: string
  }
}

async function fetchProject(projectId: string): Promise<ProjectData> {
  return apiClient.fetch(`/api/projects/${projectId}`, {
    ttl: 1 * 60 * 1000 // 1 minute TTL for API client cache
  })
}

export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => fetchProject(projectId!),
    enabled: !!projectId, // Only fetch when projectId is available
    staleTime: 1 * 60 * 1000, // 1 minute - individual projects can change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  })
}
