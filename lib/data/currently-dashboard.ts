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
  stats: {
    yourProjects: number;
    totalProjects: number;
    totalHours: number;
    tasksCompletedThisWeek: number;
    teamSize: number;
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
      project_id: string;
      project_name: string;
      project_emoji: string | null;
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
      project_id: string;
      project_name: string;
      project_emoji: string | null;
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
      project_id: string;
      project_name: string;
      project_emoji: string | null;
      created_at: string | null;
      updated_at: string | null;
    }>;
  };
  quickActions: {
    recentProjects: Array<{
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
      project_id: string;
      project_name: string;
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
    project_name: string;
    daysUntilDue: number;
  }>;
  context: {
    projectUpdates: Array<{
      id: string;
      activity_type: string;
      description: string;
      created_at: string | null;
      project_name: string;
      user_name: string | null;
    }>;
    blockers: Array<{
      id: string;
      title: string;
      status: string;
      project_name: string;
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


  // Get user's assigned work items with project information
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
      project_id,
      projects!inner (
        id,
        name,
        emoji,
        organization_id
      )
    `)
    .eq('assignee_id', user.id)
    .eq('projects.organization_id', targetOrganizationId)
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
      project_id,
      projects!inner (
        id,
        name,
        emoji,
        organization_id
      )
    `)
    .eq('created_by', user.id)
    .eq('projects.organization_id', targetOrganizationId)
    .order('updated_at', { ascending: false })
    .limit(5);

  // Get projects user is a member of
  const { data: userProjects } = await supabase
    .from('project_members')
    .select(`
      project_id,
      projects!inner (
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
    .eq('projects.organization_id', targetOrganizationId)
    .limit(10); // Get more projects initially, we'll sort them by user activity

  // Get total projects in organization for stats
  const { data: totalProjects } = await supabase
    .from('projects')
    .select('id')
    .eq('organization_id', targetOrganizationId);

  // Get team size for stats
  const { data: teamMembers } = await supabase
    .from('organization_members')
    .select('user_id')
    .eq('organization_id', targetOrganizationId);


  // Get today's date for filtering
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  
  // Get start of this week for task completion tracking
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);

  // Get today's activity for hours tracking
  // const { data: todayActivity } = await supabase
  //   .from('user_activity')
  //   .select('*')
  //   .eq('user_id', user.id)
  //   .gte('created_at', todayStart.toISOString())
  //   .lt('created_at', todayEnd.toISOString());

  // Get user's most recent activity in each project to sort by interaction
  const projectIds = userProjects?.map(p => p.projects.id) || [];
  
  // Get user's most recent work item activity in each project
  const { data: userProjectActivity } = await supabase
    .from('work_items')
    .select(`
      project_id,
      updated_at,
      created_at
    `)
    .in('project_id', projectIds)
    .or(`created_by.eq.${user.id},assignee_id.eq.${user.id}`)
    .order('updated_at', { ascending: false });

  // Get work items for projects to calculate counts
  const { data: projectWorkItems } = await supabase
    .from('work_items')
    .select(`
      project_id,
      type
    `)
    .in('project_id', projectIds);

  // Get recent project activity for team activity component
  const { data: projectActivity } = await supabase
    .from('user_activity')
    .select(`
      id,
      activity_type,
      description,
      created_at,
      user_id,
      projects (
        id,
        name
      )
    `)
    .in('project_id', projectIds)
    .order('created_at', { ascending: false })
    .limit(10);


  // Get user details for activity
  const activityUserIds = projectActivity?.map(a => a.user_id).filter(Boolean) || [];
  const { data: activityUsers } = await supabase
    .from('users')
    .select('id, full_name')
    .in('id', activityUserIds);

  const userMap = new Map(activityUsers?.map(u => [u.id, u]) || []);

  // Sort projects by user's most recent interaction
  const sortedProjects = userProjects?.map(projectMember => {
    const project = projectMember.projects;
    const userActivity = userProjectActivity?.find(activity => activity.project_id === project.id);
    
    return {
      ...projectMember,
      lastUserInteraction: userActivity?.updated_at || userActivity?.created_at || project.updated_at
    };
  }).sort((a, b) => {
    // Sort by most recent user interaction, fallback to project update time
    const aTime = new Date(a.lastUserInteraction || 0).getTime();
    const bTime = new Date(b.lastUserInteraction || 0).getTime();
    return bTime - aTime; // Most recent first
  }).slice(0, 5) || []; // Take top 5 most recently interacted with projects

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
        project_name: item.projects.name,
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

  // Calculate stats for dashboard cards
  const yourProjects = userProjects?.length || 0;
  const totalProjectsInOrg = totalProjects?.length || 0;
  const teamSize = teamMembers?.length || 0;
  
  // Calculate tasks completed this week (tasks that were completed since start of week)
  const tasksCompletedThisWeek = workItems.filter(item => {
    if (item.status !== 'done' && item.status !== 'completed') return false;
    if (!item.updated_at) return false;
    const updatedDate = new Date(item.updated_at);
    return updatedDate >= startOfWeek;
  }).length;

  // Calculate total hours from estimated hours of active tasks
  const totalHours = workItems
    .filter(item => item.status === 'in_progress' || item.status === 'active')
    .reduce((total, item) => total + (item.estimated_hours || 0), 0);

  // Process project updates
  const projectUpdates = projectActivity?.map(activity => ({
    id: activity.id,
    activity_type: activity.activity_type,
    description: activity.description,
    created_at: activity.created_at,
    project_name: activity.projects?.name || 'Unknown Project',
    user_name: userMap.get(activity.user_id)?.full_name || 'Unknown User'
  })) || [];

  // Identify potential blockers (tasks that might be waiting)
  const blockers = workItems
    .filter(item => item.status === 'todo' && item.priority === 'high')
    .map(item => ({
      id: item.id,
      title: item.title,
      status: item.status,
      project_name: item.projects.name,
      reason: 'High priority task not started'
    }));

  const result = {
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
      yourProjects,
      totalProjects: totalProjectsInOrg,
      totalHours,
      tasksCompletedThisWeek,
      teamSize,
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
        project_id: item.project_id,
        project_name: item.projects.name,
        project_emoji: item.projects.emoji,
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
        project_id: item.project_id,
        project_name: item.projects.name,
        project_emoji: item.projects.emoji,
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
        project_id: item.project_id,
        project_name: item.projects.name,
        project_emoji: item.projects.emoji,
        created_at: item.created_at,
        updated_at: item.updated_at,
      })),
    },
    quickActions: {
      recentProjects: sortedProjects.map(p => {
        const projectWorkItemsForProject = projectWorkItems?.filter(item => item.project_id === p.projects.id) || [];
        const resourceCount = projectWorkItemsForProject.filter(item => item.type === 'url').length;
        const taskCount = projectWorkItemsForProject.filter(item => item.type === 'note').length;
        
        return {
          id: p.projects.id,
          name: p.projects.name,
          description: p.projects.description,
          emoji: p.projects.emoji,
          status: p.projects.status,
          progress: p.projects.progress,
          last_activity: p.lastUserInteraction,
          resource_count: resourceCount,
          task_count: taskCount,
        };
      }),
      recentWorkItems: recentWorkItems?.map(item => ({
        id: item.id,
        title: item.title,
        type: item.type,
        status: item.status,
        project_id: item.project_id,
        project_name: item.projects.name,
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
      projectUpdates,
      blockers,
    },
  };

  return result;
}
