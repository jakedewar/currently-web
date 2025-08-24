'use client'

import { WorkItem } from '@/lib/data/streams'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { CreateWorkItemDialog } from './create-work-item-dialog'
import { ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface WorkItemsListProps {
  streamId: string
  workItems: WorkItem[]
  onWorkItemCreated: () => void
}

export function WorkItemsList({ streamId, workItems, onWorkItemCreated }: WorkItemsListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'archived':
        return 'bg-gray-500'
      default:
        return 'bg-blue-500'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Work Items</h3>
        <CreateWorkItemDialog streamId={streamId} onWorkItemCreated={onWorkItemCreated} />
      </div>
      <div className="grid gap-4">
        {workItems.length === 0 ? (
          <Card className="p-4">
            <p className="text-sm text-muted-foreground text-center">
              No work items yet. Add a URL to get started.
            </p>
          </Card>
        ) : (
          workItems.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{item.title}</h4>
                    <Badge variant="secondary" className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {item.url}
                    </a>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Added {formatDistanceToNow(new Date(item.created_at!), { addSuffix: true })}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
