import { Database } from './types'

export type Project = Database['public']['Tables']['projects']['Row']

export interface CreateProjectWithOwnerResponse {
  project: Project
}

export interface CreateProjectWithOwnerParams {
  p_name: string
  p_description: string | null
  p_priority: string | null
  p_status: string | null
  p_organization_id: string
  p_user_id: string
}
