import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; workItemId: string }> }
): Promise<NextResponse> {
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

    // Get the work item
    const { data: workItem, error: workItemError } = await supabase
      .from('work_items')
      .select(`
        id,
        title,
        description,
        type,
        status,
        url,
        priority,
        assignee_id,
        due_date,
        estimated_hours,
        actual_hours,
        parent_task_id,
        order_index,
        created_at,
        updated_at,
        stream_id,
        created_by
      `)
      .eq('id', workItemId)
      .eq('stream_id', id)
      .single()

    if (workItemError || !workItem) {
      return NextResponse.json({ error: 'Work item not found' }, { status: 404 })
    }

    return NextResponse.json(workItem)
  } catch (error) {
    console.error('Error in GET /api/streams/[id]/work-items/[workItemId]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; workItemId: string }> }
): Promise<NextResponse> {
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
    const { data: existingWorkItem } = await supabase
      .from('work_items')
      .select('id, stream_id')
      .eq('id', workItemId)
      .eq('stream_id', id)
      .single()

    if (!existingWorkItem) {
      return NextResponse.json({ error: 'Work item not found' }, { status: 404 })
    }

    const body = await request.json()
    const { 
      title, 
      description, 
      status, 
      priority, 
      assignee_id, 
      due_date, 
      estimated_hours, 
      actual_hours 
    } = body

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }
    
    if (title !== undefined) updateData.title = title.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (status !== undefined) updateData.status = status
    if (priority !== undefined) updateData.priority = priority
    if (assignee_id !== undefined) updateData.assignee_id = assignee_id
    if (due_date !== undefined) updateData.due_date = due_date
    if (estimated_hours !== undefined) updateData.estimated_hours = estimated_hours
    if (actual_hours !== undefined) updateData.actual_hours = actual_hours

    // Update the work item
    const { data: updatedWorkItem, error: updateError } = await supabase
      .from('work_items')
      .update(updateData)
      .eq('id', workItemId)
      .select(`
        id,
        title,
        description,
        type,
        status,
        url,
        priority,
        assignee_id,
        due_date,
        estimated_hours,
        actual_hours,
        parent_task_id,
        order_index,
        created_at,
        updated_at,
        stream_id,
        created_by
      `)
      .single()

    if (updateError) {
      console.error('Error updating work item:', updateError)
      return NextResponse.json(
        { error: 'Failed to update work item' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedWorkItem)
  } catch (error) {
    console.error('Error in PATCH /api/streams/[id]/work-items/[workItemId]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; workItemId: string }> }
): Promise<NextResponse> {
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
    const { data: existingWorkItem } = await supabase
      .from('work_items')
      .select('id, stream_id')
      .eq('id', workItemId)
      .eq('stream_id', id)
      .single()

    if (!existingWorkItem) {
      return NextResponse.json({ error: 'Work item not found' }, { status: 404 })
    }

    // Delete the work item
    const { error: deleteError } = await supabase
      .from('work_items')
      .delete()
      .eq('id', workItemId)

    if (deleteError) {
      console.error('Error deleting work item:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete work item' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/streams/[id]/work-items/[workItemId]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
