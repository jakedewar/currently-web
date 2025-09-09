import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; workItemId: string }> }
) {
  try {
    const supabase = await createClient()
    const { id, workItemId } = await params
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user has access to the stream
    const { data: streamMember } = await supabase
      .from('stream_members')
      .select('id')
      .eq('stream_id', id)
      .eq('user_id', user.id)
      .single()

    if (!streamMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Verify work item exists and belongs to the stream
    const { data: workItem } = await supabase
      .from('work_items')
      .select('id, stream_id')
      .eq('id', workItemId)
      .eq('stream_id', id)
      .single()

    if (!workItem) {
      return NextResponse.json({ error: 'Work item not found' }, { status: 404 })
    }

    // Get subtasks from work_items table
    const { data: subtasks, error } = await supabase
      .from('work_items')
      .select(`
        id,
        title,
        description,
        status,
        priority,
        assignee_id,
        due_date,
        estimated_hours,
        actual_hours,
        // order_index, // Column doesn't exist in database
        created_at,
        updated_at,
        parent_task_id,
        created_by
      `)
      .eq('parent_task_id', workItemId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching subtasks:', error)
      return NextResponse.json({ error: 'Failed to fetch subtasks' }, { status: 500 })
    }

    return NextResponse.json(subtasks || [])
  } catch (error) {
    console.error('Error in GET /api/streams/[streamId]/work-items/[workItemId]/subtasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; workItemId: string }> }
) {
  try {
    const supabase = await createClient()
    const { id, workItemId } = await params
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user has access to the stream
    const { data: streamMember } = await supabase
      .from('stream_members')
      .select('id')
      .eq('stream_id', id)
      .eq('user_id', user.id)
      .single()

    if (!streamMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Verify work item exists and belongs to the stream
    const { data: workItem } = await supabase
      .from('work_items')
      .select('id, stream_id')
      .eq('id', workItemId)
      .eq('stream_id', id)
      .single()

    if (!workItem) {
      return NextResponse.json({ error: 'Work item not found' }, { status: 404 })
    }

    const body = await request.json()
    const { title, description, priority = 'medium', assignee_id, due_date, estimated_hours } = body

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Simple ordering for now (order_index column doesn't exist in database)


    // Create subtask as a work item with parent_task_id
    const { data: subtask, error } = await supabase
      .from('work_items')
      .insert({
        stream_id: id,
        title: title.trim(),
        description: description?.trim() || null,
        type: 'note',
        status: 'active',
        priority,
        assignee_id: assignee_id || null,
        due_date: due_date || null,
        estimated_hours: estimated_hours || null,
        parent_task_id: workItemId,
        // order_index: nextOrderIndex, // Column doesn't exist in database
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating subtask:', error)
      return NextResponse.json({ error: 'Failed to create subtask' }, { status: 500 })
    }

    return NextResponse.json(subtask, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/streams/[streamId]/work-items/[workItemId]/subtasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
