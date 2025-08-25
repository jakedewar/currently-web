import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const streamId = params.id
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's organization
    const { data: userOrg } = await supabase
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
      .single()

    if (!userOrg) {
      return NextResponse.json(
        { error: 'User is not a member of any organization' },
        { status: 403 }
      )
    }

    // Check if user has access to the stream
    const { data: streamMember } = await supabase
      .from('stream_members')
      .select('role')
      .eq('stream_id', streamId)
      .eq('user_id', user.id)
      .single()

    if (!streamMember) {
      return NextResponse.json(
        { error: 'User does not have access to this stream' },
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

    // Get stream members with user details
    const { data: streamMembers } = await supabase
      .from('stream_members')
      .select(`
        id,
        user_id,
        role,
        joined_at,
        stream_id,
        users (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('stream_id', streamId)

    // Get work items
    const { data: workItems } = await supabase
      .from('work_items')
      .select(`
        id,
        title,
        description,
        type,
        status,
        url,
        created_at,
        updated_at,
        stream_id,
        created_by
      `)
      .eq('stream_id', streamId)
      .order('created_at', { ascending: false })

    // Get stream tools
    const { data: streamTools } = await supabase
      .from('stream_tools')
      .select(`
        id,
        tool_name,
        tool_type,
        connected_at,
        stream_id
      `)
      .eq('stream_id', streamId)

    // Get stream activity (we'll implement this later)
    const streamActivity: Array<never> = []

    return NextResponse.json({
      stream: {
        ...stream,
        stream_members: streamMembers || [],
        work_items: workItems || [],
        stream_tools: streamTools || [],
        activity: streamActivity,
      },
      currentUser: {
        id: user.id,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        role: streamMember.role,
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
