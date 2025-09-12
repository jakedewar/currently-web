import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface CurrentlyDashboardData {
  user: {
    id: string;
    full_name: string | null;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  currentFocus: {
    activeTasks: Array<{
      id: string;
      title: string;
      description: string | null;
      type: string;
      status: string;
      priority: string | null;
      due_date: string | null;
      estimated_hours: number | null;
      actual_hours: number | null;
      stream_id: string;
      stream_name: string;
      stream_emoji: string | null;
      created_at: string | null;
      updated_at: string | null;
    }>;
    dueToday: Array<{
      id: string;
      title: string;
      description: string | null;
      type: string;
      status: string;
      priority: string | null;
      due_date: string | null;
      estimated_hours: number | null;
      actual_hours: number | null;
      stream_id: string;
      stream_name: string;
      stream_emoji: string | null;
      created_at: string | null;
      updated_at: string | null;
    }>;
    highPriority: Array<{
      id: string;
      title: string;
      description: string | null;
      type: string;
      status: string;
      priority: string | null;
      due_date: string | null;
      estimated_hours: number | null;
      actual_hours: number | null;
      stream_id: string;
      stream_name: string;
      stream_emoji: string | null;
      created_at: string | null;
      updated_at: string | null;
    }>;
  };
  quickActions: {
    recentStreams: Array<{
      id: string;
      name: string;
      description: string | null;
      emoji: string | null;
      status: string;
      progress: number;
      last_activity: string | null;
      resource_count: number;
      task_count: number;
    }>;
    recentWorkItems: Array<{
      id: string;
      title: string;
      type: string;
      status: string;
      stream_id: string;
      stream_name: string;
      updated_at: string | null;
    }>;
  };
  todayOverview: {
    hoursLogged: number;
    hoursEstimated: number;
    tasksCompleted: number;
    tasksInProgress: number;
    tasksBlocked: number;
  };
  upcomingDeadlines: Array<{
    id: string;
    title: string;
    due_date: string;
    priority: string | null;
    stream_name: string;
    daysUntilDue: number;
  }>;
  context: {
    streamUpdates: Array<{
      id: string;
      activity_type: string;
      description: string;
      created_at: string | null;
      stream_name: string;
      user_name: string | null;
    }>;
    blockers: Array<{
      id: string;
      title: string;
      status: string;
      stream_name: string;
      reason: string;
    }>;
  };
}

export async function getCurrentlyDashboardData(organizationId?: string): Promise<CurrentlyDashboardData> {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/auth/login");
  }

  // Get organization (same logic as before)
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

    const userOrg = userOrgs[0];
    targetOrganizationId = userOrg.organization_id;
    targetOrganization = userOrg.organizations;
  } else {
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


  // Get user's assigned work items with stream information
  const { data: userWorkItems } = await supabase
    .from('work_items')
    .select(`
      id,
      title,
      description,
      type,
      status,
      priority,
      due_date,
      estimated_hours,
      actual_hours,
      created_at,
      updated_at,
      stream_id,
      streams!inner (
        id,
        name,
        emoji,
        organization_id
      )
    `)
    .eq('assignee_id', user.id)
    .eq('streams.organization_id', targetOrganizationId)
    .order('updated_at', { ascending: false });

  // Get user's recent work items (created by user, not necessarily assigned)
  const { data: recentWorkItems } = await supabase
    .from('work_items')
    .select(`
      id,
      title,
      type,
      status,
      updated_at,
      stream_id,
      streams!inner (
        id,
        name,
        emoji,
        organization_id
      )
    `)
    .eq('created_by', user.id)
    .eq('streams.organization_id', targetOrganizationId)
    .order('updated_at', { ascending: false })
    .limit(5);

  // Get streams user is a member of
  const { data: userStreams } = await supabase
    .from('stream_members')
    .select(`
      stream_id,
      streams!inner (
        id,
        name,
        description,
        emoji,
        status,
        progress,
        organization_id,
        updated_at
      )
    `)
    .eq('user_id', user.id)
    .eq('streams.organization_id', targetOrganizationId)
    .limit(10); // Get more streams initially, we'll sort them by user activity


  // Get today's date for filtering
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  // Get today's activity for hours tracking
  // const { data: todayActivity } = await supabase
  //   .from('user_activity')
  //   .select('*')
  //   .eq('user_id', user.id)
  //   .gte('created_at', todayStart.toISOString())
  //   .lt('created_at', todayEnd.toISOString());

  // Get user's most recent activity in each stream to sort by interaction
  const streamIds = userStreams?.map(s => s.streams.id) || [];
  
  // Get user's most recent work item activity in each stream
  const { data: userStreamActivity } = await supabase
    .from('work_items')
    .select(`
      stream_id,
      updated_at,
      created_at
    `)
    .in('stream_id', streamIds)
    .or(`created_by.eq.${user.id},assignee_id.eq.${user.id}`)
    .order('updated_at', { ascending: false });

  // Get work items for streams to calculate counts
  const { data: streamWorkItems } = await supabase
    .from('work_items')
    .select(`
      stream_id,
      type
    `)
    .in('stream_id', streamIds);

  // Get recent stream activity for team activity component
  const { data: streamActivity } = await supabase
    .from('user_activity')
    .select(`
      id,
      activity_type,
      description,
      created_at,
      user_id,
      streams (
        id,
        name
      )
    `)
    .in('stream_id', streamIds)
    .order('created_at', { ascending: false })
    .limit(10);


  // Get user details for activity
  const activityUserIds = streamActivity?.map(a => a.user_id).filter(Boolean) || [];
  const { data: activityUsers } = await supabase
    .from('users')
    .select('id, full_name')
    .in('id', activityUserIds);

  const userMap = new Map(activityUsers?.map(u => [u.id, u]) || []);

  // Sort streams by user's most recent interaction
  const sortedStreams = userStreams?.map(streamMember => {
    const stream = streamMember.streams;
    const userActivity = userStreamActivity?.find(activity => activity.stream_id === stream.id);
    
    return {
      ...streamMember,
      lastUserInteraction: userActivity?.updated_at || userActivity?.created_at || stream.updated_at
    };
  }).sort((a, b) => {
    // Sort by most recent user interaction, fallback to stream update time
    const aTime = new Date(a.lastUserInteraction || 0).getTime();
    const bTime = new Date(b.lastUserInteraction || 0).getTime();
    return bTime - aTime; // Most recent first
  }).slice(0, 5) || []; // Take top 5 most recently interacted with streams

  // Process work items
  const workItems = userWorkItems || [];
  
  // Filter and categorize work items
  const activeTasks = workItems.filter(item => 
    item.status === 'in_progress' || item.status === 'active'
  );

  const dueToday = workItems.filter(item => {
    if (!item.due_date) return false;
    const dueDate = new Date(item.due_date);
    return dueDate >= todayStart && dueDate < todayEnd;
  });

  const highPriority = workItems.filter(item => 
    item.priority === 'high' || item.priority === 'urgent'
  );

  // Get upcoming deadlines (next 7 days)
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingDeadlines = workItems
    .filter(item => {
      if (!item.due_date) return false;
      const dueDate = new Date(item.due_date);
      return dueDate > todayEnd && dueDate <= nextWeek;
    })
    .map(item => {
      const dueDate = new Date(item.due_date!);
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return {
        id: item.id,
        title: item.title,
        due_date: item.due_date!,
        priority: item.priority,
        stream_name: item.streams.name,
        daysUntilDue
      };
    })
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  // Calculate today's overview
  const hoursLogged = 0; // TODO: Implement proper time tracking

  const hoursEstimated = workItems.reduce((total, item) => {
    return total + (item.estimated_hours || 0);
  }, 0);

  const tasksCompleted = workItems.filter(item => item.status === 'done' || item.status === 'completed').length;
  const tasksInProgress = workItems.filter(item => 
    item.status === 'in_progress' || item.status === 'active'
  ).length;
  const tasksBlocked = workItems.filter(item => item.status === 'blocked').length;

  // Process stream updates
  const streamUpdates = streamActivity?.map(activity => ({
    id: activity.id,
    activity_type: activity.activity_type,
    description: activity.description,
    created_at: activity.created_at,
    stream_name: activity.streams?.name || 'Unknown Stream',
    user_name: userMap.get(activity.user_id)?.full_name || 'Unknown User'
  })) || [];

  // Identify potential blockers (tasks that might be waiting)
  const blockers = workItems
    .filter(item => item.status === 'todo' && item.priority === 'high')
    .map(item => ({
      id: item.id,
      title: item.title,
      status: item.status,
      stream_name: item.streams.name,
      reason: 'High priority task not started'
    }));

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
    currentFocus: {
      activeTasks: activeTasks.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        type: item.type,
        status: item.status,
        priority: item.priority,
        due_date: item.due_date,
        estimated_hours: item.estimated_hours,
        actual_hours: item.actual_hours,
        stream_id: item.stream_id,
        stream_name: item.streams.name,
        stream_emoji: item.streams.emoji,
        created_at: item.created_at,
        updated_at: item.updated_at,
      })),
      dueToday: dueToday.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        type: item.type,
        status: item.status,
        priority: item.priority,
        due_date: item.due_date,
        estimated_hours: item.estimated_hours,
        actual_hours: item.actual_hours,
        stream_id: item.stream_id,
        stream_name: item.streams.name,
        stream_emoji: item.streams.emoji,
        created_at: item.created_at,
        updated_at: item.updated_at,
      })),
      highPriority: highPriority.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        type: item.type,
        status: item.status,
        priority: item.priority,
        due_date: item.due_date,
        estimated_hours: item.estimated_hours,
        actual_hours: item.actual_hours,
        stream_id: item.stream_id,
        stream_name: item.streams.name,
        stream_emoji: item.streams.emoji,
        created_at: item.created_at,
        updated_at: item.updated_at,
      })),
    },
    quickActions: {
      recentStreams: sortedStreams.map(s => {
        const streamWorkItemsForStream = streamWorkItems?.filter(item => item.stream_id === s.streams.id) || [];
        const resourceCount = streamWorkItemsForStream.filter(item => item.type === 'url').length;
        const taskCount = streamWorkItemsForStream.filter(item => item.type === 'note').length;
        
        return {
          id: s.streams.id,
          name: s.streams.name,
          description: s.streams.description,
          emoji: s.streams.emoji,
          status: s.streams.status,
          progress: s.streams.progress,
          last_activity: s.lastUserInteraction,
          resource_count: resourceCount,
          task_count: taskCount,
        };
      }),
      recentWorkItems: recentWorkItems?.map(item => ({
        id: item.id,
        title: item.title,
        type: item.type,
        status: item.status,
        stream_id: item.stream_id,
        stream_name: item.streams.name,
        updated_at: item.updated_at,
      })) || [],
    },
    todayOverview: {
      hoursLogged,
      hoursEstimated,
      tasksCompleted,
      tasksInProgress,
      tasksBlocked,
    },
    upcomingDeadlines,
    context: {
      streamUpdates,
      blockers,
    },
  };
}
