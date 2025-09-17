import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export interface ProjectMember {
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
}

export interface WorkItem {
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
}

export interface ProjectTool {
  id: string;
  tool_name: string;
  tool_type: string | null;
  connected_at: string | null;
  project_id: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  emoji: string | null;
  progress: number;
  start_date: string | null;
  end_date: string | null;
  status: string;
  priority: string;
  created_at: string | null;
  updated_at: string | null;
  created_by: string;
  organization_id: string;
  project_members: ProjectMember[];
  work_items: WorkItem[];
  project_tools: ProjectTool[];
}

export interface ProjectsData {
  projects: Project[];
  currentUser: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export async function getUserProjects(userId: string, organizationId: string): Promise<ProjectsData> {
  const supabase = await createClient();

  // Get current user for comparison
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  // Get all projects where the user is a member
  const { data: projectMembers } = await supabase
    .from('project_members')
    .select('project_id')
    .eq('user_id', userId);

  const projectIds = projectMembers?.map(pm => pm.project_id) || [];

  // Get projects data
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      description,
      emoji,
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
    .in('id', projectIds)
    .eq('organization_id', organizationId)
    .order('updated_at', { ascending: false });

  // Get project members
  const { data: allProjectMembers } = await supabase
    .from('project_members')
    .select('id, user_id, role, joined_at, project_id')
    .in('project_id', projectIds);

  // Get user details for members
  const userIds = allProjectMembers?.map(member => member.user_id) || [];
  const { data: userDetails } = await supabase
    .from('users')
    .select('id, full_name, avatar_url')
    .in('id', userIds);

  // Combine member data
  const projectMembersWithUsers = allProjectMembers?.map(member => ({
    id: member.id,
    user_id: member.user_id,
    role: member.role,
    joined_at: member.joined_at,
    project_id: member.project_id,
    users: userDetails?.find(user => user.id === member.user_id) || null
  })) || [];

  // Get work items
  const { data: workItems, error: workItemsError } = await supabase
    .from('work_items')
    .select('*')
    .in('project_id', projectIds);

  // Get project tools
  const { data: projectTools } = await supabase
    .from('project_tools')
    .select(`
      id,
      tool_name,
      tool_type,
      connected_at,
      project_id
    `)
    .in('project_id', projectIds);

  // Combine the data
  const projectsWithRelations = projects?.map(project => ({
    ...project,
    project_members: projectMembersWithUsers.filter(m => m.project_id === project.id) || [],
    work_items: !workItemsError && workItems ? workItems.filter(w => w.project_id === project.id) : [],
    project_tools: projectTools?.filter(t => t.project_id === project.id) || []
  })) || [];

  return {
    projects: projectsWithRelations,
    currentUser: {
      id: user.id,
      full_name: user.user_metadata?.full_name || null,
      avatar_url: user.user_metadata?.avatar_url || null,
    },
  };
}

export async function getProjectsData(organizationId?: string): Promise<ProjectsData> {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/auth/login");
  }

  // If no organizationId provided, get user's organizations and use the first one
  let targetOrganizationId = organizationId;

  if (!targetOrganizationId) {
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
      .single();

    if (!userOrg) {
      redirect("/auth/login");
    }

    targetOrganizationId = userOrg.organization_id;
  } else {
    // Verify user has access to the specified organization
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
      .eq('organization_id', targetOrganizationId)
      .single();

    if (!userOrg) {
      redirect("/auth/login");
    }
  }

  // Get all projects for the organization with related data
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      description,
      emoji,
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
    .eq('organization_id', targetOrganizationId)
    .order('updated_at', { ascending: false });

  // Get project members and user details separately
  const projectIds = projects?.map(p => p.id) || [];
  const { data: projectMembers } = await supabase
    .from('project_members')
    .select(`
      id,
      user_id,
      role,
      joined_at,
      project_id
    `)
    .in('project_id', projectIds);

  // Get user details
  const userIds = projectMembers?.map(member => member.user_id) || [];
  const { data: users } = await supabase
    .from('users')
    .select('id, full_name, avatar_url')
    .in('id', userIds);

  // Combine project members with user details
  const projectMembersWithUsers = projectMembers?.map(member => ({
    ...member,
    users: users?.find(user => user.id === member.user_id) || null
  })) || [];

  // Get work items for projects
  const { data: workItems, error: workItemsError } = await supabase
    .from('work_items')
    .select('*')
    .in('project_id', projectIds);

  // Get project tools
  const { data: projectTools } = await supabase
    .from('project_tools')
    .select(`
      id,
      tool_name,
      tool_type,
      connected_at,
      project_id
    `)
    .in('project_id', projectIds);

  // Combine the data
  const projectsWithRelations = projects?.map(project => ({
    ...project,
    project_members: projectMembersWithUsers.filter(m => m.project_id === project.id) || [],
    work_items: !workItemsError && workItems ? workItems.filter(w => w.project_id === project.id) : [],
    project_tools: projectTools?.filter(t => t.project_id === project.id) || []
  })) || [];

  return {
    projects: projectsWithRelations,
    currentUser: {
      id: user.id,
      full_name: user.user_metadata?.full_name || null,
      avatar_url: user.user_metadata?.avatar_url || null,
    },
  };
}
