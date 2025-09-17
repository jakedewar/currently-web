import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface DashboardData {
  user: {
    id: string;
    full_name: string | null;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  stats: {
    activeProjects: number;
    totalUrlItems: number;
    totalNoteItems: number;
    teamSize: number;
  };
  projects: Array<{
    id: string;
    name: string;
    description: string | null;
    status: string;
    progress: number;
    priority: string;
    created_at: string | null;
    updated_at: string | null;
  }>;
  workItems: Array<{
    id: string;
    title: string;
    description: string | null;
    type: string;
    status: string;
    tool: string | null;
    created_at: string | null;
    updated_at: string | null;
    projects: {
      id: string;
      name: string | null;
    } | null;
  }>;
  teamActivity: Array<{
    id: string;
    user_id: string;
    activity_type: string;
    description: string;
    tool: string | null;
    created_at: string | null;
    projects: {
      id: string;
      name: string | null;
    } | null;
    work_items: {
      title: string | null;
    } | null;
  }>;
  activityUsers: Map<string, { id: string; full_name: string | null }>;
}

export async function getDashboardData(organizationId?: string): Promise<DashboardData> {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/auth/login");
  }

  // If no organizationId provided, get user's organizations and use the first one
  let targetOrganizationId = organizationId;
  let targetOrganization: { id: string; name: string; slug: string } | null = null;

  if (!targetOrganizationId) {
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
      .eq('user_id', user.id);

    if (!userOrgs || userOrgs.length === 0) {
      redirect("/auth/login");
    }

    // Use the first organization
    const userOrg = userOrgs[0];
    targetOrganizationId = userOrg.organization_id;
    targetOrganization = userOrg.organizations;
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

    targetOrganization = userOrg.organizations;
  }

  // Get projects for the organization
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      description,
      status,
      progress,
      priority,
      created_at,
      updated_at
    `)
    .eq('organization_id', targetOrganizationId)
    .order('updated_at', { ascending: false })
    .limit(10);

  // Get all work items for the organization (for counting)
  const { data: allWorkItems } = await supabase
    .from('work_items')
    .select(`
      id,
      type,
      projects!inner (
        organization_id
      )
    `)
    .eq('projects.organization_id', targetOrganizationId);

  // Get recent work items for display
  const { data: recentWorkItems } = await supabase
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
      projects!inner (
        id,
        name,
        organization_id
      )
    `)
    .eq('projects.organization_id', targetOrganizationId)
    .order('updated_at', { ascending: false })
    .limit(5);

  // Get team activity
  const { data: teamActivity } = await supabase
    .from('user_activity')
    .select(`
      id,
      activity_type,
      description,
      tool,
      created_at,
      user_id,
      projects (
        id,
        name
      ),
      work_items (
        title
      )
    `)
    .eq('projects.organization_id', targetOrganizationId)
    .order('created_at', { ascending: false })
    .limit(6);

  // Get organization members
  const { data: orgMembers } = await supabase
    .from('organization_members')
    .select(`
      id,
      role,
      joined_at,
      user_id,
      organization_id
    `)
    .eq('organization_id', targetOrganizationId);

  // Get user details for team activity
  const userIds = teamActivity?.map(activity => activity.user_id).filter(Boolean) || [];
  const { data: activityUsers } = await supabase
    .from('users')
    .select('id, full_name')
    .in('id', userIds);

  // Create a map of user details
  const userMap = new Map(activityUsers?.map(user => [user.id, user]) || []);

  // Calculate statistics
  const activeProjects = projects?.filter(p => p.status === 'active').length || 0;
  const totalUrlItems = allWorkItems?.filter(w => w.type === 'url').length || 0;
  const totalNoteItems = allWorkItems?.filter(w => w.type === 'note').length || 0;
  const teamSize = orgMembers?.length || 0;

  return {
    user: {
      id: user.id,
      full_name: user.user_metadata?.full_name || null,
    },
    organization: {
      id: targetOrganization.id,
      name: targetOrganization.name,
      slug: targetOrganization.slug,
    },
    stats: {
      activeProjects,
      totalUrlItems,
      totalNoteItems,
      teamSize,
    },
    projects: projects || [],
    workItems: recentWorkItems || [],
    teamActivity: teamActivity || [],
    activityUsers: userMap,
  };
}
