import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params to fix the Next.js warning
    const { id: userId } = await params
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')

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

    // Verify current user has access to the requested organization
    const { data: currentUserAccesses } = await supabase
      .from('organization_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)

    if (!currentUserAccesses || currentUserAccesses.length === 0) {
      return NextResponse.json(
        { error: 'No access to this organization' },
        { status: 403 }
      )
    }

    // Verify requested user is a member of the organization
    const { data: memberCheck, error: memberError } = await supabase
      .from('organization_members')
      .select('role, joined_at')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .single()

    if (memberError || !memberCheck) {
      return NextResponse.json(
        { error: 'User not found in organization' },
        { status: 404 }
      )
    }

    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, full_name, avatar_url, department, location, timezone')
      .eq('id', userId)
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ...profile,
      organization_role: memberCheck.role,
      joined_at: memberCheck.joined_at
    })
  } catch (error) {
    console.error('Error in /api/users/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}