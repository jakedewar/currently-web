import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export interface DatabaseHelpers {
  supabase: Awaited<ReturnType<typeof createClient>>
  user: {
    id: string
    user_metadata?: {
      full_name?: string | null
      avatar_url?: string | null
    }
  }
}

/**
 * Get authenticated user and verify they exist
 */
export async function getAuthenticatedUser(): Promise<DatabaseHelpers | NextResponse> {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  return { supabase, user }
}

/**
 * Verify user has access to an organization
 */
export async function verifyOrganizationAccess(
  userId: string, 
  organizationId: string
): Promise<{ role: string } | NextResponse> {
  const supabase = await createClient()
  
  const { data: membership, error: membershipError } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .single()

  if (membershipError || !membership) {
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    )
  }

  return { role: membership.role }
}

/**
 * Batch fetch user profiles by IDs
 */
export async function batchFetchUserProfiles(userIds: string[]) {
  if (userIds.length === 0) return { data: null }
  
  const supabase = await createClient()
  return await supabase
    .from('users')
    .select('id, full_name, avatar_url, department, location, timezone')
    .in('id', userIds)
}

/**
 * Batch fetch organization members with user profiles
 */
export async function batchFetchOrganizationMembers(organizationId: string, offset = 0, limit = 10) {
  const supabase = await createClient()
  return await supabase
    .from('organization_members')
    .select(`
      user_id,
      role,
      joined_at,
      users (
        id,
        full_name,
        avatar_url,
        department,
        location,
        timezone
      )
    `, { count: 'exact' })
    .eq('organization_id', organizationId)
    .range(offset, offset + limit - 1)
}

/**
 * Batch fetch stream-related data in parallel
 */
export async function batchFetchStreamData(streamIds: string[]) {
  if (streamIds.length === 0) {
    return {
      streamMembers: [],
      workItems: [],
      streamTools: []
    }
  }

  const supabase = await createClient()
  
  const [
    { data: streamMembers },
    { data: workItems },
    { data: streamTools }
  ] = await Promise.all([
    supabase
      .from('stream_members')
      .select('id, user_id, role, joined_at, stream_id')
      .in('stream_id', streamIds),
    supabase
      .from('work_items')
      .select(`
        id,
        title,
        description,
        type,
        status,
        tool,
        created_at,
        updated_at,
        stream_id,
        created_by
      `)
      .in('stream_id', streamIds),
    supabase
      .from('stream_tools')
      .select(`
        id,
        tool_name,
        tool_type,
        connected_at,
        stream_id
      `)
      .in('stream_id', streamIds)
  ])

  return { streamMembers, workItems, streamTools }
}
