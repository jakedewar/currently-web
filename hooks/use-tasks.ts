import { useState, useCallback } from 'react'
import { useToast } from './use-toast'

interface Subtask {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  assignee_id: string | null
  due_date: string | null
  estimated_hours: number | null
  actual_hours: number | null
  order_index: number
  created_at: string
  updated_at: string
  work_item_id: string
  created_by: string
}

interface UseTasksOptions {
  streamId: string
  workItemId: string
}

export function useTasks({ streamId, workItemId }: UseTasksOptions) {
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchSubtasks = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/streams/${streamId}/work-items/${workItemId}/subtasks`)
      if (response.ok) {
        const data = await response.json()
        setSubtasks(data)
      } else {
        throw new Error('Failed to fetch subtasks')
      }
    } catch (error) {
      console.error('Error fetching subtasks:', error)
      toast({
        title: "Error",
        description: "Failed to fetch subtasks",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [streamId, workItemId, toast])

  const createSubtask = useCallback(async (title: string, description?: string, priority = 'medium') => {
    try {
      const response = await fetch(`/api/streams/${streamId}/work-items/${workItemId}/subtasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          priority,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create subtask')
      }

      const newSubtask = await response.json()
      setSubtasks(prev => [...prev, newSubtask])
      
      toast({
        title: "Success",
        description: "Subtask created successfully",
      })

      return newSubtask
    } catch (error) {
      console.error('Error creating subtask:', error)
      toast({
        title: "Error",
        description: "Failed to create subtask",
        variant: "destructive",
      })
      throw error
    }
  }, [streamId, workItemId, toast])

  const updateSubtask = useCallback(async (subtaskId: string, updates: Partial<Subtask>) => {
    try {
      const response = await fetch(`/api/streams/${streamId}/work-items/${workItemId}/subtasks/${subtaskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update subtask')
      }

      const updatedSubtask = await response.json()
      setSubtasks(prev => prev.map(subtask => 
        subtask.id === subtaskId ? updatedSubtask : subtask
      ))
      
      toast({
        title: "Success",
        description: "Subtask updated successfully",
      })

      return updatedSubtask
    } catch (error) {
      console.error('Error updating subtask:', error)
      toast({
        title: "Error",
        description: "Failed to update subtask",
        variant: "destructive",
      })
      throw error
    }
  }, [streamId, workItemId, toast])

  const deleteSubtask = useCallback(async (subtaskId: string) => {
    try {
      const response = await fetch(`/api/streams/${streamId}/work-items/${workItemId}/subtasks/${subtaskId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete subtask')
      }

      setSubtasks(prev => prev.filter(subtask => subtask.id !== subtaskId))
      
      toast({
        title: "Success",
        description: "Subtask deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting subtask:', error)
      toast({
        title: "Error",
        description: "Failed to delete subtask",
        variant: "destructive",
      })
      throw error
    }
  }, [streamId, workItemId, toast])

  return {
    subtasks,
    loading,
    fetchSubtasks,
    createSubtask,
    updateSubtask,
    deleteSubtask,
  }
}
