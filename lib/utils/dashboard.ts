import { Clock, FolderOpen, TrendingUp, Users } from "lucide-react";

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
  activeStreams: number;
  timeSaved: number;
  contextSwitchesReduction: number;
  teamSize: number;
}) {
  return [
    {
      title: "Active Streams",
      value: stats.activeStreams.toString(),
      description: "Streams you're working on",
      icon: FolderOpen,
      trend: stats.activeStreams > 0 ? `+${stats.activeStreams} active` : "No active streams",
      color: "text-primary",
    },
    {
      title: "Time Saved",
      value: `${stats.timeSaved.toFixed(1)}h`,
      description: "Estimated time saved",
      icon: Clock,
      trend: stats.timeSaved > 0 ? `+${(stats.timeSaved * 2).toFixed(0)} items completed` : "No items completed",
      color: "text-primary",
    },
    {
      title: "Context Switches",
      value: stats.contextSwitchesReduction.toString(),
      description: "Reduced from 67",
      icon: TrendingUp,
      trend: stats.contextSwitchesReduction > 0 ? `-${Math.round((stats.contextSwitchesReduction / 67) * 100)}%` : "No reduction",
      color: "text-primary",
    },
    {
      title: "Team Members",
      value: stats.teamSize.toString(),
      description: "Active collaborators",
      icon: Users,
      trend: stats.teamSize > 1 ? `${stats.teamSize} members` : "Just you",
      color: "text-primary",
    },
  ];
}
