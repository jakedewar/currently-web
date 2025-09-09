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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CreateWorkItemDialogProps {
  streamId: string;
  onWorkItemCreated: () => void;
  defaultType?: 'url' | 'note';
}

export function CreateWorkItemDialog({ streamId, onWorkItemCreated, defaultType = 'url' }: CreateWorkItemDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    status: 'active',
    type: defaultType,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    try {
      const response = await fetch('/api/streams/' + streamId + '/work-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          stream_id: streamId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.error || 'Failed to create work item'
        
        // Handle specific error cases
        if (response.status === 409) {
          throw new Error('This work item already exists')
        } else if (response.status === 403) {
          throw new Error('You do not have permission to create work items in this stream')
        } else if (response.status === 400 && data.details) {
          // Format validation errors
          const validationErrors = data.details
            .map((issue: { path: string[]; message: string }) => `${issue.path.join('.')}: ${issue.message}`)
            .join(', ');
          throw new Error(`Validation failed: ${validationErrors}`)
        }
        
        throw new Error(errorMessage)
      }

      toast({
        title: "Success",
        description: "Work item created successfully",
      })
      
      setOpen(false)
      onWorkItemCreated()
      setFormData({
        title: '',
        description: '',
        url: '',
        status: 'active',
        type: defaultType,
      })
    } catch (error) {
      console.error('Error creating work item:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create work item',
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {defaultType === 'url' ? 'Add Resource' : 'Add Task'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {defaultType === 'url' ? 'Add Resource to Stream' : 'Add Task to Stream'}
            </DialogTitle>
            <DialogDescription>
              {defaultType === 'url' 
                ? 'Add a URL to your stream. This could be a document, article, or any web resource you want to track.'
                : 'Create a new task for your stream. Tasks help you organize and track work items.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={defaultType === 'url' ? "Enter a title for this URL" : "Enter a title for this task"}
                required
              />
            </div>
            {defaultType === 'url' && (
              <div className="grid gap-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com"
                  required
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={defaultType === 'url' ? "Add any notes or context about this URL" : "Add any notes or context about this task"}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading || !formData.title.trim() || (defaultType === 'url' && !formData.url.trim())}
            >
              {loading ? 'Adding...' : defaultType === 'url' ? 'Add Resource' : 'Add Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
