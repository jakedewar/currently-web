import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface Stream {
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
}

export interface StreamMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string | null;
  stream_id: string;
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
  url?: string | null;
  created_at: string | null;
  updated_at: string | null;
  stream_id: string;
  created_by: string;
}

export interface StreamTool {
  id: string;
  tool_name: string;
  tool_type: string | null;
  connected_at: string | null;
  stream_id: string;
}

export interface StreamsData {
  streams: Array<{
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
    stream_members: StreamMember[];
    work_items: WorkItem[];
    stream_tools: StreamTool[];
  }>;
  currentUser: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export async function getUserStreams(userId: string): Promise<StreamsData> {
  const supabase = await createClient();

  // Get current user for comparison
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/auth/login");
  }

  // Get user's organization
  const { data: userOrg } = await supabase
    .from('organization_members')
    .select(`
      organization_id,
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

  // Get all streams where the user is a member
  const { data: streamMembers } = await supabase
    .from('stream_members')
    .select('stream_id')
    .eq('user_id', userId);

  const streamIds = streamMembers?.map(sm => sm.stream_id) || [];

  // Get streams data
  const { data: streams } = await supabase
    .from('streams')
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
    .in('id', streamIds)
    .eq('organization_id', userOrg.organization_id)
    .order('updated_at', { ascending: false });

  // Get stream members
  const { data: allStreamMembers } = await supabase
    .from('stream_members')
    .select('id, user_id, role, joined_at, stream_id')
    .in('stream_id', streamIds);

  // Get user details for members
  const userIds = allStreamMembers?.map(member => member.user_id) || [];
  const { data: userDetails } = await supabase
    .from('users')
    .select('id, full_name, avatar_url')
    .in('id', userIds);

  // Combine member data
  const streamMembersWithUsers = allStreamMembers?.map(member => ({
    id: member.id,
    user_id: member.user_id,
    role: member.role,
    joined_at: member.joined_at,
    stream_id: member.stream_id,
    users: userDetails?.find(user => user.id === member.user_id) || null
  })) || [];

  // Get work items
  const { data: workItems, error: workItemsError } = await supabase
    .from('work_items')
    .select('*')
    .in('stream_id', streamIds);

  // Get stream tools
  const { data: streamTools } = await supabase
    .from('stream_tools')
    .select(`
      id,
      tool_name,
      tool_type,
      connected_at,
      stream_id
    `)
    .in('stream_id', streamIds);

  // Combine all data
  const streamsWithRelations = streams?.map(stream => ({
    ...stream,
    stream_members: streamMembersWithUsers.filter(m => m.stream_id === stream.id),
    work_items: !workItemsError && workItems ? workItems.filter(w => w.stream_id === stream.id) : [],
    stream_tools: streamTools?.filter(t => t.stream_id === stream.id) || []
  })) || [];

  return {
    streams: streamsWithRelations,
    currentUser: {
      id: user.id,
      full_name: user.user_metadata?.full_name || null,
      avatar_url: user.user_metadata?.avatar_url || null,
    },
  };
}

export async function getStreamsData(): Promise<StreamsData> {
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

  // Get all streams for the organization with related data
  const { data: streams } = await supabase
    .from('streams')
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
    .eq('organization_id', organizationId)
    .order('updated_at', { ascending: false });

  // Get stream members and user details separately
  const streamIds = streams?.map(s => s.id) || [];
  const { data: streamMembers } = await supabase
    .from('stream_members')
    .select('id, user_id, role, joined_at, stream_id')
    .in('stream_id', streamIds);

  // Get user details
  const userIds = streamMembers?.map(member => member.user_id) || [];
  const { data: users } = await supabase
    .from('users')
    .select('id, full_name, avatar_url')
    .in('id', userIds);

  // Combine stream members with user details
  const streamMembersWithUsers = streamMembers?.map(member => ({
    ...member,
    users: users?.find(user => user.id === member.user_id) || null
  })) || [];

  // Get work items for streams
  const { data: workItems, error: workItemsError } = await supabase
    .from('work_items')
    .select('*')
    .in('stream_id', streamIds);

  // Get stream tools
  const { data: streamTools } = await supabase
    .from('stream_tools')
    .select(`
      id,
      tool_name,
      tool_type,
      connected_at,
      stream_id
    `)
    .in('stream_id', streamIds);

  // Combine the data
  const streamsWithRelations = streams?.map(stream => ({
    ...stream,
    stream_members: streamMembersWithUsers.filter(m => m.stream_id === stream.id) || [],
    work_items: !workItemsError && workItems ? workItems.filter(w => w.stream_id === stream.id) : [],
    stream_tools: streamTools?.filter(t => t.stream_id === stream.id) || []
  })) || [];

  return {
    streams: streamsWithRelations,
    currentUser: {
      id: user.id,
      full_name: user.user_metadata?.full_name || null,
      avatar_url: user.user_metadata?.avatar_url || null,
    },
  };
}
