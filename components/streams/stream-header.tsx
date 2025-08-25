'use client'

import { Stream, StreamMember } from '@/lib/data/streams'

interface ExtendedStream extends Stream {
  stream_members: StreamMember[];
}
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { StatusBadge } from '@/components/ui/status-badge'
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
  CheckCircle,
  Settings,
  Share2,
  Archive,
  ArrowLeft,
  MoreVertical
} from 'lucide-react'
import { formatDate } from '@/lib/utils/streams'
import { useToast } from '@/hooks/use-toast'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface StreamHeaderProps {
  stream: ExtendedStream;
  userRole: string;
  onStreamUpdated: () => void;
}

export function StreamHeader({ stream, userRole, onStreamUpdated }: StreamHeaderProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const [backText, setBackText] = useState('Back to Streams')

  useEffect(() => {
    // Try to get the referrer from sessionStorage
    const referrer = sessionStorage.getItem('streamReferrer')
    if (referrer?.includes('/users/')) {
      const userId = referrer.split('/users/')[1].split('/')[0]
      const user = stream.stream_members.find(member => member.user_id === userId)
      if (user?.users?.full_name) {
        setBackText(`Back to ${user.users.full_name}`)
      } else {
        setBackText('Back to User')
      }
    } else {
      setBackText('Back to Streams')
    }
  }, [stream.stream_members])



  const handleCopyStreamLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied",
        description: "Stream link copied to clipboard",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      })
    }
  }

  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/streams/${stream.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_status',
          status: newStatus,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update stream')
      }

      toast({
        title: "Stream updated",
        description: `Stream marked as ${newStatus}`,
      })
      onStreamUpdated()
    } catch {
      toast({
        title: "Error",
        description: "Failed to update stream",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-4 pb-4 border-b">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          {backText}
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{stream.name}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={stream.status} variant="compact" />
                <PriorityBadge priority={stream.priority} variant="compact" />
              </div>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">{stream.description || "No description available"}</p>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Stream Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleCopyStreamLink}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                
                {/* Only show management actions for members, admins, and owners */}
                {(userRole === 'member' || userRole === 'admin' || userRole === 'owner') && (
                  <>
                    {userRole === 'owner' && (
                      <DropdownMenuItem 
                        onClick={() => router.push(`/protected/streams/${stream.id}/settings`)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    {stream.status !== 'completed' && (
                      <DropdownMenuItem 
                        onClick={() => handleUpdateStatus('completed')}
                        disabled={isUpdating}
                        className="text-green-600"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Completed
                      </DropdownMenuItem>
                    )}
                    {stream.status === 'archived' ? (
                      <DropdownMenuItem 
                        onClick={() => handleUpdateStatus('active')}
                        disabled={isUpdating}
                        className="text-green-600"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Unarchive Stream
                      </DropdownMenuItem>
                    ) : (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleUpdateStatus('archived')}
                          disabled={isUpdating}
                          className="text-destructive"
                        >
                          <Archive className="h-4 w-4 mr-2" />
                          Archive Stream
                        </DropdownMenuItem>
                      </>
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground border-t pt-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{formatDate(stream.start_date)} - {formatDate(stream.end_date)}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right whitespace-nowrap">
              <div className="font-medium">{stream.progress}% Complete</div>
            </div>
            <div className="w-24 sm:w-32 flex-shrink-0">
              <Progress value={stream.progress} className="h-2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
