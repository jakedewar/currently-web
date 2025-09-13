'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { WorkItem } from '@/lib/data/streams'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PriorityIndicator } from '@/components/ui/priority-indicator'
import { Skeleton } from '@/components/ui/skeleton'
import { CreateSubtaskDialog } from '@/components/streams/create-subtask-dialog'
import { 
  ArrowLeft,
  MoreHorizontal,
  Archive,
  Check,
  FileText,
  Calendar,
  User,
  Circle,
  ExternalLink,
  Edit,
  Trash2,
  Clock,
  CircleCheck,
  AlertTriangle,
  CalendarDays
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [task, setTask] = useState<WorkItem | null>(null)
  const [subtasks, setSubtasks] = useState<WorkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingSubtaskId, setUpdatingSubtaskId] = useState<string | null>(null)

  const streamId = params.id as string
  const taskId = params.taskId as string

  const fetchTaskDetails = useCallback(async () => {
    try {
      setLoading(true)
      
      // Fetch the main task
      const taskResponse = await fetch(`/api/streams/${streamId}/work-items/${taskId}`)
      if (!taskResponse.ok) {
        throw new Error('Failed to fetch task')
      }
      const taskData = await taskResponse.json()
      setTask(taskData)

      // Fetch subtasks
      const subtasksResponse = await fetch(`/api/streams/${streamId}/work-items/${taskId}/subtasks`)
      if (subtasksResponse.ok) {
        const subtasksData = await subtasksResponse.json()
        setSubtasks(subtasksData || [])
      }
    } catch (err) {
      console.error('Error loading task details:', err)
      toast({
        title: "Error",
        description: "Failed to load task details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [streamId, taskId, toast])

  useEffect(() => {
    fetchTaskDetails()
  }, [fetchTaskDetails])

  const handleUpdateStatus = async (newStatus: string) => {
    if (!task) return

    try {
      const response = await fetch(`/api/streams/${streamId}/work-items/${taskId}`, {
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

      const updatedData = await response.json()
      setTask(updatedData)

      toast({
        title: "Status updated",
        description: `Task marked as ${newStatus}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    }
  }

  const handleUpdateSubtaskStatus = async (subtaskId: string, newStatus: string) => {
    setUpdatingSubtaskId(subtaskId)
    
    try {
      const response = await fetch(`/api/streams/${streamId}/work-items/${taskId}/subtasks/${subtaskId}`, {
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

      const updatedData = await response.json()
      
      // Update the subtasks list
      setSubtasks(prev => prev.map(subtask => 
        subtask.id === subtaskId ? updatedData : subtask
      ))
      
      toast({
        title: "Subtask updated",
        description: `Subtask marked as ${newStatus}`,
      })
    } catch (error) {
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
      const response = await fetch(`/api/streams/${streamId}/work-items/${taskId}/subtasks/${subtaskId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete subtask')
      }

      // Remove from subtasks list
      setSubtasks(prev => prev.filter(subtask => subtask.id !== subtaskId))

      toast({
        title: "Subtask deleted",
        description: "The subtask has been removed successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete subtask: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    }
  }

  const handleSubtaskCreated = () => {
    fetchTaskDetails() // Refresh to get new subtasks
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header Skeleton */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <Skeleton className="h-8 w-16" />
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
              <Skeleton className="h-8 w-8" />
            </div>
            <div className="mt-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-6 w-6 rounded-full flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              {/* URL Section Skeleton */}
              <div className="space-y-3">
                <Skeleton className="h-6 w-24" />
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-muted/30 rounded-lg border">
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3 mt-1" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>

              {/* Subtasks Section Skeleton */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-9 w-32" />
                </div>
                
                <div className="space-y-3">
                  {/* Subtask skeletons */}
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 bg-muted/30 rounded-lg border">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Skeleton className="h-5 w-5 rounded-full flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-6">
              {/* Task Info Skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-5 w-32" />
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 flex-shrink-0" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-5 w-20" />
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <Skeleton className="w-full h-3 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <div className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Task not found</h2>
          <p className="text-muted-foreground mb-4 break-words">The task you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Clean Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="self-start">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {task.status === 'completed' && (
                  <Badge variant="default" className="flex items-center gap-1">
                    <span className="capitalize text-xs">Completed</span>
                  </Badge>
                )}
                {task.status === 'archived' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <span className="capitalize text-xs">Archived</span>
                  </Badge>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="self-start sm:self-auto">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Task Actions</DropdownMenuLabel>
                {task.status !== 'completed' && (
                  <DropdownMenuItem 
                    onClick={() => handleUpdateStatus('completed')}
                    className="text-green-600"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Mark as Completed
                  </DropdownMenuItem>
                )}
                {task.status !== 'archived' && (
                  <DropdownMenuItem 
                    onClick={() => handleUpdateStatus('archived')}
                    className="text-destructive"
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="mt-4">
            <div className="flex items-start gap-3">
              {/* Completion Checkbox */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        if (task.status === 'completed') {
                          handleUpdateStatus('active')
                        } else {
                          handleUpdateStatus('completed')
                        }
                      }}
                      className="flex-shrink-0 hover:bg-muted rounded-sm p-1 transition-colors mt-1 group"
                    >
                      {task.status === 'completed' ? (
                        <CircleCheck className="h-6 w-6 text-green-500 group-hover:scale-110 transition-transform" />
                      ) : (
                        <Circle className="h-6 w-6 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{task.status === 'completed' ? 'Mark as To Do' : 'Mark to Complete'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <div className="flex-1 min-w-0">
                <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight break-words ${
                  task.status === 'completed' ? 'line-through text-muted-foreground' : ''
                }`}>
                  {task.title}
                </h1>
                {task.description && (
                  <p className={`mt-2 text-base sm:text-lg leading-relaxed break-words ${
                    task.status === 'completed' ? 'text-muted-foreground/60' : 'text-muted-foreground'
                  }`}>
                    {task.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* URL Section */}
            {task.url && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">Related Link</h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-muted/30 rounded-lg border">
                  <div className="flex-1 min-w-0">
                    <UrlLink url={task.url} maxLength={60} />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => task.url && window.open(task.url, '_blank')}
                    className="self-start sm:self-auto"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Subtasks Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-lg font-semibold">Subtasks</h2>
                <CreateSubtaskDialog
                  taskId={task.id}
                  streamId={streamId}
                  onSubtaskCreated={handleSubtaskCreated}
                />
              </div>
              
              {subtasks.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <Circle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No subtasks yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Add your first subtask to break down this task</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors">
                      {/* Checkbox and content */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => {
                                  const newStatus = subtask.status === 'completed' ? 'active' : 'completed'
                                  handleUpdateSubtaskStatus(subtask.id, newStatus)
                                }}
                                disabled={updatingSubtaskId === subtask.id}
                                className="flex-shrink-0 p-1 hover:bg-muted/50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-0.5 group"
                              >
                                {updatingSubtaskId === subtask.id ? (
                                  <div className="h-5 w-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                                ) : subtask.status === 'completed' ? (
                                  <CircleCheck className="h-5 w-5 text-green-500 group-hover:scale-110 transition-transform" />
                                ) : (
                                  <Circle className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all" />
                                )}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{subtask.status === 'completed' ? 'Mark as To Do' : 'Mark to Complete'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                            <span className={`font-medium break-words ${subtask.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                              {subtask.title}
                            </span>
                            {subtask.priority && subtask.status !== 'completed' && (
                              <PriorityIndicator priority={subtask.priority} />
                            )}
                          </div>
                          {subtask.description && (
                            <p className="text-sm text-muted-foreground break-words">
                              {subtask.description}
                            </p>
                          )}
                          {subtask.url && (
                            <div className="mt-2">
                              <UrlLink url={subtask.url} maxLength={40} />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-2">
                        {subtask.assignee_id && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span className="hidden sm:inline">Assigned</span>
                          </div>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
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
                                Mark as To Do
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteSubtask(subtask.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Task Info */}
            <div className="space-y-4">
              <h3 className="font-semibold">Task Information</h3>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">Created</span>
                  </div>
                  <span className="font-medium break-words">{formatDistanceToNow(new Date(task.created_at!), { addSuffix: true })}</span>
                </div>
                
                {task.updated_at && task.updated_at !== task.created_at && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Edit className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">Updated</span>
                    </div>
                    <span className="font-medium break-words">{formatDistanceToNow(new Date(task.updated_at), { addSuffix: true })}</span>
                  </div>
                )}

                {task.assignee_id && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">Assigned to</span>
                    </div>
                    <span className="font-medium break-words">User</span>
                  </div>
                )}

                {task.due_date && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const dueDate = new Date(task.due_date)
                        const now = new Date()
                        const isOverdue = dueDate < now
                        
                        return (
                          <>
                            {isOverdue ? (
                              <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                            ) : (
                              <CalendarDays className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            )}
                            <span className="text-muted-foreground">Due</span>
                          </>
                        )
                      })()}
                    </div>
                    <span className={`font-medium break-words ${
                      (() => {
                        const dueDate = new Date(task.due_date)
                        const now = new Date()
                        const isOverdue = dueDate < now
                        const isToday = dueDate.toDateString() === now.toDateString()
                        return isOverdue ? 'text-red-500' : isToday ? 'text-orange-500' : ''
                      })()
                    }`}>
                      {(() => {
                        const dueDate = new Date(task.due_date)
                        const now = new Date()
                        const isOverdue = dueDate < now
                        const isToday = dueDate.toDateString() === now.toDateString()
                        const isTomorrow = dueDate.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString()
                        
                        return isToday ? 'Today' : 
                               isTomorrow ? 'Tomorrow' :
                               isOverdue ? `Overdue ${Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))}d` :
                               new Date(task.due_date).toLocaleDateString('en-US', { 
                                 month: 'numeric', 
                                 day: 'numeric' 
                               })
                      })()}
                    </span>
                  </div>
                )}

                {task.estimated_hours && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">Estimated</span>
                    </div>
                    <span className="font-medium break-words">{task.estimated_hours}h</span>
                  </div>
                )}

                {task.priority && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <PriorityIndicator priority={task.priority} />
                      <span className="text-muted-foreground">Priority</span>
                    </div>
                    <span className="font-medium break-words capitalize">{task.priority}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-4">
              <h3 className="font-semibold">Progress</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtasks</span>
                  <span className="font-medium">{subtasks.filter(st => st.status === 'completed').length}/{subtasks.length}</span>
                </div>
                {subtasks.length > 0 && (
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className="bg-primary h-3 rounded-full transition-all"
                      style={{ 
                        width: `${(subtasks.filter(st => st.status === 'completed').length / subtasks.length) * 100}%` 
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
