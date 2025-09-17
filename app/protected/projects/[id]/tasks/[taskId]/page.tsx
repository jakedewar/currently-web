'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { TaskDetail } from '@/components/projects/task-detail'
import { WorkItem } from '@/lib/data/projects'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export default function TaskPage() {
  const params = useParams()
  const [task, setTask] = useState<WorkItem | null>(null)
  const [projectName, setProjectName] = useState<string>('')
  const [userRole, setUserRole] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const projectId = params.id as string
  const taskId = params.taskId as string

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch the project data to get the task and project name
        const response = await fetch(`/api/projects/${projectId}`)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch project data`)
        }

        const data = await response.json()
        
        // Find the specific task
        const foundTask = data.project.work_items.find((item: WorkItem) => item.id === taskId)
        
        if (!foundTask) {
          throw new Error('Task not found')
        }

        setTask(foundTask)
        setProjectName(data.project.name)
        setUserRole(data.currentUser.role)
      } catch (err) {
        console.error('Error fetching task data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load task data')
      } finally {
        setLoading(false)
      }
    }

    if (projectId && taskId) {
      fetchTaskData()
    }
  }, [projectId, taskId])

  const handleTaskUpdated = (updatedTask: WorkItem) => {
    setTask(updatedTask)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <Card className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-full" />
              </Card>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <Card className="p-6">
                <Skeleton className="h-6 w-1/2 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </Card>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Task not found.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <TaskDetail
        task={task}
        projectId={projectId}
        projectName={projectName}
        userRole={userRole}
        onTaskUpdated={handleTaskUpdated}
      />
    </div>
  )
}
