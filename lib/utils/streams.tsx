import { CircleCheck, Circle, AlertCircle, Calendar, FileText, MessageSquare, Figma } from "lucide-react";
import { StreamsData } from "@/lib/data/streams";

export function getStatusIcon(status: string) {
  switch (status) {
    case "completed": return <CircleCheck className="h-3 w-3 text-green-500" />;
    case "in-progress": return <Circle className="h-3 w-3 text-blue-500" />;
    case "todo": return <Circle className="h-3 w-3 text-gray-400" />;
    default: return <AlertCircle className="h-3 w-3 text-yellow-500" />;
  }
}

export function getToolIcon(tool: string) {
  switch (tool.toLowerCase()) {
    case "figma": return <Figma className="h-3 w-3" />;
    case "github": return <FileText className="h-3 w-3" />;
    case "notion": return <FileText className="h-3 w-3" />;
    case "linear": return <Calendar className="h-3 w-3" />;
    case "slack": return <MessageSquare className="h-3 w-3" />;
    case "google docs": return <FileText className="h-3 w-3" />;
    case "google analytics": return <FileText className="h-3 w-3" />;
    default: return <FileText className="h-3 w-3" />;
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "high": return "bg-red-500";
    case "medium": return "bg-yellow-500";
    case "low": return "bg-green-500";
    default: return "bg-gray-500";
  }
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return "No date";
  return new Date(dateString).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
}

export function filterStreams(
  streams: StreamsData['streams'],
  filters: {
    searchQuery: string;
    statusFilter: "all" | "active" | "completed" | "paused" | "archived";
    priorityFilter: "all" | "high" | "medium" | "low";
    streamFilter: "all" | "my";
    sortBy: "progress" | "name" | "startDate" | "endDate";
  },
  currentUserId: string
) {
  let filtered = streams;

  // Filter by stream type (My Streams vs All Streams)
  if (filters.streamFilter === "my") {
    filtered = filtered.filter(stream => 
      // Include streams where user is either a member or the creator
      stream.stream_members.some(member => member.user_id === currentUserId) ||
      stream.created_by === currentUserId
    );
  }

  // Filter by search query
  if (filters.searchQuery) {
    filtered = filtered.filter(stream =>
      stream.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      (stream.description && stream.description.toLowerCase().includes(filters.searchQuery.toLowerCase())) ||
      stream.stream_members.some(member => 
        member.users?.full_name && member.users.full_name.toLowerCase().includes(filters.searchQuery.toLowerCase())
      )
    );
  }

  // Filter by status
  if (filters.statusFilter !== "all") {
    filtered = filtered.filter(stream => stream.status === filters.statusFilter);
  }

  // Filter by priority
  if (filters.priorityFilter !== "all") {
    filtered = filtered.filter(stream => stream.priority === filters.priorityFilter);
  }

  // Sort streams
  filtered.sort((a, b) => {
    switch (filters.sortBy) {
      case "progress":
        return b.progress - a.progress;
      case "name":
        return a.name.localeCompare(b.name);
      case "startDate":
        return new Date(a.start_date || '').getTime() - new Date(b.start_date || '').getTime();
      case "endDate":
        return new Date(a.end_date || '').getTime() - new Date(b.end_date || '').getTime();
      default:
        return 0;
    }
  });

  return filtered;
}

export function getEmptyStateMessage(
  streamFilter: "all" | "my",
  hasOtherFilters: boolean
) {
  if (hasOtherFilters) {
    return {
      title: "No streams match your filters",
      description: "Try adjusting your search or filters"
    };
  }
  
  switch (streamFilter) {
    case "my":
      return {
        title: "You're not part of any streams yet",
        description: "Join existing streams or create your own to get started"
      };
    default:
      return {
        title: "No streams found",
        description: "Create your first stream to start organizing your team's work"
      };
  }
}
