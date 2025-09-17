'use client'

import { useRouter } from 'next/navigation'
import { WorkItem } from '@/lib/data/projects'
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
  CalendarDays,
  LayoutGrid,
  List
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import { ProjectsData } from "@/lib/data/projects"

interface ProjectTasksProps {
  project: ProjectsData['projects'][0];
  userRole: string;
  onProjectUpdated: () => void;
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
    color: 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50',
    icon: <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
  },
  {
    id: 'completed',
    title: 'Completed',
    status: 'completed',
    color: 'bg-green-50/80 dark:bg-green-950/30 border-green-200 dark:border-green-800/50',
    icon: <CircleCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
  },
  {
    id: 'archived',
    title: 'Archived',
    status: 'archived',
    color: 'bg-gray-50/80 dark:bg-gray-950/30 border-gray-200 dark:border-gray-800/50',
    icon: <Archive className="h-4 w-4 text-gray-600 dark:text-gray-400" />
  }
]

// Simple Task Card Component
function TaskCard({ task, projectId, onWorkItemUpdated, onWorkItemCreated, canAddItems, allSubtasks }: {
  task: WorkItem
  projectId: string
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
      const response = await fetch(`/api/projects/${projectId}/work-items/${itemId}`, {
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
    router.push(`/protected/projects/${projectId}/tasks/${task.id}`)
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
                  router.push(`/protected/projects/${projectId}/tasks/${task.id}`)
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
                const isOverdue = dueDate < now && task.status !== 'completed'
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
                projectId={projectId}
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
function TaskColumn({ column, tasks, projectId, onWorkItemUpdated, onWorkItemCreated, canAddItems, allSubtasks }: {
  column: KanbanColumn
  tasks: WorkItem[]
  projectId: string
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
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {column.icon}
              <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{column.title}</h4>
            </div>
            <div className="flex items-center">
              <Badge 
                variant="secondary" 
                className="text-xs font-semibold px-2.5 py-1 bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 shadow-sm hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200 min-w-[24px] justify-center"
              >
                {tasks.length}
              </Badge>
            </div>
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
              projectId={projectId}
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

// Table View Component
function TaskTableView({ tasks, projectId, onWorkItemUpdated, onWorkItemCreated, canAddItems, allSubtasks }: {
  tasks: WorkItem[]
  projectId: string
  onWorkItemUpdated?: (updatedItem: WorkItem) => void
  onWorkItemCreated: () => void
  canAddItems: boolean
  allSubtasks: WorkItem[]
}) {
  const { toast } = useToast()
  const router = useRouter()

  const handleUpdateStatus = async (itemId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/work-items/${itemId}`, {
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


  const getDueDateDisplay = (task: WorkItem) => {
    if (!task.due_date) {
      return <span className="text-muted-foreground text-sm">No due date</span>
    }

    const dueDate = new Date(task.due_date)
    const now = new Date()
    const isOverdue = dueDate < now && task.status !== 'completed'
    const isToday = dueDate.toDateString() === now.toDateString()
    const isTomorrow = dueDate.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString()

    let displayText = ''
    if (isToday) {
      displayText = 'Today'
    } else if (isTomorrow) {
      displayText = 'Tomorrow'
    } else if (isOverdue) {
      displayText = `Overdue ${Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))}d`
    } else {
      displayText = new Date(task.due_date).toLocaleDateString('en-US', { 
        month: 'numeric', 
        day: 'numeric' 
      })
    }

    return (
      <div className="flex items-center gap-1 min-w-0">
        {isOverdue ? (
          <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />
        ) : (
          <CalendarDays className="h-3 w-3 text-muted-foreground flex-shrink-0" />
        )}
        <span className={`text-sm truncate ${isOverdue ? 'text-red-500 font-medium' : isToday ? 'text-orange-500 font-medium' : 'text-muted-foreground'}`}>
          {displayText}
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Status</TableHead>
              <TableHead className="min-w-[200px]">Task</TableHead>
              <TableHead className="w-20">Priority</TableHead>
              <TableHead className="w-24">Due Date</TableHead>
              <TableHead className="w-20">Subtasks</TableHead>
              <TableHead className="w-12">Add</TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => {
              const taskSubtasks = allSubtasks.filter(subtask => subtask.parent_task_id === task.id)
              const completedSubtasks = taskSubtasks.filter(st => st.status === 'completed')
              
              return (
                <TableRow 
                  key={task.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/protected/projects/${projectId}/tasks/${task.id}`)}
                >
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 max-w-[200px]">
                      <div className={`font-medium truncate ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </div>
                      {task.description && (
                        <div className={`text-sm line-clamp-1 ${task.status === 'completed' ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>
                          {task.description}
                        </div>
                      )}
                      {task.url && (
                        <div className="mt-1">
                          <UrlLink url={task.url} maxLength={25} />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="w-20">
                    {task.priority && <PriorityIndicator priority={task.priority} />}
                  </TableCell>
                  <TableCell className="w-24">
                    {getDueDateDisplay(task)}
                  </TableCell>
                  <TableCell className="w-20">
                    {taskSubtasks.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {completedSubtasks.length}/{taskSubtasks.length}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="w-12">
                    {canAddItems && (
                      <div onClick={(e) => e.stopPropagation()}>
                        <CreateSubtaskDialog
                          taskId={task.id}
                          projectId={projectId}
                          onSubtaskCreated={onWorkItemCreated}
                        />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="w-12">
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
                            router.push(`/protected/projects/${projectId}/tasks/${task.id}`)
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
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {tasks.map((task) => {
          const taskSubtasks = allSubtasks.filter(subtask => subtask.parent_task_id === task.id)
          const completedSubtasks = taskSubtasks.filter(st => st.status === 'completed')
          
          return (
            <Card 
              key={task.id}
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/protected/projects/${projectId}/tasks/${task.id}`)}
            >
              <div className="space-y-3">
                {/* Header with status and actions */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
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
                    
                    {task.priority && <PriorityIndicator priority={task.priority} />}
                    {taskSubtasks.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {completedSubtasks.length}/{taskSubtasks.length}
                      </Badge>
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
                          router.push(`/protected/projects/${projectId}/tasks/${task.id}`)
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

                {/* Task content */}
                <div className="space-y-2">
                  <h4 className={`font-medium text-sm ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </h4>
                  
                  {task.description && (
                    <p className={`text-xs line-clamp-2 ${task.status === 'completed' ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>
                      {task.description}
                    </p>
                  )}
                  
                  {task.url && (
                    <div>
                      <UrlLink url={task.url} maxLength={30} />
                    </div>
                  )}
                </div>

                {/* Footer with due date and add subtask */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    {getDueDateDisplay(task)}
                  </div>
                  {canAddItems && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <CreateSubtaskDialog
                        taskId={task.id}
                        projectId={projectId}
                        onSubtaskCreated={onWorkItemCreated}
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
      
      {tasks.length === 0 && (
        <Card className="p-6">
          <div className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              No tasks yet. Create your first task to get started.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}

export function ProjectTasks({ project, userRole, onProjectUpdated }: ProjectTasksProps) {
  const isMember = userRole !== 'non_member'
  
  // Get all work items of type 'note' (tasks)
  const allTasks = project.work_items.filter(item => item.type === 'note')
  
  // Separate parent tasks from subtasks
  const parentTasks = allTasks.filter(item => !item.parent_task_id)
  const allSubtasks = allTasks.filter(item => item.parent_task_id)

  // Group tasks by status for Kanban view
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
        <div className="flex items-center gap-3">
          {isMember && (
            <CreateWorkItemDialog 
              projectId={project.id} 
              type="note"
              onWorkItemCreated={onProjectUpdated}
            />
          )}
        </div>
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
        <Tabs defaultValue="kanban" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList className="grid w-[200px] grid-cols-2">
              <TabsTrigger value="kanban" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <LayoutGrid className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Kanban</span>
                <span className="sm:hidden">Board</span>
              </TabsTrigger>
              <TabsTrigger value="table" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <List className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Table</span>
                <span className="sm:hidden">List</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="kanban" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {KANBAN_COLUMNS.map((column) => {
                const columnTasks = tasksByStatus[column.status] || []
                
                return (
                  <TaskColumn
                    key={column.id}
                    column={column}
                    tasks={columnTasks}
                    projectId={project.id}
                    onWorkItemUpdated={() => {
                      // Update the work item in the project data
                      onProjectUpdated()
                    }}
                    onWorkItemCreated={onProjectUpdated}
                    canAddItems={isMember}
                    allSubtasks={allSubtasks}
                  />
                )
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="table" className="space-y-4">
            <TaskTableView
              tasks={parentTasks}
              projectId={project.id}
              onWorkItemUpdated={() => {
                // Update the work item in the project data
                onProjectUpdated()
              }}
              onWorkItemCreated={onProjectUpdated}
              canAddItems={isMember}
              allSubtasks={allSubtasks}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
