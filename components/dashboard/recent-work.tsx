import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Waves, MessageSquare } from "lucide-react";
import { getStatusColor, formatTimeAgo } from "@/lib/utils/dashboard";
import Link from "next/link";

interface WorkItem {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  tool: string | null;
  created_at: string | null;
  updated_at: string | null;
  streams: {
    id: string;
    name: string | null;
  } | null;
}

interface RecentWorkProps {
  workItems: WorkItem[];
}

export function RecentWork({ workItems }: RecentWorkProps) {
  const getToolIcon = (tool: string | null) => {
    if (!tool) return <Waves className="h-3 w-3" />;
    
    switch (tool.toLowerCase()) {
      case "figma": return <Waves className="h-3 w-3" />;
      case "slack": return <MessageSquare className="h-3 w-3" />;
      case "notion": return <Waves className="h-3 w-3" />;
      case "google docs": return <Waves className="h-3 w-3" />;
      case "linear": return <Waves className="h-3 w-3" />;
      case "github": return <Waves className="h-3 w-3" />;
      default: return <Waves className="h-3 w-3" />;
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <Clock className="h-5 w-5" />
          Recent Work
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Pick up where you left off
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workItems && workItems.length > 0 ? (
            workItems.map((work) => (
              <Link 
                key={work.id} 
                href={`/protected/streams/${work.streams?.id}`}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(work.status)}`}></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium truncate text-card-foreground">{work.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {work.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Added to {work.streams?.name}
                  </p>
                  <div className="flex items-center gap-2">
                    {work.tool && (
                      <>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {getToolIcon(work.tool)}
                          <span>{work.tool}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">•</span>
                      </>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(work.updated_at || work.created_at || '')}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Waves className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No work items yet</p>
              <p className="text-xs">Create your first work item to get started</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
