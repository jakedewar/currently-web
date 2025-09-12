import { Waves, Users, Clock, Target } from "lucide-react";

export function getStatusColor(status: string): string {
  switch (status) {
    case "active": return "bg-green-500";
    case "in-progress": return "bg-blue-500";
    case "completed": return "bg-green-600";
    case "review": return "bg-yellow-500";
    case "blocked": return "bg-red-500";
    case "todo": return "bg-gray-500";
    default: return "bg-muted-foreground";
  }
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
}

export function getActivityDescription(activity: {
  user_id: string;
  activity_type: string;
  description: string;
  tool?: string | null;
  streams?: { name: string | null } | null;
  work_items?: { title: string | null } | null;
}, userName: string): string {
  const streamName = activity.streams?.name || "a stream";
  const workItemTitle = activity.work_items?.title || "an item";
  
  switch (activity.activity_type) {
    case "stream_created":
      return `${userName} created ${streamName}`;
    case "stream_updated":
      return `${userName} updated ${streamName}`;
    case "work_item_created":
      return `${userName} created ${workItemTitle}`;
    case "work_item_updated":
      return `${userName} updated ${workItemTitle}`;
    case "work_item_completed":
      return `${userName} completed ${workItemTitle}`;
    case "tool_connected":
      return `${userName} connected ${activity.tool} to ${streamName}`;
    case "member_joined":
      return `${userName} joined ${streamName}`;
    case "status_changed":
      return `${userName} changed status of ${workItemTitle}`;
    case "progress_updated":
      return `${userName} updated progress on ${streamName}`;
    default:
      return activity.description;
  }
}

export function getDashboardStats(stats: {
  yourStreams: number;
  totalStreams: number;
  totalHours: number;
  tasksCompletedThisWeek: number;
  teamSize: number;
} | undefined) {
  // Provide default values if stats is undefined
  const safeStats = stats || {
    yourStreams: 0,
    totalStreams: 0,
    totalHours: 0,
    tasksCompletedThisWeek: 0,
    teamSize: 0,
  };

  const hoursStatus = safeStats.totalHours >= 40 ? "Over target" : `${40 - safeStats.totalHours}h to go`;
  const hoursColor = safeStats.totalHours >= 40 ? "text-green-600" : safeStats.totalHours >= 30 ? "text-yellow-600" : "text-red-600";
  
  return [
    {
      title: "Your Streams",
      value: safeStats.yourStreams.toString(),
      description: "",
      icon: Waves,
      trend: `+${safeStats.yourStreams} this week`,
      color: "text-primary",
    },
    {
      title: "Weekly Hours",
      value: `${safeStats.totalHours}h`,
      description: "",
      icon: Clock,
      trend: hoursStatus,
      color: hoursColor,
    },
    {
      title: "Tasks Completed",
      value: safeStats.tasksCompletedThisWeek.toString(),
      description: "",
      icon: Target,
      trend: safeStats.tasksCompletedThisWeek > 0 ? `+${safeStats.tasksCompletedThisWeek} this week` : "No tasks this week",
      color: "text-primary",
    },
    {
      title: "Team Members",
      value: (safeStats.teamSize || 0).toString(),
      description: "",
      icon: Users,
      trend: (safeStats.teamSize || 0) > 1 ? `+${safeStats.teamSize || 0} active` : "Just you",
      color: "text-primary",
    },
  ];
}
