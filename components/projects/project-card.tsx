"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ui/status-badge";
import { PriorityIndicator } from "@/components/ui/priority-indicator";
import { 
  Calendar,
  Users,
  UserPlus,
  Link,
  CircleCheck,
} from "lucide-react";
import { ProjectsData } from "@/lib/data/projects";
import { formatDate } from "@/lib/utils/projects";

interface ProjectCardProps {
  project: ProjectsData['projects'][0];
  currentUser: ProjectsData['currentUser'];
  isMember: boolean;
  isOwner: boolean;
  canJoin: boolean;
  isJoining: boolean;
  onJoin: (e: React.MouseEvent) => void;
  onClick: () => void;
}

export function ProjectCard({
  project,
  isMember,
  isOwner,
  canJoin,
  isJoining,
  onJoin,
  onClick,
}: ProjectCardProps) {
  // Helper functions to count resources and tasks
  const getResourceCount = () => {
    return project.work_items.filter(item => item.type === 'url').length;
  };

  const getTaskCount = () => {
    return project.work_items.filter(item => item.type === 'note').length;
  };

  return (
    <Card
      className={`hover:shadow-md transition-shadow cursor-pointer mb-3 p-4 h-full flex flex-col ${
        project.status === 'archived' ? 'opacity-75 bg-muted/30' : ''
      } ${canJoin ? 'border-blue-200 hover:border-blue-300' : ''}`}
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        {/* Header with priority, status, and role/join button */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <PriorityIndicator priority={project.priority} />
            {project.status !== 'active' && (
              <StatusBadge status={project.status} variant="compact" />
            )}
          </div>
          
          {/* Role indicator or Join button */}
          <div className="flex-shrink-0">
            {isOwner && (
              <Badge variant="outline" className="text-xs">
                Owner
              </Badge>
            )}
            {isMember && !isOwner && (
              <Badge variant="outline" className="text-xs">
                Member
              </Badge>
            )}
            {canJoin && (
              <Button
                size="sm"
                onClick={onJoin}
                disabled={isJoining}
                className="bg-blue-600 hover:bg-blue-700 text-white h-6 px-2 text-xs"
              >
                {isJoining ? (
                  <>
                    <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-white mr-1" />
                    Joining
                  </>
                ) : (
                  <>
                    <UserPlus className="h-3 w-3 mr-1" />
                    Join
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
        
        {/* Title with emoji */}
        <div className="flex items-center gap-2 mb-3">
          {project.emoji && (
            <span className="text-xl">{project.emoji}</span>
          )}
          <h3 className="text-lg font-semibold line-clamp-2 hover:text-primary">
            {project.name}
          </h3>
        </div>
        
        {/* Description - flexible height */}
        <div className="flex-1 mb-3">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {project.description || "No description available"}
          </p>
        </div>
        
        {/* Progress - fixed at bottom */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-muted-foreground">Progress</span>
            <span className="text-xs text-muted-foreground">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-1.5" />
        </div>
        
        {/* Metadata - fixed at bottom */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(project.start_date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{project.project_members.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              <Link className="h-3 w-3" />
              <span>{getResourceCount()}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              <CircleCheck className="h-3 w-3" />
              <span>{getTaskCount()}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
