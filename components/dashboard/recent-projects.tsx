'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FolderOpen, Clock, ArrowRight, TrendingUp, Link as LinkIcon, CircleCheck, Waves } from "lucide-react"
import Link from "next/link"
import { CurrentlyDashboardData } from "@/lib/data/currently-dashboard"

interface RecentProjectsProps {
  quickActions: CurrentlyDashboardData['quickActions']
}

export function RecentProjects({ quickActions }: RecentProjectsProps) {
  const { recentProjects } = quickActions

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))

    if (diffDays > 0) return `${diffDays}d ago`
    if (diffHours > 0) return `${diffHours}h ago`
    return 'Just now'
  }



  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Waves className="h-5 w-5 text-primary" />
          Recent Projects
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentProjects && recentProjects.length > 0 ? (
          <div className="space-y-3">
            {recentProjects.slice(0, 4).map((project) => (
              <div key={project.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate mb-1 flex items-center gap-2">
                      {project.emoji && <span className="text-base">{project.emoji}</span>}
                      {project.name}
                    </h4>
                    {project.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/protected/projects/${project.id}`}>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-end">
                    <span className="text-xs text-muted-foreground">
                      {project.progress}%
                    </span>
                  </div>
                  
                  <Progress 
                    value={project.progress} 
                    className="h-2"
                  />
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Updated {formatTimeAgo(project.last_activity)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <LinkIcon className="h-3 w-3" />
                        <span>{project.resource_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <CircleCheck className="h-3 w-3" />
                        <span>{project.task_count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {recentProjects.length > 4 && (
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/protected/projects">
                    View all projects
                  </Link>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent projects</p>
            <p className="text-xs">Join a project to see it here</p>
            <Button variant="outline" size="sm" className="mt-3" asChild>
              <Link href="/protected/projects">
                <TrendingUp className="h-4 w-4 mr-2" />
                Browse Projects
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
