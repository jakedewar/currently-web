'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { StatusBadge } from "@/components/ui/status-badge"
import { PriorityIndicator } from "@/components/ui/priority-indicator"
import { 
  MoreVertical, 
  UserPlus, 
  UserMinus, 
  Archive,
  Calendar,
  Users,
  Clock
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { ProjectsData } from "@/lib/data/projects"

interface ProjectHeaderProps {
  project: ProjectsData['projects'][0];
  userRole: string;
  onProjectUpdated: () => void;
}

export function ProjectHeader({ project, userRole, onProjectUpdated }: ProjectHeaderProps) {
  const [isJoining, setIsJoining] = useState(false)
  const { toast } = useToast()

  const isMember = userRole !== 'non_member'
  const isOwner = userRole === 'owner'

  const handleJoinProject = async () => {
    setIsJoining(true)
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'join',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to join project')
      }

      toast({
        title: "Joined project",
        description: "You have successfully joined the project",
      })
      
      onProjectUpdated()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to join project: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setIsJoining(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No date'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-4 pb-4 border-b">
      {/* Back button */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
          ← Back
        </Button>
      </div>

      {/* Project title and metadata */}
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
              {project.emoji && <span className="mr-2">{project.emoji}</span>}
              {project.name}
            </h1>
            <div className="flex items-center gap-2">
              <StatusBadge status={project.status} />
              <PriorityIndicator priority={project.priority} />
            </div>
          </div>
          {project.description && (
            <p className="text-muted-foreground text-base lg:text-lg">
              {project.description}
            </p>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {project.project_members.length} members
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Created {formatDate(project.created_at)}
          </Badge>
          {project.start_date && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Started {formatDate(project.start_date)}
            </Badge>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-muted-foreground">{project.progress}%</span>
        </div>
        <Progress value={project.progress} className="h-2" />
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!isMember && (
            <Button 
              onClick={handleJoinProject} 
              disabled={isJoining}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {isJoining ? 'Joining...' : 'Join Project'}
            </Button>
          )}
        </div>
        
        {isMember && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite members
              </DropdownMenuItem>
              {isOwner && (
                <>
                  <DropdownMenuItem>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive project
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <UserMinus className="h-4 w-4 mr-2" />
                    Delete project
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}
