'use client'

import type { Stream, StreamMember, WorkItem } from '@/lib/data/streams'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { PriorityIndicator } from '@/components/ui/priority-indicator'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Calendar,
  MoreHorizontal,
  Eye,
  User,
  Users,
  CheckCircle,
  XCircle,
  Link as LinkIcon,
  UserPlus
} from 'lucide-react'
import { formatDate } from '@/lib/utils/streams'
import { WorkItemsList } from './work-items-list'
import { TasksList } from './tasks-list'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'

interface StreamProps {
  stream: Stream & {
    stream_members: StreamMember[];
    work_items: WorkItem[];
  };
  currentUserId: string;
  onStreamUpdated: () => void;
}

export function Stream({ stream, currentUserId, onStreamUpdated }: StreamProps) {
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)

  const handleWorkItemCreated = () => {
    onStreamUpdated()
  }

  const handleCopyStreamLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/protected/streams/${stream.id}`)
      toast({
        title: "Link copied",
        description: "Stream link copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to copy link: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    }
  }

  const handleArchiveStream = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/streams/${stream.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_status',
          status: 'archived',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to archive stream')
      }

      toast({
        title: "Stream archived",
        description: "The stream has been archived successfully",
      })
      onStreamUpdated()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to archive stream: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUnarchiveStream = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/streams/${stream.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_status',
          status: 'active',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to unarchive stream')
      }

      toast({
        title: "Stream unarchived",
        description: "The stream has been unarchived and is now active",
      })
      onStreamUpdated()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to unarchive stream: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleJoinStream = async () => {
    setIsJoining(true)
    try {
      const response = await fetch(`/api/streams/${stream.id}`, {
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
      onStreamUpdated()
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



  const isCurrentUserMember = stream.stream_members.some(member => member.user_id === currentUserId)
  const isCurrentUserOwner = stream.created_by === currentUserId

  return (
    <AccordionItem value={`stream-${stream.id}`} className={`border rounded-lg ${stream.status === 'archived' ? 'opacity-75 bg-muted/30' : ''}`}>
      <AccordionTrigger className="px-6 py-4 hover:no-underline group">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full pr-4 gap-4 sm:gap-0">
          {/* Stream Header Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 flex-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h3 className="text-lg font-semibold">{stream.name}</h3>
              <div className="flex items-center gap-2">
                <StatusBadge status={stream.status} variant="compact" />
                <PriorityIndicator priority={stream.priority} />
              </div>
              {isCurrentUserMember && (
                <Badge variant="outline" className="text-xs">
                  <User className="h-3 w-3 mr-1" />
                  Member
                </Badge>
              )}
              {isCurrentUserOwner && (
                <Badge variant="outline" className="text-xs">
                  <Eye className="h-3 w-3 mr-1" />
                  Owner
                </Badge>
              )}
              {!isCurrentUserMember && !isCurrentUserOwner && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  <UserPlus className="h-3 w-3 mr-1" />
                  Join Available
                </Badge>
              )}
            </div>
          </div>
          
          {/* Progress and Dates */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full sm:w-auto">
            <div className="flex items-center gap-4 text-sm text-muted-foreground order-2 sm:order-1">
              <div className="flex items-center gap-1 whitespace-nowrap">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">{formatDate(stream.start_date)} - {formatDate(stream.end_date)}</span>
                <span className="sm:hidden">{formatDate(stream.start_date)}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 order-1 sm:order-2">
              <div className="text-right">
                <div className="text-sm font-medium">{stream.progress}%</div>
                <div className="text-xs text-muted-foreground hidden sm:block">Complete</div>
              </div>
              <div className="w-16 sm:w-20">
                <Progress value={stream.progress} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </AccordionTrigger>
      
      <AccordionContent className="px-6 pb-6">
        <div className="space-y-6 pt-4">
          {/* Stream Actions */}
          <div className="flex justify-between items-center">
            {!isCurrentUserMember && !isCurrentUserOwner && (
              <Button 
                onClick={handleJoinStream} 
                disabled={isJoining}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {isJoining ? 'Joining...' : 'Join Stream'}
              </Button>
            )}
            
            {(isCurrentUserMember || isCurrentUserOwner) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" disabled={isUpdating}>
                    <MoreHorizontal className="h-4 w-4 mr-2" />
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Stream Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={handleCopyStreamLink} className="cursor-pointer">
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {stream.status === 'archived' ? (
                    <DropdownMenuItem onClick={handleUnarchiveStream} className="cursor-pointer text-green-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Unarchive Stream
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={handleArchiveStream} className="cursor-pointer text-destructive">
                      <XCircle className="h-4 w-4 mr-2" />
                      Archive Stream
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Stream Description */}
          <div>
            <p className="text-muted-foreground">{stream.description || "No description available"}</p>
          </div>
          
          {/* Team Members */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team ({stream.stream_members.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {stream.stream_members.map((member) => (
                <div key={member.id} className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">
                      {member.users?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </span>
                  </div>
                  <span className="text-sm">{member.users?.full_name || 'Unknown User'}</span>
                  <span className="text-xs text-muted-foreground">({member.role})</span>
                  {member.user_id === currentUserId && (
                    <Badge variant="outline" className="text-xs">You</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Work Items - Show to all, but disable adding for non-members */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-3">Resources</h4>
              <WorkItemsList
                streamId={stream.id}
                workItems={stream.work_items.filter(item => item.type === 'url')}
                onWorkItemCreated={handleWorkItemCreated}
                canAddItems={isCurrentUserMember || isCurrentUserOwner}
                type="resources"
              />
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3">Tasks</h4>
              <TasksList
                streamId={stream.id}
                workItems={stream.work_items.filter(item => item.type === 'note')}
                onWorkItemCreated={handleWorkItemCreated}
                canAddItems={isCurrentUserMember || isCurrentUserOwner}
              />
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
