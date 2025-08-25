import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { CreateWorkItemSchema } from '@/lib/schemas/streams'
import { Redis } from '@upstash/redis'

// Initialize Redis for rate limiting (if configured)
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN
    })
  : null

export async function POST(
  request: NextRequest,
  ctx: RouteContext<'/api/streams/[id]/work-items'>
): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { id } = await ctx.params

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate request body against schema
    const result = CreateWorkItemSchema.safeParse({
      ...body,
      stream_id: id,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.issues },
        { status: 400 }
      )
    }

    const { title, description, type, status, url, stream_id } = result.data

    // Check rate limit if Redis is configured
    if (redis) {
      try {
        const rateLimitKey = `work_item_create:${user.id}`
        const currentCount = await redis.incr(rateLimitKey)
        if (currentCount === 1) {
          await redis.expire(rateLimitKey, 60) // Set 60 second expiry
        }
        if (currentCount > 20) {
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

    // Check if user has access to the stream
    const { data: streamMember, error: streamError } = await supabase
      .from('stream_members')
      .select('role')
      .eq('stream_id', stream_id)
      .eq('user_id', user.id)
      .single()

    if (streamError || !streamMember) {
      return NextResponse.json(
        { error: 'User does not have access to this stream' },
        { status: 403 }
      )
    }

    try {
      // Create the work item
      const { data: workItem, error: workItemError } = await supabase
        .from('work_items')
        .insert({
          title,
          description,
          type,
          status,
          url,
          stream_id,
          created_by: user.id,
        })
        .select()
        .single()

      if (workItemError || !workItem) {
        console.error('Error creating work item:', workItemError)
        return NextResponse.json(
          { error: 'Failed to create work item' },
          { status: 500 }
        )
      }

      return NextResponse.json(workItem)
    } catch (error) {
      console.error('Error in work item creation:', error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to create work item' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in POST /api/streams/[id]/work-items:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/api/streams/[id]/work-items'>
): Promise<NextResponse> {
  try {
    const { id } = await ctx.params
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has access to the stream
    const { data: streamMember, error: streamError } = await supabase
      .from('stream_members')
      .select('role')
      .eq('stream_id', id)
      .eq('user_id', user.id)
      .single()

    if (streamError || !streamMember) {
      return NextResponse.json(
        { error: 'User does not have access to this stream' },
        { status: 403 }
      )
    }

    // Get work items for the stream
    const { data: workItems, error: workItemsError } = await supabase
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
      .eq('stream_id', id)
      .order('created_at', { ascending: false })

    if (workItemsError) {
      return NextResponse.json(
        { error: 'Failed to fetch work items' },
        { status: 500 }
      )
    }

    return NextResponse.json({ workItems })
  } catch (error) {
    console.error('Error in GET /api/streams/[id]/work-items:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
