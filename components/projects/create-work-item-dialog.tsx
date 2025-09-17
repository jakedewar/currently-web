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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Link as LinkIcon, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CreateWorkItemDialogProps {
  projectId: string
  type: 'url' | 'note'
  onWorkItemCreated: () => void
}

export function CreateWorkItemDialog({ projectId, type, onWorkItemCreated }: CreateWorkItemDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    status: 'active',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch(`/api/projects/${projectId}/work-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          url: type === 'url' ? formData.url : undefined,
          type,
          status: formData.status,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to create ${type}`)
      }

      toast({
        title: "Success",
        description: `${type === 'url' ? 'Resource' : 'Task'} created successfully`,
      })
      
      setOpen(false)
      onWorkItemCreated()
      setFormData({
        title: '',
        description: '',
        url: '',
        status: 'active',
      })
    } catch (error) {
      console.error(`Error creating ${type}:`, error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to create ${type}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const isResource = type === 'url'
  const title = isResource ? 'Add Resource' : 'Add Task'
  const description = isResource 
    ? 'Share a useful link, document, or resource with your team.'
    : 'Create a new task to track work and keep your team organized.'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {title}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isResource ? <LinkIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
              {title}
            </DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={`Enter ${isResource ? 'resource' : 'task'} title`}
                required
              />
            </div>
            
            {isResource && (
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={`Enter ${isResource ? 'resource' : 'task'} description`}
                rows={3}
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
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading || !formData.title.trim() || (isResource && !formData.url.trim())}
            >
              {loading ? 'Creating...' : `Create ${isResource ? 'Resource' : 'Task'}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
