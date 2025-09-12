'use client'

import { useCallback, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { StreamHeader } from "@/components/streams/stream-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkItemsList } from "@/components/streams/work-items-list"
import { TasksList } from "@/components/streams/tasks-list"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Stream, StreamMember, StreamTool, WorkItem } from "@/lib/data/streams"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MessageSquare, MoreVertical, UserMinus, UserPlus, Archive } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface StreamData {
  stream: Stream & {
    stream_members: StreamMember[];
    work_items: WorkItem[];
    stream_tools: StreamTool[];
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

export default function StreamPage() {
  const params = useParams()
  const [data, setData] = useState<StreamData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isJoining, setIsJoining] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const { toast } = useToast()

  const fetchStream = useCallback(async () => {
    try {
      const response = await fetch(`/api/streams/${params.id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stream')
      }

      setData(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching stream:', err)
      setError(err instanceof Error ? err.message : 'Failed to load stream')
    } finally {
      setLoading(false)
    }
  }, [params.id]) // ✅ Only depend on the stream ID

  // More efficient update function for work items
  const updateWorkItem = useCallback((updatedItem: WorkItem) => {
    setData(prevData => {
      if (!prevData) return prevData
      
      return {
        ...prevData,
        stream: {
          ...prevData.stream,
          work_items: prevData.stream.work_items.map(item => 
            item.id === updatedItem.id ? updatedItem : item
          )
        }
      }
    })
  }, [])

  const handleJoinStream = async () => {
    setIsJoining(true)
    try {
      const response = await fetch(`/api/streams/${params.id}`, {
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
        throw new Error(errorData.error || 'Failed to join stream')
      }

      toast({
        title: "Joined stream",
        description: "You have successfully joined the stream",
      })
      
      // Refresh the stream data
      await fetchStream()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to join stream: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setIsJoining(false)
    }
  }

  useEffect(() => {
    fetchStream()
  }, [fetchStream])

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
            The stream you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
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
      <StreamHeader
        stream={data.stream}
        userRole={data.currentUser.role}
        onStreamUpdated={fetchStream}
      />

      {!isMember && (
        <Card className="p-4">
          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <UserPlus className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Join this stream to contribute
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-200">
                You can view all content, but join to add work items and participate
              </p>
            </div>
            <Button 
              onClick={handleJoinStream} 
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

      <Tabs defaultValue="resources" className="space-y-4">
        <TabsList className="w-full justify-start">
          <div className="flex space-x-2 p-1">
            <TabsTrigger value="overview" className="flex-shrink-0">Overview</TabsTrigger>
            <TabsTrigger value="resources" className="flex-shrink-0">Resources</TabsTrigger>
            <TabsTrigger value="tasks" className="flex-shrink-0">Tasks</TabsTrigger>
            <TabsTrigger value="team" className="flex-shrink-0">Team</TabsTrigger>
            {isOwner && (
              <TabsTrigger value="settings" className="flex-shrink-0">Settings</TabsTrigger>
            )}
          </div>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="p-4 lg:p-6">
            <h2 className="text-lg font-semibold mb-4">Stream Overview</h2>
            <p className="text-muted-foreground">
              {data.stream.description || "No description available"}
            </p>
          </Card>
          
          <Card className="p-4 lg:p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <p className="text-muted-foreground">
              Activity feed coming soon...
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <div className="space-y-4">
            <WorkItemsList
              streamId={data.stream.id}
              workItems={data.stream.work_items.filter(item => item.type === 'url' && item.status !== 'archived')}
              onWorkItemCreated={fetchStream}
              canAddItems={isMember}
              type="resources"
            />
            
            {/* Archived Resources Section */}
            {data.stream.work_items.filter(item => item.type === 'url' && item.status === 'archived').length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Archive className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-lg font-semibold">Archived Resources</h2>
                    <Badge variant="secondary">
                      {data.stream.work_items.filter(item => item.type === 'url' && item.status === 'archived').length}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowArchived(!showArchived)}
                  >
                    {showArchived ? 'Hide' : 'Show'} Archived
                  </Button>
                </div>
                
                {showArchived && (
                  <WorkItemsList
                    streamId={data.stream.id}
                    workItems={data.stream.work_items.filter(item => item.type === 'url' && item.status === 'archived')}
                    onWorkItemCreated={fetchStream}
                    canAddItems={isMember}
                    type="resources"
                  />
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <div className="space-y-4">
            <TasksList
              streamId={data.stream.id}
              workItems={data.stream.work_items.filter(item => item.type === 'note' && item.status !== 'archived')}
              onWorkItemCreated={fetchStream}
              onWorkItemUpdated={updateWorkItem}
              canAddItems={isMember}
            />
            
            {/* Archived Tasks Section */}
            {data.stream.work_items.filter(item => item.type === 'note' && item.status === 'archived').length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Archive className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-lg font-semibold">Archived Tasks</h2>
                    <Badge variant="secondary">
                      {data.stream.work_items.filter(item => item.type === 'note' && item.status === 'archived').length}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowArchived(!showArchived)}
                  >
                    {showArchived ? 'Hide' : 'Show'} Archived
                  </Button>
                </div>
                
                {showArchived && (
                  <TasksList
                    streamId={data.stream.id}
                    workItems={data.stream.work_items.filter(item => item.type === 'note' && item.status === 'archived')}
                    onWorkItemCreated={fetchStream}
                    onWorkItemUpdated={updateWorkItem}
                    canAddItems={isMember}
                  />
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card className="p-4 lg:p-6">
            <h2 className="text-lg font-semibold mb-4">Team Members</h2>
            <div className="space-y-4">
              {data.stream.stream_members.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No team members found for this stream.</p>
                </div>
              ) : (
                data.stream.stream_members.map((member) => (
                  <div
                    key={member.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/50 rounded-lg gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-primary">
                          {member.users?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{member.users?.full_name || 'Unknown User'}</div>
                        <div className="text-sm text-muted-foreground capitalize">{member.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:ml-0">
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
          </Card>
        </TabsContent>

        {isOwner && (
          <TabsContent value="settings">
            <Card className="p-4 lg:p-6">
              <h2 className="text-lg font-semibold mb-4">Stream Settings</h2>
              <p className="text-muted-foreground">
                Stream settings coming soon...
              </p>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
