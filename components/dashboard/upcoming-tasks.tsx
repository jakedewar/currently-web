'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PriorityIndicator } from "@/components/ui/priority-indicator"
import { Calendar, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { CurrentlyDashboardData } from "@/lib/data/currently-dashboard"

interface UpcomingTasksProps {
  currentFocus: CurrentlyDashboardData['currentFocus']
  upcomingDeadlines: CurrentlyDashboardData['upcomingDeadlines']
}

export function UpcomingTasks({ currentFocus }: UpcomingTasksProps) {
  const { dueToday, highPriority, activeTasks } = currentFocus

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return null
    const date = new Date(dueDate)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`
    if (diffDays === 0) return 'Due today'
    if (diffDays === 1) return 'Due tomorrow'
    return `Due in ${diffDays} days`
  }


  // Combine and prioritize tasks
  const allTasks = [
    ...dueToday.map(task => ({ ...task, category: 'due-today', priority: 'urgent' })),
    ...highPriority.map(task => ({ ...task, category: 'high-priority' })),
    ...activeTasks.slice(0, 3).map(task => ({ ...task, category: 'active' }))
  ].slice(0, 5) // Show max 5 tasks

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-orange-500" />
          Upcoming Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        {allTasks.length > 0 ? (
          <div className="space-y-3">
            {allTasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">{task.title}</h4>
                    {task.priority && (
                      <PriorityIndicator priority={task.priority} />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    {task.stream_emoji && <span className="text-sm">{task.stream_emoji}</span>}
                    {task.stream_name}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {task.estimated_hours && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {task.estimated_hours}h
                      </span>
                    )}
                    {task.due_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDueDate(task.due_date)}
                      </span>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/protected/streams/${task.stream_id}`}>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
            
            {allTasks.length >= 5 && (
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/protected/streams">
                    View all tasks
                  </Link>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No upcoming tasks</p>
            <p className="text-xs">You&apos;re all caught up!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
