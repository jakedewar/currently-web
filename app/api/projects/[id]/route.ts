import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/api/projects/[id]'>
): Promise<NextResponse> {
  try {
    const { id: projectId } = await ctx.params
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

    // Get project data with all related information
    const { data: project } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        description,
        progress,
        start_date,
        end_date,
        status,
        priority,
        emoji,
        created_at,
        updated_at,
        created_by,
        organization_id
      `)
      .eq('id', projectId)
      .single()

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Check if user has access to the project (either as member or through organization)
    const { data: projectMember } = await supabase
      .from('project_members')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .single()

    // Check if user is member of the organization that owns this project
    const userHasAccessToProjectOrg = userOrgs.some(org => org.organization_id === project.organization_id)
    
    if (!userHasAccessToProjectOrg) {
      return NextResponse.json(
        { error: 'User does not have access to this project' },
        { status: 403 }
      )
    }

    // Get project members first
    const { data: projectMembers, error: projectMembersError } = await supabase
      .from('project_members')
      .select(`
        id,
        user_id,
        role,
        joined_at,
        project_id
      `)
      .eq('project_id', projectId)

    if (projectMembersError) {
      console.error('Error fetching project members:', projectMembersError)
    }

    // Get user details for the members
    let projectMembersWithUsers: Array<{
      id: string;
      user_id: string;
      role: string;
      joined_at: string | null;
      project_id: string;
      users: {
        id: string;
        full_name: string | null;
        avatar_url: string | null;
      } | null;
    }> = []
    
    if (projectMembers && projectMembers.length > 0) {
      const userIds = projectMembers.map(member => member.user_id)
      
      // Get user profiles from the users table
      const { data: userProfiles, error: userProfilesError } = await supabase
        .from('users')
        .select('id, full_name, avatar_url')
        .in('id', userIds)

      if (userProfilesError) {
        console.error('Error fetching user profiles:', userProfilesError)
      }

      // Combine project members with user data
      projectMembersWithUsers = projectMembers.map(member => ({
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
      project_id: string;
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
        project_id,
        created_by
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    
    workItems = workItemsData || []

    // Get project tools (show to all organization members)
    let projectTools: Array<{
      id: string;
      tool_name: string;
      tool_type: string | null;
      connected_at: string | null;
      project_id: string;
    }> = []
    
    const { data: projectToolsData } = await supabase
      .from('project_tools')
      .select(`
        id,
        tool_name,
        tool_type,
        connected_at,
        project_id
      `)
      .eq('project_id', projectId)
    
    projectTools = projectToolsData || []

    // Get project activity (we'll implement this later)
    const projectActivity: Array<never> = []

    return NextResponse.json({
      project: {
        ...project,
        project_members: projectMembersWithUsers,
        work_items: workItems,
        project_tools: projectTools,
        activity: projectActivity,
      },
      currentUser: {
        id: user.id,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        role: projectMember?.role || 'non_member',
      },
    })
  } catch (error) {
    console.error('Error in GET /api/projects/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<'/api/projects/[id]'>
): Promise<NextResponse> {
  try {
    const { id: projectId } = await ctx.params
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

    // Get project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        id,
        organization_id,
        created_by
      `)
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Check if user is member of the organization
    const { data: userOrgs } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', project.organization_id)
      .eq('user_id', user.id)

    if (!userOrgs || userOrgs.length === 0) {
      return NextResponse.json(
        { error: 'User is not a member of this organization' },
        { status: 403 }
      )
    }

    const orgMember = userOrgs[0] // Use the first membership if multiple exist

    if (action === 'join') {
      // Check if user is already a member of the project
      const { data: existingMember } = await supabase
        .from('project_members')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single()

      if (existingMember) {
        return NextResponse.json(
          { error: 'User is already a member of this project' },
          { status: 400 }
        )
      }

      // Add user to project as member
      const { data: newMember, error: joinError } = await supabase
        .from('project_members')
        .insert({
          project_id: projectId,
          user_id: user.id,
          role: 'member',
          joined_at: new Date().toISOString()
        })
        .select()
        .single()

      if (joinError) {
        console.error('Error joining project:', joinError)
        return NextResponse.json(
          { error: 'Failed to join project' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'Successfully joined project',
        member: newMember
      })
    }

    if (action === 'update_status' && status) {
      // Only project owner or organization admin can update status
      const { data: projectMember } = await supabase
        .from('project_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single()

      const canUpdate = project.created_by === user.id || 
                       orgMember.role === 'admin' || 
                       orgMember.role === 'owner' ||
                       projectMember?.role === 'admin'

      if (!canUpdate) {
        return NextResponse.json(
          { error: 'Insufficient permissions to update project status' },
          { status: 403 }
        )
      }

      // Update project status
      const { data: updatedProject, error: updateError } = await supabase
        .from('projects')
        .update({ status })
        .eq('id', projectId)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating project:', updateError)
        return NextResponse.json(
          { error: 'Failed to update project' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'Project status updated successfully',
        project: updatedProject
      })
    }


    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in PATCH /api/projects/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
