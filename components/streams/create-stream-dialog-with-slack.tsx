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
import { useOrganization } from "@/components/organization-provider"
import { useToast } from "@/hooks/use-toast"
import { useSlackNotifications } from "@/hooks/use-slack-notifications"
import { EmojiPicker } from "@/components/ui/emoji-picker"

interface CreateStreamDialogProps {
  onStreamCreated: () => void
}

export function CreateStreamDialogWithSlack({ onStreamCreated }: CreateStreamDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { currentOrganization } = useOrganization()
  const { toast } = useToast()
  const { sendStreamNotification } = useSlackNotifications()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    emoji: '',
    priority: 'medium',
    status: 'active',
    progress: 0,
    start_date: '',
    end_date: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentOrganization) return

    setLoading(true)
    try {
      console.log('Submitting stream data:', {
        ...formData,
        organization_id: currentOrganization.id,
      });
      
      const response = await fetch('/api/streams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          organization_id: currentOrganization.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.error || 'Failed to create stream'
        
        // Handle specific error cases
        if (response.status === 409) {
          throw new Error('This stream already exists')
        } else if (response.status === 403) {
          throw new Error('You do not have permission to create streams in this organization')
        } else if (response.status === 400 && data.details) {
          // Format validation errors
          const validationErrors = data.details
            .map((issue: { path: string[]; message: string }) => `${issue.path.join('.')}: ${issue.message}`)
            .join(', ');
          throw new Error(`Validation failed: ${validationErrors}`)
        }
        
        throw new Error(errorMessage)
      }

      // Send Slack notification for stream creation
      if (data.stream) {
        await sendStreamNotification({
          id: data.stream.id,
          title: data.stream.title,
          description: data.stream.description,
          status: data.stream.status,
          organization_id: currentOrganization.id,
        }, 'created');
      }

      toast({
        title: "Success",
        description: "Stream created successfully",
      })
      
      setOpen(false)
      onStreamCreated()
      setFormData({
        name: '',
        description: '',
        emoji: '',
        priority: 'medium',
        status: 'active',
        progress: 0,
        start_date: '',
        end_date: '',
      })
    } catch (error) {
      console.error('Error creating stream:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create stream',
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Stream
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Stream</DialogTitle>
            <DialogDescription>
              Create a new work stream for your organization. Add details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter stream name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="emoji">Emoji</Label>
              <EmojiPicker
                value={formData.emoji}
                onValueChange={(emoji) => setFormData({ ...formData, emoji })}
                placeholder="Choose an emoji for this stream"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter stream description"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading || !formData.name.trim() || !currentOrganization}
            >
              {loading ? 'Creating...' : 'Create Stream'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
