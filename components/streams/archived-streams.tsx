'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { 
  Archive, 
  Calendar, 
  Users, 
  CheckCircle,
  RefreshCw
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils/streams'
import type { Stream, StreamMember } from '@/lib/data/streams'

interface ArchivedStreamsProps {
  streams: (Stream & {
    stream_members: StreamMember[];
  })[];
  onStreamUpdated: () => void;
}

export function ArchivedStreams({ streams, onStreamUpdated }: ArchivedStreamsProps) {
  const { toast } = useToast()
  const [unarchivingStreams, setUnarchivingStreams] = useState<Set<string>>(new Set())

  const handleUnarchiveStream = async (streamId: string) => {
    setUnarchivingStreams(prev => new Set(prev).add(streamId))
    
    try {
      const response = await fetch(`/api/streams/${streamId}`, {
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
      setUnarchivingStreams(prev => {
        const newSet = new Set(prev)
        newSet.delete(streamId)
        return newSet
      })
    }
  }

  if (streams.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No archived streams</h3>
          <p className="text-muted-foreground">
            When you archive streams, they will appear here for easy access and restoration.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {streams.map((stream) => {
          const isUnarchiving = unarchivingStreams.has(stream.id)

          return (
            <Card key={stream.id} className="opacity-75 bg-muted/30">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-semibold truncate mb-1">
                      {stream.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={stream.status} variant="compact" />
                      <PriorityBadge priority={stream.priority} variant="compact" />
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Description */}
                <div className="h-12">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {stream.description || "No description available"}
                  </p>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-muted-foreground">Progress</span>
                    <span className="text-xs text-muted-foreground">{stream.progress}%</span>
                  </div>
                  <Progress value={stream.progress} className="h-1.5" />
                </div>

                {/* Metadata */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span className="truncate max-w-20">{formatDate(stream.start_date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{stream.stream_members.length}</span>
                    </div>
                  </div>
                </div>

                {/* Unarchive Button */}
                <Button
                  onClick={() => handleUnarchiveStream(stream.id)}
                  disabled={isUnarchiving}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {isUnarchiving ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                      Unarchiving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3 w-3 mr-2" />
                      Unarchive
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
