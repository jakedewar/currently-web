import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/api/streams/[id]'>
): Promise<NextResponse> {
  try {
    const { id: streamId } = await ctx.params
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's organizations (allow multiple organizations)
    const { data: userOrgs } = await supabase
      .from('organization_members')
      .select(`
        organization_id,
        role,
        organizations (
          id,
          name,
          slug
        )
      `)
      .eq('user_id', user.id)

    if (!userOrgs || userOrgs.length === 0) {
      return NextResponse.json(
        { error: 'User is not a member of any organization' },
        { status: 403 }
      )
    }

    // Get stream data with all related information
    const { data: stream } = await supabase
      .from('streams')
      .select(`
        id,
        name,
        description,
        progress,
        start_date,
        end_date,
        status,
        priority,
        created_at,
        updated_at,
        created_by,
        organization_id
      `)
      .eq('id', streamId)
      .single()

    if (!stream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      )
    }

    // Check if user has access to the stream (either as member or through organization)
    const { data: streamMember } = await supabase
      .from('stream_members')
      .select('role')
      .eq('stream_id', streamId)
      .eq('user_id', user.id)
      .single()

    // Check if user is member of the organization that owns this stream
    const userHasAccessToStreamOrg = userOrgs.some(org => org.organization_id === stream.organization_id)
    
    if (!userHasAccessToStreamOrg) {
      return NextResponse.json(
        { error: 'User does not have access to this stream' },
        { status: 403 }
      )
    }

    // Get stream members first
    const { data: streamMembers, error: streamMembersError } = await supabase
      .from('stream_members')
      .select(`
        id,
        user_id,
        role,
        joined_at,
        stream_id
      `)
      .eq('stream_id', streamId)

    if (streamMembersError) {
      console.error('Error fetching stream members:', streamMembersError)
    }

    // Get user details for the members
    let streamMembersWithUsers: Array<{
      id: string;
      user_id: string;
      role: string;
      joined_at: string | null;
      stream_id: string;
      users: {
        id: string;
        full_name: string | null;
        avatar_url: string | null;
      } | null;
    }> = []
    
    if (streamMembers && streamMembers.length > 0) {
      const userIds = streamMembers.map(member => member.user_id)
      
      // Get user profiles from the users table
      const { data: userProfiles, error: userProfilesError } = await supabase
        .from('users')
        .select('id, full_name, avatar_url')
        .in('id', userIds)

      if (userProfilesError) {
        console.error('Error fetching user profiles:', userProfilesError)
      }

      // Combine stream members with user data
      streamMembersWithUsers = streamMembers.map(member => ({
        ...member,
        users: userProfiles?.find(user => user.id === member.user_id) || null
      }))
    }

    // Get work items (show to all organization members)
    let workItems: Array<{
      id: string;
      title: string;
      description: string | null;
      type: string;
      status: string;
      tool: string | null;
      url: string | null;
      assignee_id: string | null;
      due_date: string | null;
      priority: string | null;
      estimated_hours: number | null;
      actual_hours: number | null;
      parent_task_id: string | null;
      order_index: number | null;
      created_at: string | null;
      updated_at: string | null;
      stream_id: string;
      created_by: string;
    }> = []
    
    const { data: workItemsData } = await supabase
      .from('work_items')
      .select(`
        id,
        title,
        description,
        type,
        status,
        tool,
        url,
        assignee_id,
        due_date,
        priority,
        estimated_hours,
        actual_hours,
        parent_task_id,
        order_index,
        created_at,
        updated_at,
        stream_id,
        created_by
      `)
      .eq('stream_id', streamId)
      .order('created_at', { ascending: false })
    
    workItems = workItemsData || []

    // Get stream tools (show to all organization members)
    let streamTools: Array<{
      id: string;
      tool_name: string;
      tool_type: string | null;
      connected_at: string | null;
      stream_id: string;
    }> = []
    
    const { data: streamToolsData } = await supabase
      .from('stream_tools')
      .select(`
        id,
        tool_name,
        tool_type,
        connected_at,
        stream_id
      `)
      .eq('stream_id', streamId)
    
    streamTools = streamToolsData || []

    // Get stream activity (we'll implement this later)
    const streamActivity: Array<never> = []

    return NextResponse.json({
      stream: {
        ...stream,
        stream_members: streamMembersWithUsers,
        work_items: workItems,
        stream_tools: streamTools,
        activity: streamActivity,
      },
      currentUser: {
        id: user.id,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        role: streamMember?.role || 'non_member',
      },
    })
  } catch (error) {
    console.error('Error in GET /api/streams/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<'/api/streams/[id]'>
): Promise<NextResponse> {
  try {
    const { id: streamId } = await ctx.params
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, status } = body

    // Get stream details
    const { data: stream, error: streamError } = await supabase
      .from('streams')
      .select(`
        id,
        organization_id,
        created_by
      `)
      .eq('id', streamId)
      .single()

    if (streamError || !stream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      )
    }

    // Check if user is member of the organization
    const { data: userOrgs } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', stream.organization_id)
      .eq('user_id', user.id)

    if (!userOrgs || userOrgs.length === 0) {
      return NextResponse.json(
        { error: 'User is not a member of this organization' },
        { status: 403 }
      )
    }

    const orgMember = userOrgs[0] // Use the first membership if multiple exist

    if (action === 'join') {
      // Check if user is already a member of the stream
      const { data: existingMember } = await supabase
        .from('stream_members')
        .select('id')
        .eq('stream_id', streamId)
        .eq('user_id', user.id)
        .single()

      if (existingMember) {
        return NextResponse.json(
          { error: 'User is already a member of this stream' },
          { status: 400 }
        )
      }

      // Add user to stream as member
      const { data: newMember, error: joinError } = await supabase
        .from('stream_members')
        .insert({
          stream_id: streamId,
          user_id: user.id,
          role: 'member',
          joined_at: new Date().toISOString()
        })
        .select()
        .single()

      if (joinError) {
        console.error('Error joining stream:', joinError)
        return NextResponse.json(
          { error: 'Failed to join stream' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'Successfully joined stream',
        member: newMember
      })
    }

    if (action === 'update_status' && status) {
      // Only stream owner or organization admin can update status
      const { data: streamMember } = await supabase
        .from('stream_members')
        .select('role')
        .eq('stream_id', streamId)
        .eq('user_id', user.id)
        .single()

      const canUpdate = stream.created_by === user.id || 
                       orgMember.role === 'admin' || 
                       orgMember.role === 'owner' ||
                       streamMember?.role === 'admin'

      if (!canUpdate) {
        return NextResponse.json(
          { error: 'Insufficient permissions to update stream status' },
          { status: 403 }
        )
      }

      // Update stream status
      const { data: updatedStream, error: updateError } = await supabase
        .from('streams')
        .update({ status })
        .eq('id', streamId)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating stream:', updateError)
        return NextResponse.json(
          { error: 'Failed to update stream' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'Stream status updated successfully',
        stream: updatedStream
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in PATCH /api/streams/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
