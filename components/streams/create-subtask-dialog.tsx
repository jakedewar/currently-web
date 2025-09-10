'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CreateSubtaskDialogProps {
  taskId: string;
  streamId: string;
  onSubtaskCreated: () => void;
}

export function CreateSubtaskDialog({ taskId, streamId, onSubtaskCreated }: CreateSubtaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for the subtask",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/streams/${streamId}/work-items/${taskId}/subtasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        const errorMessage = data.error || 'Failed to create subtask'
        throw new Error(errorMessage)
      }

      toast({
        title: "Success",
        description: "Subtask created successfully",
      })
      
      setOpen(false)
      onSubtaskCreated()
      setFormData({
        title: '',
        description: '',
      })
    } catch (error) {
      console.error('Error creating subtask:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create subtask',
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-4"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Subtask
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Subtask</DialogTitle>
            <DialogDescription>
              Create a new subtask to break down this task into smaller, manageable pieces.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subtask-title">Title</Label>
              <Input
                id="subtask-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter a title for this subtask"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subtask-description">Description (Optional)</Label>
              <Textarea
                id="subtask-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add any notes or context about this subtask"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading || !formData.title.trim()}
            >
              {loading ? 'Adding...' : 'Add Subtask'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
