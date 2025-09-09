import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; workItemId: string; subtaskId: string }> }
) {
  try {
    const supabase = await createClient()
    const { id, workItemId, subtaskId } = await params
    
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

    // Verify subtask exists and belongs to the work item and stream
    const { data: subtask } = await supabase
      .from('work_items')
      .select(`
        id,
        parent_task_id,
        stream_id
      `)
      .eq('id', subtaskId)
      .eq('parent_task_id', workItemId)
      .eq('stream_id', id)
      .single()

    if (!subtask) {
      return NextResponse.json({ error: 'Subtask not found' }, { status: 404 })
    }

    const body = await request.json()
    const { title, description, status, priority, assignee_id, due_date, estimated_hours, actual_hours } = body

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (status !== undefined) updateData.status = status
    if (priority !== undefined) updateData.priority = priority
    if (assignee_id !== undefined) updateData.assignee_id = assignee_id
    if (due_date !== undefined) updateData.due_date = due_date
    if (estimated_hours !== undefined) updateData.estimated_hours = estimated_hours
    if (actual_hours !== undefined) updateData.actual_hours = actual_hours
    // if (order_index !== undefined) updateData.order_index = order_index // Column doesn't exist

    // Update subtask
    const { data: updatedSubtask, error } = await supabase
      .from('work_items')
      .update(updateData)
      .eq('id', subtaskId)
      .select()
      .single()

    if (error) {
      console.error('Error updating subtask:', error)
      return NextResponse.json({ error: 'Failed to update subtask' }, { status: 500 })
    }

    return NextResponse.json(updatedSubtask)
  } catch (error) {
    console.error('Error in PATCH /api/streams/[streamId]/work-items/[workItemId]/subtasks/[subtaskId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; workItemId: string; subtaskId: string }> }
) {
  try {
    const supabase = await createClient()
    const { id, workItemId, subtaskId } = await params
    
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

    // Verify subtask exists and belongs to the work item and stream
    const { data: subtask } = await supabase
      .from('work_items')
      .select(`
        id,
        parent_task_id,
        stream_id
      `)
      .eq('id', subtaskId)
      .eq('parent_task_id', workItemId)
      .eq('stream_id', id)
      .single()

    if (!subtask) {
      return NextResponse.json({ error: 'Subtask not found' }, { status: 404 })
    }

    // Delete subtask
    const { error } = await supabase
      .from('work_items')
      .delete()
      .eq('id', subtaskId)

    if (error) {
      console.error('Error deleting subtask:', error)
      return NextResponse.json({ error: 'Failed to delete subtask' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/streams/[streamId]/work-items/[workItemId]/subtasks/[subtaskId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
