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
    activeStreams: number;
    timeSaved: number;
    contextSwitchesReduction: number;
    teamSize: number;
  };
  streams: Array<{
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
    streams: {
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
    streams: {
      name: string | null;
    } | null;
    work_items: {
      title: string | null;
    } | null;
  }>;
  activityUsers: Map<string, { id: string; full_name: string | null }>;
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/auth/login");
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
    .single();

  if (!userOrg) {
    redirect("/auth/login");
  }

  const organizationId = userOrg.organization_id;

  // Get streams for the organization
  const { data: streams } = await supabase
    .from('streams')
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
    .eq('organization_id', organizationId)
    .order('updated_at', { ascending: false })
    .limit(10);

  // Get recent work items
  const { data: workItems } = await supabase
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
      streams (
        name
      )
    `)
    .eq('streams.organization_id', organizationId)
    .order('updated_at', { ascending: false })
    .limit(8);

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
      streams (
        name
      ),
      work_items (
        title
      )
    `)
    .eq('streams.organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(6);

  // Get user details for team activity
  const userIds = teamActivity?.map(activity => activity.user_id).filter(Boolean) || [];
  const { data: activityUsers } = await supabase
    .from('users')
    .select('id, full_name')
    .in('id', userIds);

  // Create a map of user details
  const userMap = new Map(activityUsers?.map(user => [user.id, user]) || []);

  // Get organization members
  const { data: orgMembers } = await supabase
    .from('organization_members')
    .select(`
      role,
      joined_at,
      users (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('organization_id', organizationId);

  // Calculate statistics
  const activeStreams = streams?.filter(s => s.status === 'active').length || 0;
  const completedWorkItems = workItems?.filter(w => w.status === 'completed').length || 0;
  const teamSize = orgMembers?.length || 0;

  // Calculate time saved (mock calculation based on completed items)
  const timeSaved = completedWorkItems * 0.5; // 30 minutes per completed item

  // Calculate context switches reduction (mock calculation)
  const contextSwitchesReduction = Math.max(0, 67 - (activeStreams * 3));

  return {
    user: {
      id: user.id,
      full_name: user.user_metadata?.full_name || null,
    },
    organization: {
      id: userOrg.organizations.id,
      name: userOrg.organizations.name,
      slug: userOrg.organizations.slug,
    },
    stats: {
      activeStreams,
      timeSaved,
      contextSwitchesReduction,
      teamSize,
    },
    streams: streams || [],
    workItems: workItems || [],
    teamActivity: teamActivity || [],
    activityUsers: userMap,
  };
}
