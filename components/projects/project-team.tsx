'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  MoreVertical, 
  UserMinus, 
  UserPlus,
  Users
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ProjectsData } from "@/lib/data/projects"

interface ProjectTeamProps {
  project: ProjectsData['projects'][0];
  userRole: string;
  onProjectUpdated: () => void;
}

export function ProjectTeam({ project, userRole }: ProjectTeamProps) {
  const isOwner = userRole === 'owner'

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getUserInitials = (name: string | null) => {
    if (!name) return 'U'
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().substring(0, 2)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </CardTitle>
          <Button variant="outline" size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {project.project_members.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">No team members found for this project.</p>
              <Button variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Team Members
              </Button>
            </div>
          ) : (
            project.project_members.map((member) => (
              <div
                key={member.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/50 rounded-lg gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-primary">
                      {getUserInitials(member.users?.full_name || null)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">
                      {member.users?.full_name || 'Unknown User'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Joined {formatDate(member.joined_at)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:ml-0">
                  <Badge variant="outline" className="capitalize">
                    {member.role}
                  </Badge>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </DropdownMenuItem>
                      {isOwner && (
                        <DropdownMenuItem className="text-destructive">
                          <UserMinus className="h-4 w-4 mr-2" />
                          Remove from team
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
