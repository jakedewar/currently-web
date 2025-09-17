'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { WorkItem } from '@/lib/data/projects'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PriorityIndicator } from '@/components/ui/priority-indicator'
import { UrlLink } from '@/components/ui/url-link'
import { useToast } from '@/hooks/use-toast'
import { 
  ArrowLeft,
  Calendar,
  Clock,
  User,
  FileText,
  Archive,
  MoreHorizontal,
  CircleCheck,
  Circle,
  AlertTriangle
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CreateSubtaskDialog } from './create-subtask-dialog'

interface TaskDetailProps {
  task: WorkItem
  projectId: string
  projectName: string
  userRole: string
  onTaskUpdated?: (updatedTask: WorkItem) => void
}

export function TaskDetail({ task, projectId, projectName, userRole, onTaskUpdated }: TaskDetailProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)

  const canEdit = userRole === 'owner' || userRole === 'admin'


  const getDueDateDisplay = (task: WorkItem) => {
    if (!task.due_date) return null
    
    const dueDate = new Date(task.due_date)
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    let color = 'text-muted-foreground'
    let icon = <Calendar className="h-3 w-3" />
    
    if (diffDays < 0) {
      color = 'text-red-600'
      icon = <AlertTriangle className="h-3 w-3" />
    } else if (diffDays === 0) {
      color = 'text-orange-600'
      icon = <AlertTriangle className="h-3 w-3" />
    } else if (diffDays <= 3) {
      color = 'text-yellow-600'
    }
    
    return (
      <div className={`flex items-center gap-1 ${color}`}>
        {icon}
        <span className="text-xs">
          {diffDays < 0 ? `${Math.abs(diffDays)} days overdue` :
           diffDays === 0 ? 'Due today' :
           diffDays === 1 ? 'Due tomorrow' :
           `Due in ${diffDays} days`}
        </span>
      </div>
    )
  }

  const handleUpdateStatus = async (newStatus: string) => {
    if (isUpdating) return
    
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/work-items/${task.id}`, {
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

      const updatedTask = await response.json()
      
      if (onTaskUpdated) {
        onTaskUpdated(updatedTask)
      }

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
    } finally {
      setIsUpdating(false)
    }
  }

  const handleBackToProject = () => {
    router.push(`/protected/projects/${projectId}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToProject}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {projectName}
          </Button>
        </div>
        
        {canEdit && task.status !== 'archived' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Task Actions</DropdownMenuLabel>
              <DropdownMenuItem 
                onClick={() => handleUpdateStatus('archived')}
                disabled={isUpdating}
                className="text-destructive"
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Task Details */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Title and Status */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                {/* Completion Checkbox - Consistent with other components */}
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
                        disabled={isUpdating}
                        className="flex-shrink-0 hover:bg-muted rounded-sm p-1 transition-colors group mt-1"
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
                
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <CardTitle className={`text-xl ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </CardTitle>
                    {task.priority && <PriorityIndicator priority={task.priority} />}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {task.description && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Description</h4>
                  <p className={`text-sm ${task.status === 'completed' ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>
                    {task.description}
                  </p>
                </div>
              )}
              
              {task.url && (
                <div>
                  <h4 className="font-medium text-sm mb-2">URL</h4>
                  <UrlLink url={task.url} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subtasks */}
          {canEdit && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Subtasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <CreateSubtaskDialog
                    taskId={task.id}
                    projectId={projectId}
                    onSubtaskCreated={() => {
                      // Refresh the task data
                      if (onTaskUpdated) {
                        // This would need to be implemented to refetch the task with subtasks
                      }
                    }}
                  />
                  <p className="text-sm text-muted-foreground">
                    Subtasks functionality will be available soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Task Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Task Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Type:</span>
                <Badge variant="outline" className="capitalize">
                  {task.type}
                </Badge>
              </div>
              
              {task.due_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Due Date:</span>
                  <div className="text-sm">
                    {getDueDateDisplay(task)}
                  </div>
                </div>
              )}
              
              {task.estimated_hours && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Estimated:</span>
                  <span className="text-sm">{task.estimated_hours}h</span>
                </div>
              )}
              
              {task.actual_hours && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Actual:</span>
                  <span className="text-sm">{task.actual_hours}h</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Created:</span>
                <span className="text-sm">
                  {task.created_at ? new Date(task.created_at).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Additional Actions */}
          {canEdit && task.status !== 'archived' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  onClick={() => handleUpdateStatus('archived')}
                  disabled={isUpdating}
                  className="w-full"
                  variant="outline"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Task
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
