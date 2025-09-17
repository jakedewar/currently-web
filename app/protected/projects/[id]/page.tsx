'use client'

import { useCallback, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ProjectHeader } from "@/components/projects/project-header"
import { ProjectOverview } from "@/components/projects/project-overview"
import { ProjectResources } from "@/components/projects/project-resources"
import { ProjectTasks } from "@/components/projects/project-tasks"
import { ProjectTeam } from "@/components/projects/project-team"
import { ProjectSettings } from "@/components/projects/project-settings"
import { ProjectSlackMessages } from "@/components/projects/project-slack-messages"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ProjectsData } from "@/lib/data/projects"

interface ProjectData {
  project: ProjectsData['projects'][0] & {
    project_members: ProjectsData['projects'][0]['project_members'][];
    work_items: ProjectsData['projects'][0]['work_items'][];
    project_tools: ProjectsData['projects'][0]['project_tools'][];
    slack_messages: Array<{
      id: string;
      text: string;
      user_name: string;
      created_at: string;
      thread_ts?: string;
    }>;
    activity: Array<{
      id: string;
      type: string;
      created_at: string;
      user_id: string;
      metadata: Record<string, unknown>;
    }>;
  };
  currentUser: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role: string;
  };
}

export default function ProjectPage() {
  const params = useParams()
  const [data, setData] = useState<ProjectData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isJoining, setIsJoining] = useState(false)
  const { toast } = useToast()

  const fetchProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch project')
      }

      setData(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching project:', err)
      setError(err instanceof Error ? err.message : 'Failed to load project')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  const handleJoinProject = async () => {
    setIsJoining(true)
    try {
      const response = await fetch(`/api/projects/${params.id}`, {
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
      
      // Refresh the project data
      await fetchProject()
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

  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  if (loading) {
    return (
      <div className="space-y-6 lg:space-y-8">
        <div className="space-y-4 pb-4 border-b">
          {/* Back button skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-32" />
          </div>

          {/* Header skeleton */}
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-7 lg:h-8 w-48" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-3 w-3 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-4 w-full lg:w-96" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>

          {/* Metadata skeleton */}
          <div className="flex flex-col lg:flex-row gap-4 pt-4 border-t">
            <Skeleton className="h-4 w-48" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-2 w-32" />
            </div>
          </div>
        </div>

        {/* Tabs skeleton */}
        <div className="space-y-4">
          <div className="flex space-x-2 p-1">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-[100px] flex-shrink-0" />
            ))}
          </div>

          {/* Content skeleton */}
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p className="text-muted-foreground">
            The project you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </p>
        </div>
      </Card>
    )
  }

  if (!data) return null

  const isMember = data.currentUser.role !== 'non_member'
  const isOwner = data.currentUser.role === 'owner'

  return (
    <div className="space-y-6 lg:space-y-8">
      <ProjectHeader
        project={data.project}
        userRole={data.currentUser.role}
        onProjectUpdated={fetchProject}
      />

      {!isMember && (
        <Card className="p-4">
          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <UserPlus className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Join this project to contribute
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-200">
                You can view all content, but join to add work items and participate
              </p>
            </div>
            <Button 
              onClick={handleJoinProject} 
              disabled={isJoining}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {isJoining ? 'Joining...' : 'Join'}
            </Button>
          </div>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="w-full justify-start">
          <div className="flex space-x-2 p-1">
            <TabsTrigger value="overview" className="flex-shrink-0">Overview</TabsTrigger>
            <TabsTrigger value="resources" className="flex-shrink-0">Resources</TabsTrigger>
            <TabsTrigger value="tasks" className="flex-shrink-0">Tasks</TabsTrigger>
            <TabsTrigger value="slack" className="flex-shrink-0">Slack Messages</TabsTrigger>
            <TabsTrigger value="team" className="flex-shrink-0">Team</TabsTrigger>
            {isOwner && (
              <TabsTrigger value="settings" className="flex-shrink-0">Settings</TabsTrigger>
            )}
          </div>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ProjectOverview project={data.project} />
        </TabsContent>

        <TabsContent value="resources">
          <ProjectResources
            project={data.project}
            userRole={data.currentUser.role}
            onProjectUpdated={fetchProject}
          />
        </TabsContent>

        <TabsContent value="tasks">
          <ProjectTasks
            project={data.project}
            userRole={data.currentUser.role}
            onProjectUpdated={fetchProject}
          />
        </TabsContent>

        <TabsContent value="slack" className="space-y-4">
          <ProjectSlackMessages 
            userRole={data.currentUser.role}
            onProjectUpdated={fetchProject}
          />
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <ProjectTeam
            project={data.project}
            userRole={data.currentUser.role}
            onProjectUpdated={fetchProject}
          />
        </TabsContent>

        {isOwner && (
          <TabsContent value="settings">
            <ProjectSettings
              project={data.project}
              userRole={data.currentUser.role}
              onProjectUpdated={fetchProject}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
