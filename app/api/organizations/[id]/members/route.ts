import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: organizationId } = await params

    // Get current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is a member of the organization
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get all members of the organization
    const { data: members, error: membersError } = await supabase
      .from('organization_members')
      .select(`
        role,
        joined_at,
        user_id
      `)
      .eq('organization_id', organizationId)

    if (membersError) {
      return NextResponse.json(
        { error: 'Failed to fetch members' },
        { status: 500 }
      )
    }

    // Batch fetch user details for all members
    const userIds = members?.map(member => member.user_id) || []
    const { data: userProfiles, error: userError } = await supabase
      .from('users')
      .select('id, full_name, avatar_url')
      .in('id', userIds)

    if (userError) {
      return NextResponse.json(
        { error: 'Failed to fetch user profiles' },
        { status: 500 }
      )
    }

    // Transform the data to match the expected format
    const transformedMembers = members?.map(member => {
      const userProfile = userProfiles?.find(user => user.id === member.user_id)
      return {
        id: member.user_id,
        full_name: userProfile?.full_name,
        avatar_url: userProfile?.avatar_url,
        email: 'Email not available', // Email is in auth.users, not users table
        role: member.role,
        joined_at: member.joined_at
      }
    }) || []

    return NextResponse.json({ members: transformedMembers })
  } catch (error) {
    console.error('Error in /api/organizations/[id]/members:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: organizationId } = await params
    const { email, role = 'member' } = await request.json()

    // Get current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has admin/owner permissions
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!['owner', 'admin', 'member'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Find user by email
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (userError || !targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user is already a member
    const { data: existingMember, error: existingError } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('user_id', targetUser.id)
      .single()

    if (existingError && existingError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Failed to check existing membership' },
        { status: 500 }
      )
    }

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this organization' },
        { status: 409 }
      )
    }

    // Add user to organization
    const { error: addError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: organizationId,
        user_id: targetUser.id,
        role,
      })

    if (addError) {
      return NextResponse.json(
        { error: 'Failed to add user to organization' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'User added to organization successfully' 
    })
  } catch (error) {
    console.error('Error in /api/organizations/[id]/members POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
