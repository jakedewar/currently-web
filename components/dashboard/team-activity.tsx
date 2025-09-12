'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, Users, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { CurrentlyDashboardData } from "@/lib/data/currently-dashboard"

interface ActivityFeedProps {
  context: CurrentlyDashboardData['context']
}

export function ActivityFeed({ context }: ActivityFeedProps) {
  const { streamUpdates } = context

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffTime / (1000 * 60))

    if (diffDays > 0) return `${diffDays}d ago`
    if (diffHours > 0) return `${diffHours}h ago`
    if (diffMinutes > 0) return `${diffMinutes}m ago`
    return 'Just now'
  }

  const getActivityIcon = (activityType: string) => {
    switch (activityType.toLowerCase()) {
      case 'created': return '➕'
      case 'updated': return '✏️'
      case 'completed': return '✅'
      case 'assigned': return '👤'
      case 'commented': return '💬'
      default: return '📝'
    }
  }

  const getActivityColor = (activityType: string) => {
    switch (activityType.toLowerCase()) {
      case 'created': return 'default'
      case 'updated': return 'secondary'
      case 'completed': return 'outline'
      case 'assigned': return 'destructive'
      case 'commented': return 'secondary'
      default: return 'secondary'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-purple-500" />
          Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {streamUpdates && streamUpdates.length > 0 ? (
          <div className="space-y-3">
            {streamUpdates.slice(0, 5).map((update) => (
              <div key={update.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="text-lg flex-shrink-0">{getActivityIcon(update.activity_type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{update.user_name}</span>
                    <Badge variant={getActivityColor(update.activity_type)} className="text-xs">
                      {update.activity_type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1 line-clamp-2">
                    {update.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{update.stream_name}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(update.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {streamUpdates.length > 5 && (
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/protected/streams">
                    View all activity
                  </Link>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent activity</p>
            <p className="text-xs">Updates from streams and integrations will appear here</p>
            <Button variant="outline" size="sm" className="mt-3" asChild>
              <Link href="/protected/streams">
                <ArrowRight className="h-4 w-4 mr-2" />
                View Streams
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}