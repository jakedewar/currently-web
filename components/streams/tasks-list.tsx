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
  FileText,
  Calendar,
  User,
  Plus,
  Circle
} from 'lucide-react'
import { UrlLink } from '@/components/ui/url-link'
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

interface TasksListProps {
  streamId: string
  workItems: WorkItem[]
  onWorkItemCreated: () => void
  onWorkItemUpdated?: (updatedItem: WorkItem) => void
  canAddItems?: boolean
}


export function TasksList({ streamId, workItems, onWorkItemCreated, onWorkItemUpdated, canAddItems = true }: TasksListProps) {
  const { toast } = useToast()
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null)
  const [updatingSubtaskId, setUpdatingSubtaskId] = useState<string | null>(null)
  
  // Separate parent tasks from subtasks
  const parentTasks = workItems.filter(item => !item.parent_task_id)
  const allSubtasks = workItems.filter(item => item.parent_task_id)

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }


  const handleUpdateStatus = async (itemId: string, newStatus: string) => {
    setUpdatingItemId(itemId)
    try {
      // Find the task
      const task = workItems.find(item => item.id === itemId)
      if (!task) return

      // Optimistic update - update UI immediately
      const updatedTask = { ...task, status: newStatus }
      if (onWorkItemUpdated) {
        onWorkItemUpdated(updatedTask)
      }

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
        throw new Error('Failed to update task')
      }

      // Get the updated data from the response
      const updatedData = await response.json()
      
      // Update with the actual server response
      if (onWorkItemUpdated) {
        onWorkItemUpdated(updatedData)
      }

      toast({
        title: "Status updated",
        description: `Task marked as ${newStatus}`,
      })
    } catch (error) {
      // Revert optimistic update on error
      if (onWorkItemUpdated) {
        const originalTask = workItems.find(item => item.id === itemId)
        if (originalTask) {
          onWorkItemUpdated(originalTask)
        }
      }
      
      toast({
        title: "Error",
        description: `Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setUpdatingItemId(null)
    }
  }

  const handleCreateSubtask = async (taskId: string, title: string, description?: string) => {
    try {
      const response = await fetch(`/api/streams/${streamId}/work-items/${taskId}/subtasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create subtask')
      }

      toast({
        title: "Subtask created",
        description: "The subtask has been added successfully",
      })
      
      // Refresh the work items to show the new subtask
      onWorkItemCreated()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to create subtask: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    }
  }

  const handleUpdateSubtaskStatus = async (subtaskId: string, newStatus: string) => {
    setUpdatingSubtaskId(subtaskId)
    
    try {
      // Find the subtask
      const subtask = allSubtasks.find(s => s.id === subtaskId)
      if (!subtask) return

      // Optimistic update - update UI immediately
      const updatedSubtask = { ...subtask, status: newStatus }
      if (onWorkItemUpdated) {
        onWorkItemUpdated(updatedSubtask)
      }

      // Make the API call
      const response = await fetch(`/api/streams/${streamId}/work-items/${subtask.parent_task_id}/subtasks/${subtaskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update subtask')
      }

      // Get the updated data from the response
      const updatedData = await response.json()
      
      // Update with the actual server response
      if (onWorkItemUpdated) {
        onWorkItemUpdated(updatedData)
      }
      
      toast({
        title: "Subtask updated",
        description: `Subtask marked as ${newStatus}`,
      })
    } catch (error) {
      // Revert optimistic update on error
      if (onWorkItemUpdated) {
        const originalSubtask = allSubtasks.find(s => s.id === subtaskId)
        if (originalSubtask) {
          onWorkItemUpdated(originalSubtask)
        }
      }
      
      toast({
        title: "Error",
        description: `Failed to update subtask: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setUpdatingSubtaskId(null)
    }
  }

  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      // Find the parent task ID for this subtask
      const subtask = allSubtasks.find(s => s.id === subtaskId)
      if (!subtask) return

      const response = await fetch(`/api/streams/${streamId}/work-items/${subtask.parent_task_id}/subtasks/${subtaskId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete subtask')
      }

      toast({
        title: "Subtask deleted",
        description: "The subtask has been removed successfully",
      })
      
      // Refresh the work items
      onWorkItemCreated()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete subtask: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h3 className="text-lg font-semibold">Tasks</h3>
        {canAddItems && (
          <CreateWorkItemDialog 
            streamId={streamId} 
            onWorkItemCreated={onWorkItemCreated}
            defaultType="note"
          />
        )}
      </div>
      
      <div className="space-y-3">
        {parentTasks.length === 0 ? (
          <Card className="p-6">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                No tasks yet. Create your first task to get started.
              </p>
            </div>
          </Card>
        ) : (
          parentTasks.map((task) => {
            const taskSubtasks = allSubtasks.filter(subtask => subtask.parent_task_id === task.id)
            return (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <div className="p-4">
                  {/* Parent Task Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge 
                          variant={task.status === 'completed' ? 'default' : task.status === 'archived' ? 'secondary' : 'outline'} 
                          className="flex items-center gap-1"
                        >
                          {getStatusIcon(task.status)}
                          <span className="capitalize text-xs">{task.status}</span>
                        </Badge>
                        {task.priority && (
                          <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </Badge>
                        )}
                        {taskSubtasks.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {taskSubtasks.filter(st => st.status === 'completed').length}/{taskSubtasks.length} subtasks
                          </Badge>
                        )}
                      </div>
                      
                      <h4 className="font-medium text-sm mb-2 line-clamp-2">
                        {task.title}
                      </h4>
                      
                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {task.description}
                        </p>
                      )}
                      
                      {task.url && (
                        <div className="mb-3">
                          <UrlLink url={task.url} maxLength={40} />
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDistanceToNow(new Date(task.created_at!), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Task Actions</DropdownMenuLabel>
                          {task.status !== 'completed' && (
                            <DropdownMenuItem 
                              onClick={() => handleUpdateStatus(task.id, 'completed')}
                              disabled={updatingItemId === task.id}
                              className="text-green-600"
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Mark as Completed
                            </DropdownMenuItem>
                          )}
                          {task.status !== 'archived' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleUpdateStatus(task.id, 'archived')}
                                disabled={updatingItemId === task.id}
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
                  
                  {/* Subtasks Section */}
                  {taskSubtasks.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="space-y-2">
                        {taskSubtasks.map((subtask) => (
                          <div key={subtask.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg ml-4 border-l-2 border-muted">
                            {/* Checkbox */}
                            <button
                              onClick={() => {
                                const newStatus = subtask.status === 'completed' ? 'active' : 'completed'
                                handleUpdateSubtaskStatus(subtask.id, newStatus)
                              }}
                              disabled={updatingSubtaskId === subtask.id}
                              className="flex-shrink-0 p-1 hover:bg-muted/50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updatingSubtaskId === subtask.id ? (
                                <div className="h-4 w-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                              ) : subtask.status === 'completed' ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Circle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                              )}
                            </button>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-sm font-medium ${subtask.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                                  {subtask.title}
                                </span>
                                {subtask.priority && subtask.status !== 'completed' && (
                                  <Badge variant="outline" className={`text-xs ${getPriorityColor(subtask.priority)}`}>
                                    {subtask.priority}
                                  </Badge>
                                )}
                              </div>
                              {subtask.url && (
                                <div className="mb-1">
                                  <UrlLink url={subtask.url} maxLength={35} />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {subtask.assignee_id && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <User className="h-3 w-3" />
                                  <span>Assigned</span>
                                </div>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Subtask Actions</DropdownMenuLabel>
                                  {subtask.status !== 'completed' && (
                                    <DropdownMenuItem 
                                      onClick={() => handleUpdateSubtaskStatus(subtask.id, 'completed')}
                                      className="text-green-600"
                                    >
                                      <Check className="h-4 w-4 mr-2" />
                                      Mark as Completed
                                    </DropdownMenuItem>
                                  )}
                                  {subtask.status === 'completed' && (
                                    <DropdownMenuItem 
                                      onClick={() => handleUpdateSubtaskStatus(subtask.id, 'active')}
                                      className="text-blue-600"
                                    >
                                      <Circle className="h-4 w-4 mr-2" />
                                      Mark as Active
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteSubtask(subtask.id)}
                                    className="text-destructive"
                                  >
                                    <Archive className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Add Subtask Button */}
                  {canAddItems && (
                    <div className="mt-3 pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const title = prompt('Enter subtask title:')
                          if (title) {
                            const description = prompt('Enter description (optional):')
                            handleCreateSubtask(task.id, title, description || undefined)
                          }
                        }}
                        className="ml-4"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Subtask
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
