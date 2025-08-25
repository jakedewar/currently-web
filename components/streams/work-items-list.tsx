'use client'

import { useState } from 'react'
import { WorkItem } from '@/lib/data/streams'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CreateWorkItemDialog } from './create-work-item-dialog'
import { 
  CheckCircle, 
  XCircle, 
  Clock,
  MoreHorizontal,
  Archive,
  Check,
  Link,
  FileText,
  Code,
  Trello,
  Calendar
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { URLPreview } from '@/components/url-preview'
import { useToast } from '@/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


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

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'document':
        return <FileText className="h-3 w-3" />
      case 'code':
        return <Code className="h-3 w-3" />
      case 'task':
        return <Trello className="h-3 w-3" />
      default:
        return <Link className="h-3 w-3" />
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h3 className="text-lg font-semibold">Work Items</h3>
        <CreateWorkItemDialog streamId={streamId} onWorkItemCreated={onWorkItemCreated} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {workItems.length === 0 ? (
          <Card className="p-4 col-span-full">
            <p className="text-sm text-muted-foreground text-center">
              No work items yet. Add a URL to get started.
            </p>
          </Card>
        ) : (
          workItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow group">
              <div className="flex flex-col h-full min-h-[140px]">
                {/* Header */}
                <div className="p-4 pb-0">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Badge 
                      variant={item.status === 'completed' ? 'default' : item.status === 'archived' ? 'secondary' : 'outline'} 
                      className="flex items-center gap-1"
                    >
                      {getStatusIcon(item.status)}
                      <span className="capitalize text-xs">{item.status}</span>
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
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

                  {/* Title */}
                  <h4 className="font-medium text-sm mb-2">
                    {item.url ? (
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline text-blue-600 dark:text-blue-400 line-clamp-2"
                      >
                        {item.title}
                      </a>
                    ) : (
                      <span className="line-clamp-2">{item.title}</span>
                    )}
                  </h4>

                  {/* Description */}
                  {item.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{item.description}</p>
                  )}
                </div>

                {/* URL Preview */}
                {item.url && (
                  <div className="px-4 pb-4">
                    <URLPreview url={item.url} />
                  </div>
                )}

                {/* Metadata Footer */}
                <div className="mt-auto px-4 py-3 border-t bg-muted/5 text-xs text-muted-foreground">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {getTypeIcon(item.type)}
                        <span className="capitalize">{item.type}</span>
                      </div>
                      {item.tool && (
                        <Badge variant="secondary" className="text-[10px]">
                          {item.tool}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDistanceToNow(new Date(item.created_at!), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
