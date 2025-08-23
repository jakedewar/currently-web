import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, MessageSquare } from "lucide-react";
import { formatTimeAgo, getActivityDescription } from "@/lib/utils/dashboard";

interface TeamActivity {
  id: string;
  user_id: string;
  activity_type: string;
  description: string;
  tool: string | null;
  created_at: string | null;
  streams: {
    name: string | null;
  } | null;
  work_items: {
    title: string | null;
  } | null;
}

interface TeamActivityProps {
  teamActivity: TeamActivity[];
  activityUsers: Map<string, { id: string; full_name: string | null }>;
}

export function TeamActivity({ teamActivity, activityUsers }: TeamActivityProps) {
  const getToolIcon = (tool: string | null) => {
    if (!tool) return <FileText className="h-3 w-3" />;
    
    switch (tool.toLowerCase()) {
      case "figma": return <FileText className="h-3 w-3" />;
      case "slack": return <MessageSquare className="h-3 w-3" />;
      case "notion": return <FileText className="h-3 w-3" />;
      case "google docs": return <FileText className="h-3 w-3" />;
      case "linear": return <FileText className="h-3 w-3" />;
      case "github": return <FileText className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <Users className="h-5 w-5" />
          Team Activity
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          What your team is working on
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teamActivity && teamActivity.length > 0 ? (
            teamActivity.map((activity) => {
              const user = activityUsers.get(activity.user_id);
              const userName = user?.full_name || "Someone";
              
              return (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">
                      {userName.split(' ').map((n: string) => n[0]).join('') || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-card-foreground">
                      {getActivityDescription(activity, userName)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {activity.tool && (
                        <>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            {getToolIcon(activity.tool)}
                            <span>{activity.tool}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">•</span>
                        </>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(activity.created_at || '')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No team activity yet</p>
              <p className="text-xs">Start working to see activity here</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
