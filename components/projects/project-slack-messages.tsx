'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Slack, Settings } from "lucide-react"
import { ProjectsData } from "@/lib/data/projects"

interface ProjectSlackMessagesProps {
  project: ProjectsData['projects'][0];
  userRole: string;
  onProjectUpdated: () => void;
}

export function ProjectSlackMessages({ userRole }: Omit<ProjectSlackMessagesProps, 'project'>) {
  const isMember = userRole !== 'non_member'
  
  // Mock slack messages data - in real implementation this would come from the API
  const slackMessages: Array<{
    id: string;
    text: string;
    user_name: string;
    created_at: string;
    thread_ts?: string;
  }> = []

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Slack Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Slack className="h-5 w-5" />
            Slack Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Slack Channel</h4>
              <p className="text-sm text-muted-foreground">
                {false ? 'Connected to Slack channel' : 'Not connected to Slack'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={false ? "default" : "secondary"}>
                {false ? 'Connected' : 'Not Connected'}
              </Badge>
              {isMember && (
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Slack Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Messages
            <Badge variant="secondary">{slackMessages.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {slackMessages.length > 0 ? (
            <div className="space-y-4">
              {slackMessages.slice(0, 10).map((message) => (
                <div
                  key={message.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {message.user_name || 'Unknown User'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(message.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {message.text || 'No message content'}
                    </p>
                    {message.thread_ts && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        Thread Reply
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              
              {slackMessages.length > 10 && (
                <div className="text-center pt-2">
                  <Button variant="ghost" size="sm">
                    View all messages
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Slack messages yet</h3>
              <p className="text-muted-foreground mb-4">
                {false 
                  ? 'Messages from your connected Slack channel will appear here.'
                  : 'Connect a Slack channel to see messages here.'
                }
              </p>
              {isMember && (
                <Button variant="outline">
                  <Slack className="h-4 w-4 mr-2" />
                  {false ? 'View in Slack' : 'Connect Slack'}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
