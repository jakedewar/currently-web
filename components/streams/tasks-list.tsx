'use client'
import { useRouter } from 'next/navigation'
import { WorkItem } from '@/lib/data/streams'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PriorityIndicator } from '@/components/ui/priority-indicator'
import { CreateWorkItemDialog } from './create-work-item-dialog'
import { CreateSubtaskDialog } from './create-subtask-dialog'
import { 
  CircleCheck,
  Clock,
  MoreHorizontal,
  Archive,
  Check,
  FileText,
  Calendar,
  Circle,
  AlertTriangle,
  CalendarDays
} from 'lucide-react'
import { UrlLink } from '@/components/ui/url-link'
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

interface TasksListProps {
  streamId: string
  workItems: WorkItem[]
  onWorkItemCreated: () => void
  onWorkItemUpdated?: (updatedItem: WorkItem) => void
  canAddItems?: boolean
}


// Kanban column types
type KanbanColumn = {
  id: string
  title: string
  status: string
  color: string
  icon: React.ReactNode
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'active',
    title: 'To Do',
    status: 'active',
    color: 'bg-blue-50 border-blue-200',
    icon: <Clock className="h-4 w-4 text-blue-500" />
  },
  {
    id: 'completed',
    title: 'Completed',
    status: 'completed',
    color: 'bg-green-50 border-green-200',
    icon: <CircleCheck className="h-4 w-4 text-green-500" />
  },
  {
    id: 'archived',
    title: 'Archived',
    status: 'archived',
    color: 'bg-gray-50 border-gray-200',
    icon: <Archive className="h-4 w-4 text-gray-500" />
  }
]

// Simple Task Card Component
function TaskCard({ task, streamId, onWorkItemUpdated, onWorkItemCreated, canAddItems, allSubtasks }: {
  task: WorkItem
  streamId: string
  onWorkItemUpdated?: (updatedItem: WorkItem) => void
  onWorkItemCreated: () => void
  canAddItems: boolean
  allSubtasks: WorkItem[]
}) {
  const { toast } = useToast()
  const router = useRouter()
  const taskSubtasks = allSubtasks.filter(subtask => subtask.parent_task_id === task.id)

  const handleUpdateStatus = async (itemId: string, newStatus: string) => {
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
        throw new Error('Failed to update task')
      }

      const updatedData = await response.json()
      
      if (onWorkItemUpdated) {
        onWorkItemUpdated(updatedData)
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
    }
  }

  const handleCardClick = () => {
    router.push(`/protected/streams/${streamId}/tasks/${task.id}`)
  }

  return (
    <Card 
      className="hover:shadow-md transition-shadow mb-3 p-4 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {/* Completion Checkbox */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (task.status === 'completed') {
                          handleUpdateStatus(task.id, 'active')
                        } else {
                          handleUpdateStatus(task.id, 'completed')
                        }
                      }}
                      className="flex-shrink-0 hover:bg-muted rounded-sm p-0.5 transition-colors group"
                    >
                      {task.status === 'completed' ? (
                        <CircleCheck className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{task.status === 'completed' ? 'Mark as To Do' : 'Mark to Complete'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {task.priority && (
                <PriorityIndicator priority={task.priority} />
              )}
              {taskSubtasks.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {taskSubtasks.filter(st => st.status === 'completed').length}/{taskSubtasks.length}
                </Badge>
              )}
            </div>
            
            <h4 className={`font-medium text-sm mb-2 line-clamp-2 hover:text-primary ${
              task.status === 'completed' ? 'line-through text-muted-foreground' : ''
            }`}>
              {task.title}
            </h4>
            
            {task.description && (
              <p className={`text-xs line-clamp-2 mb-2 ${
                task.status === 'completed' ? 'text-muted-foreground/60' : 'text-muted-foreground'
              }`}>
                {task.description}
              </p>
            )}
            
            {task.url && (
              <div className="mb-2">
                <UrlLink url={task.url} maxLength={30} />
              </div>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Task Actions</DropdownMenuLabel>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/protected/streams/${streamId}/tasks/${task.id}`)
                }}
                className="text-blue-600"
              >
                <FileText className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              {task.status !== 'completed' && (
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleUpdateStatus(task.id, 'completed')
                  }}
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
                    onClick={(e) => {
                      e.stopPropagation()
                      handleUpdateStatus(task.id, 'archived')
                    }}
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
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            {task.due_date ? (
              (() => {
                const dueDate = new Date(task.due_date)
                const now = new Date()
                const isOverdue = dueDate < now
                const isToday = dueDate.toDateString() === now.toDateString()
                const isTomorrow = dueDate.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString()
                
                return (
                  <div className="flex items-center gap-1">
                    {isOverdue ? (
                      <AlertTriangle className="h-3 w-3 text-red-500" />
                    ) : (
                      <CalendarDays className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className={`${isOverdue ? 'text-red-500 font-medium' : isToday ? 'text-orange-500 font-medium' : 'text-muted-foreground'}`}>
                      {isToday ? 'Today' : 
                       isTomorrow ? 'Tomorrow' :
                       isOverdue ? `Overdue ${Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))}d` :
                       new Date(task.due_date).toLocaleDateString('en-US', { 
                         month: 'numeric', 
                         day: 'numeric' 
                       })}
                    </span>
                  </div>
                )
              })()
            ) : (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">No due date</span>
              </div>
            )}
          </div>
          {canAddItems && (
            <div onClick={(e) => e.stopPropagation()}>
              <CreateSubtaskDialog
                taskId={task.id}
                streamId={streamId}
                onSubtaskCreated={onWorkItemCreated}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

// Simple Column Component
function TaskColumn({ column, tasks, streamId, onWorkItemUpdated, onWorkItemCreated, canAddItems, allSubtasks }: {
  column: KanbanColumn
  tasks: WorkItem[]
  streamId: string
  onWorkItemUpdated?: (updatedItem: WorkItem) => void
  onWorkItemCreated: () => void
  canAddItems: boolean
  allSubtasks: WorkItem[]
}) {
  return (
    <div className="space-y-4">
      {/* Column Header */}
      <div className={`p-4 rounded-lg border-2 ${column.color} transition-colors`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {column.icon}
            <h4 className="font-semibold text-sm">{column.title}</h4>
            <Badge variant="secondary" className="text-xs font-medium">
              {tasks.length}
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Column Content */}
      <div className="min-h-[200px] p-2 rounded-lg">
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              streamId={streamId}
              onWorkItemUpdated={onWorkItemUpdated}
              onWorkItemCreated={onWorkItemCreated}
              canAddItems={canAddItems}
              allSubtasks={allSubtasks}
            />
          ))}
        </div>
        
        {/* Empty state for column */}
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <div className="text-center">
              <div className="text-muted-foreground/50 mb-2">
                {column.icon}
              </div>
              <p className="text-xs text-muted-foreground">
                No {column.title.toLowerCase()} tasks
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function TasksList({ streamId, workItems, onWorkItemCreated, onWorkItemUpdated, canAddItems = true }: TasksListProps) {
  // Separate parent tasks from subtasks
  const parentTasks = workItems.filter(item => !item.parent_task_id)
  const allSubtasks = workItems.filter(item => item.parent_task_id)

  // Group tasks by status
  const tasksByStatus = KANBAN_COLUMNS.reduce((acc, column) => {
    acc[column.status] = parentTasks.filter(task => task.status === column.status)
    return acc
  }, {} as Record<string, WorkItem[]>)

  // Handle tasks with unknown statuses by putting them in the active column
  const unknownStatusTasks = parentTasks.filter(task => 
    !KANBAN_COLUMNS.some(column => column.status === task.status)
  )
  if (unknownStatusTasks.length > 0) {
    tasksByStatus['active'] = [...(tasksByStatus['active'] || []), ...unknownStatusTasks]
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {KANBAN_COLUMNS.map((column) => {
            const columnTasks = tasksByStatus[column.status] || []
            
            return (
              <TaskColumn
                key={column.id}
                column={column}
                tasks={columnTasks}
                streamId={streamId}
                onWorkItemUpdated={onWorkItemUpdated}
                onWorkItemCreated={onWorkItemCreated}
                canAddItems={canAddItems}
                allSubtasks={allSubtasks}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
