import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { CreateStreamSchema } from '@/lib/schemas/streams'
import { Redis } from '@upstash/redis'

// Define types that match the actual query results
type StreamResult = {
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
}

type StreamMemberResult = {
  id: string
  user_id: string
  role: string
  joined_at: string | null
  stream_id: string
}

type WorkItemResult = {
  id: string
  title: string
  description: string | null
  type: string
  status: string
  tool: string | null
  created_at: string | null
  updated_at: string | null
  stream_id: string
  created_by: string
}

type StreamToolResult = {
  id: string
  tool_name: string
  tool_type: string | null
  connected_at: string | null
  stream_id: string
}

type UserResult = {
  id: string
  full_name: string | null
  avatar_url: string | null
}

// Initialize Redis for rate limiting (if configured)
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN
    })
  : null

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate request body against schema
    console.log('Received stream data:', body);
    const result = CreateStreamSchema.safeParse(body)
    if (!result.success) {
      console.log('Validation errors:', result.error.issues);
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.issues },
        { status: 400 }
      )
    }

    const { name, description, emoji, priority, status, organization_id, start_date, end_date } = result.data

    // Check rate limit if Redis is configured
    if (redis) {
      try {
        const rateLimitKey = `stream_create:${user.id}`
        const currentCount = await redis.incr(rateLimitKey)
        if (currentCount === 1) {
          await redis.expire(rateLimitKey, 60) // Set 60 second expiry
        }
        if (currentCount > 10) {
          return NextResponse.json(
            { error: 'Rate limit exceeded. Please try again in a minute.' },
            { status: 429 }
          )
        }
      } catch (error) {
        // Log rate limiting error but don't block the request
        console.warn('Rate limiting failed:', error)
      }
    }

    // Check if user is member of the organization
    const { data: orgMembers } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organization_id)
      .eq('user_id', user.id)

    if (!orgMembers || orgMembers.length === 0) {
      return NextResponse.json(
        { error: 'User is not a member of this organization' },
        { status: 403 }
      )
    }

    try {
      // Create the stream and add creator as owner using our custom function
      // Create the stream - member creation will happen automatically via trigger
      const { data: stream, error: streamError } = await supabase
        .from('streams')
        .insert({
          name,
          description,
          emoji,
          priority: priority || 'medium',
          status: status || 'active',
          progress: 0,
          organization_id,
          created_by: user.id,
          start_date,
          end_date
        })
        .select(`
          *,
          stream_members (
            id,
            user_id,
            role,
            joined_at
          )
        `)
        .single()

      if (streamError || !stream) {
        console.error('Error creating stream:', streamError)
        return NextResponse.json(
          { error: 'Failed to create stream' },
          { status: 500 }
        )
      }

      return NextResponse.json(stream)
    } catch (error) {
      console.error('Error in stream creation:', error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to create stream' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in POST /api/streams:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
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

    // Get all streams for the organization
    const { data: streams, error: streamsError } = await supabase
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
      .eq('organization_id', organizationId)
      .order('updated_at', { ascending: false })

    if (streamsError) {
      return NextResponse.json(
        { error: 'Failed to fetch streams' },
        { status: 500 }
      )
    }

    if (!streams || streams.length === 0) {
      return NextResponse.json({
        streams: [],
        currentUser: {
          id: user.id,
          full_name: user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
        }
      })
    }

    // Get all related data in parallel using Promise.all
    const streamIds = streams.map((s: StreamResult) => s.id)
    
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

    // Get user details for stream members in a single batch query
    const userIds = streamMembers?.map((member: StreamMemberResult) => member.user_id) || []
    const { data: users } = userIds.length > 0 ? await supabase
      .from('users')
      .select('id, full_name, avatar_url')
      .in('id', userIds) : { data: null }

    // Combine stream members with user details
    const streamMembersWithUsers = streamMembers?.map((member: StreamMemberResult) => ({
      ...member,
      users: users?.find((user: UserResult) => user.id === member.user_id) || null
    })) || []

    // Combine the data
    const streamsWithRelations = streams.map((stream: StreamResult) => ({
      ...stream,
      stream_members: streamMembersWithUsers.filter((m: StreamMemberResult & { users: UserResult | null }) => m.stream_id === stream.id) || [],
      work_items: workItems?.filter((w: WorkItemResult) => w.stream_id === stream.id) || [],
      stream_tools: streamTools?.filter((t: StreamToolResult) => t.stream_id === stream.id) || []
    }))

    return NextResponse.json({
      streams: streamsWithRelations,
      currentUser: {
        id: user.id,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
      }
    })
  } catch (error) {
    console.error('Error in /api/streams:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}