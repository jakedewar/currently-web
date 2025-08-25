'use client'

import { useState } from 'react'
import { WorkItem } from '@/lib/data/streams'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CreateWorkItemDialog } from './create-work-item-dialog'
import { 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  XCircle, 
  Clock,
  MoreHorizontal,
  Archive,
  Check
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface WorkItemsListProps {
  streamId: string
  workItems: WorkItem[]
  onWorkItemCreated: () => void
}

export function WorkItemsList({ streamId, workItems, onWorkItemCreated }: WorkItemsListProps) {
  const { toast } = useToast()
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'archived':
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-blue-500" />
    }
  }

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast({
        title: "URL copied",
        description: "URL copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to copy URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    }
  }

  const handleUpdateStatus = async (itemId: string, newStatus: string) => {
    setUpdatingItemId(itemId)
    try {
      const response = await fetch(`/api/streams/${streamId}/work-items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update work item')
      }

      toast({
        title: "Status updated",
        description: `Work item marked as ${newStatus}`,
      })
      onWorkItemCreated() // Refetch to update the list
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setUpdatingItemId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Work Items</h3>
        <CreateWorkItemDialog streamId={streamId} onWorkItemCreated={onWorkItemCreated} />
      </div>
      <div className="grid gap-4">
        {workItems.length === 0 ? (
          <Card className="p-4">
            <p className="text-sm text-muted-foreground text-center">
              No work items yet. Add a URL to get started.
            </p>
          </Card>
        ) : (
          workItems.map((item) => (
            <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-lg">{item.title}</h4>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {getStatusIcon(item.status)}
                      <span className="capitalize">{item.status}</span>
                    </Badge>
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  )}
                  <div className="flex items-center gap-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 hover:bg-primary/10 rounded-md text-sm transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Open URL
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{item.url}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8"
                      onClick={() => handleCopyUrl(item.url)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        {item.status !== 'completed' && (
                          <DropdownMenuItem 
                            onClick={() => handleUpdateStatus(item.id, 'completed')}
                            disabled={updatingItemId === item.id}
                            className="text-green-600"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Mark as Completed
                          </DropdownMenuItem>
                        )}
                        {item.status !== 'archived' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleUpdateStatus(item.id, 'archived')}
                              disabled={updatingItemId === item.id}
                              className="text-destructive"
                            >
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-xs text-muted-foreground border-t pt-3">
                Added {formatDistanceToNow(new Date(item.created_at!), { addSuffix: true })}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
