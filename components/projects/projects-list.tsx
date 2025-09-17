"use client";

import { useState, useMemo, useEffect } from "react";
import { ProjectsData } from "@/lib/data/projects";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { ProjectFilters } from "./project-filters";
import { ProjectCard } from "./project-card";
import { ProjectPagination } from "./project-pagination";
import { ProjectEmptyState } from "./project-empty-state";
import { ArchivedProjects } from "./archived-projects";
import { 
  filterProjects, 
  getEmptyStateMessage,
} from "@/lib/utils/projects";

interface ProjectsListProps {
  data: ProjectsData;
  pathname?: string;
  projectsPerPage?: number;
}

export function ProjectsList({ data, pathname: customPathname, projectsPerPage = 6 }: ProjectsListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [joiningProjects, setJoiningProjects] = useState<Set<string>>(new Set());
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed" | "paused" | "archived">("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [projectFilter, setProjectFilter] = useState<"all" | "my">("all");
  const [sortBy, setSortBy] = useState<"progress" | "name" | "startDate" | "endDate">("progress");
  const [showArchived, setShowArchived] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter projects based on current filters
  const filteredProjects = useMemo(() => {
    return filterProjects(
      data.projects,
      {
        searchQuery,
        statusFilter,
        priorityFilter,
        projectFilter,
        sortBy,
      },
      data.currentUser.id
    );
  }, [data.projects, searchQuery, statusFilter, priorityFilter, projectFilter, sortBy, data.currentUser.id]);

  // Separate archived projects
  const archivedProjects = data.projects.filter(project => project.status === 'archived');
  const activeProjects = filteredProjects.filter(project => project.status !== 'archived');

  // Pagination logic
  const totalPages = Math.ceil(activeProjects.length / projectsPerPage);
  const startIndex = (currentPage - 1) * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const paginatedProjects = activeProjects.slice(startIndex, endIndex);

  // Reset to first page when filters change
  const resetPagination = () => {
    setCurrentPage(1);
  };

  // Update pagination when filters change
  useEffect(() => {
    resetPagination();
  }, [searchQuery, statusFilter, priorityFilter, projectFilter, sortBy]);

  const hasOtherFilters = Boolean(searchQuery) || statusFilter !== "all" || priorityFilter !== "all";
  const emptyState = getEmptyStateMessage(projectFilter, hasOtherFilters);

  const handleJoinProject = async (projectId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click
    setJoiningProjects(prev => new Set(prev).add(projectId));
    
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'join',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join project');
      }

      toast({
        title: "Joined project",
        description: "You have successfully joined the project",
      });
      
      // Refresh the page to update the project list
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to join project: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setJoiningProjects(prev => {
        const newSet = new Set(prev);
        newSet.delete(projectId);
        return newSet;
      });
    }
  };

  const isUserMemberOfProject = (project: ProjectsData['projects'][0]) => {
    return project.project_members.some((member) => member.user_id === data.currentUser.id);
  };

  const isUserOwnerOfProject = (project: ProjectsData['projects'][0]) => {
    return project.created_by === data.currentUser.id;
  };

  const handleProjectClick = (projectId: string) => {
    // Store the current path as the referrer
    sessionStorage.setItem('projectReferrer', customPathname || pathname)
    router.push(`/protected/projects/${projectId}`)
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <ProjectFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        projectFilter={projectFilter}
        onProjectFilterChange={setProjectFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedProjects.map((project) => {
          const isMember = isUserMemberOfProject(project);
          const isOwner = isUserOwnerOfProject(project);
          const canJoin = !isMember && !isOwner;
          const isJoining = joiningProjects.has(project.id);

          return (
            <ProjectCard
              key={project.id}
              project={project}
              currentUser={data.currentUser}
              isMember={isMember}
              isOwner={isOwner}
              canJoin={canJoin}
              isJoining={isJoining}
              onJoin={(e) => handleJoinProject(project.id, e)}
              onClick={() => handleProjectClick(project.id)}
            />
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <ProjectPagination
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={activeProjects.length}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Empty State */}
      {activeProjects.length === 0 && (
        <ProjectEmptyState emptyState={emptyState} />
      )}

      {/* Archived Projects Section */}
      {archivedProjects.length > 0 && (
        <ArchivedProjects
          projects={archivedProjects}
          showArchived={showArchived}
          onToggleArchived={() => setShowArchived(!showArchived)}
          onProjectUpdated={() => window.location.reload()}
        />
      )}
    </div>
  );
}
