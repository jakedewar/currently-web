import { Database } from './types'

export type Stream = Database['public']['Tables']['streams']['Row']

export interface CreateStreamWithOwnerResponse {
  stream: Stream
}

export interface CreateStreamWithOwnerParams {
  p_name: string
  p_description: string | null
  p_priority: string | null
  p_status: string | null
  p_organization_id: string
  p_user_id: string
}
