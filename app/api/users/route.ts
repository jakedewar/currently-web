import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user has access to the requested organization
    const { data: orgMemberships } = await supabase
      .from('organization_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)

    if (!orgMemberships || orgMemberships.length === 0) {
      return NextResponse.json(
        { error: 'No access to this organization' },
        { status: 403 }
      )
    }

    // Get organization members
    const { data: memberships, error: membersError, count } = await supabase
      .from('organization_members')
      .select('user_id, role, joined_at', { count: 'exact' })
      .eq('organization_id', organizationId)
      .range(offset, offset + limit - 1)

    if (membersError) {
      return NextResponse.json(
        { error: 'Failed to fetch organization members' },
        { status: 500 }
      )
    }

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({
        users: [],
        total: 0,
        page,
        limit
      })
    }

    // Get user profiles for all members
    const userIds = memberships.map(m => m.user_id)
    const { data: userProfiles, error: profileError } = await supabase
      .from('users')
      .select('id, full_name, avatar_url, department, location, timezone')
      .in('id', userIds)

    if (profileError) {
      return NextResponse.json(
        { error: 'Failed to fetch user profiles' },
        { status: 500 }
      )
    }

    // Combine membership and profile data
    const users = memberships.map(membership => {
      const profile = userProfiles?.find(p => p.id === membership.user_id)
      return {
        id: profile?.id,
        full_name: profile?.full_name,
        avatar_url: profile?.avatar_url,
        department: profile?.department,
        location: profile?.location,
        timezone: profile?.timezone,
        organization_role: membership.role,
        joined_at: membership.joined_at
      }
    })

    return NextResponse.json({
      users,
      total: count,
      page,
      limit
    })
  } catch (error) {
    console.error('Error in /api/users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}