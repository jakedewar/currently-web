'use client'

import { useCallback, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { StreamHeader } from "@/components/streams/stream-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkItemsList } from "@/components/streams/work-items-list"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Stream, StreamMember, StreamTool, WorkItem } from "@/lib/data/streams"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MessageSquare, MoreVertical, UserMinus } from "lucide-react"

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
  }, [params.id])

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
          <p className="text-muted-foreground">{error}</p>
        </div>
      </Card>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6 lg:space-y-8">
      <StreamHeader
        stream={data.stream}
        userRole={data.currentUser.role}
        onStreamUpdated={fetchStream}
      />

      <Tabs defaultValue="work-items" className="space-y-4">
        <TabsList className="w-full justify-start">
          <div className="flex space-x-2 p-1">
            <TabsTrigger value="overview" className="flex-shrink-0">Overview</TabsTrigger>
            <TabsTrigger value="work-items" className="flex-shrink-0">Work Items</TabsTrigger>
            <TabsTrigger value="team" className="flex-shrink-0">Team</TabsTrigger>
            {data.currentUser.role === 'owner' && (
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

        <TabsContent value="work-items">
          <WorkItemsList
            streamId={data.stream.id}
            workItems={data.stream.work_items}
            onWorkItemCreated={fetchStream}
          />
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
                          {data.currentUser.role === 'owner' && (
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

        {data.currentUser.role === 'owner' && (
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
