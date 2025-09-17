import { ProjectsData } from "@/lib/data/projects";

export interface ProjectFilters {
  searchQuery: string;
  statusFilter: "all" | "active" | "completed" | "paused" | "archived";
  priorityFilter: "all" | "high" | "medium" | "low";
  projectFilter: "all" | "my";
  sortBy: "progress" | "name" | "startDate" | "endDate";
}

export function filterProjects(
  projects: ProjectsData['projects'],
  filters: ProjectFilters,
  currentUserId: string
): ProjectsData['projects'] {
  let filtered = [...projects];

  // Filter by search query
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(project => 
      project.name.toLowerCase().includes(query) ||
      project.description?.toLowerCase().includes(query) ||
      project.project_members.some(member => 
        member.users?.full_name?.toLowerCase().includes(query)
      )
    );
  }

  // Filter by status
  if (filters.statusFilter !== "all") {
    filtered = filtered.filter(project => project.status === filters.statusFilter);
  }

  // Filter by priority
  if (filters.priorityFilter !== "all") {
    filtered = filtered.filter(project => project.priority === filters.priorityFilter);
  }

  // Filter by project ownership/membership
  if (filters.projectFilter === "my") {
    filtered = filtered.filter(project => 
      project.created_by === currentUserId ||
      project.project_members.some(member => member.user_id === currentUserId)
    );
  }

  // Sort projects
  filtered.sort((a, b) => {
    switch (filters.sortBy) {
      case "progress":
        return b.progress - a.progress;
      case "name":
        return a.name.localeCompare(b.name);
      case "startDate":
        if (!a.start_date && !b.start_date) return 0;
        if (!a.start_date) return 1;
        if (!b.start_date) return -1;
        return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
      case "endDate":
        if (!a.end_date && !b.end_date) return 0;
        if (!a.end_date) return 1;
        if (!b.end_date) return -1;
        return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
      default:
        return 0;
    }
  });

  return filtered;
}

export function getEmptyStateMessage(
  projectFilter: "all" | "my",
  hasOtherFilters: boolean
): { title: string; description: string } {
  if (projectFilter === "my") {
    if (hasOtherFilters) {
      return {
        title: "No projects match your filters",
        description: "Try adjusting your search or filter criteria to find projects you're involved in."
      };
    }
    return {
      title: "You're not part of any projects yet",
      description: "Join existing projects or create new ones to get started with team collaboration."
    };
  }

  if (hasOtherFilters) {
    return {
      title: "No projects match your filters",
      description: "Try adjusting your search or filter criteria to find what you're looking for."
    };
  }

  return {
    title: "No projects yet",
    description: "Create your first project to start organizing your team's work and tracking progress."
  };
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return "No date";
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return "Invalid date";
  }
}
