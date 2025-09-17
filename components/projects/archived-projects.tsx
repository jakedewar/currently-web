"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Archive } from "lucide-react";
import { ProjectsData } from "@/lib/data/projects";

interface ArchivedProjectsProps {
  projects: ProjectsData['projects'];
  showArchived: boolean;
  onToggleArchived: () => void;
  onProjectUpdated: () => void;
}

export function ArchivedProjects({
  projects,
  showArchived,
  onToggleArchived,
}: ArchivedProjectsProps) {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Archive className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Archived Projects</h2>
          <Badge variant="secondary">{projects.length}</Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleArchived}
        >
          {showArchived ? 'Hide' : 'Show'} Archived
        </Button>
      </div>
      
      {showArchived && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="p-4 border rounded-lg bg-muted/30 opacity-75"
            >
              <div className="flex items-center gap-2 mb-2">
                {project.emoji && (
                  <span className="text-lg">{project.emoji}</span>
                )}
                <h3 className="font-medium">{project.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {project.description || "No description available"}
              </p>
              <div className="mt-2 text-xs text-muted-foreground">
                {project.project_members.length} members
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
