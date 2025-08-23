import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock,
  FolderOpen, 
  MessageSquare, 
  FileText, 
  Calendar,
  TrendingUp,
  Users,
  Sparkles
} from "lucide-react";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  // Mock data for Currently dashboard
  const stats = [
    {
      title: "Active Streams",
      value: "12",
      description: "Streams you're working on",
      icon: FolderOpen,
      trend: "+2 this week",
      color: "text-primary",
    },
    {
      title: "Time Saved",
      value: "2.5h",
      description: "Today vs. last week",
      icon: Clock,
      trend: "+15%",
      color: "text-primary",
    },
    {
      title: "Context Switches",
      value: "23",
      description: "Reduced from 67",
      icon: TrendingUp,
      trend: "-66%",
      color: "text-primary",
    },
    {
      title: "Team Members",
      value: "8",
      description: "Active collaborators",
      icon: Users,
      trend: "+1",
      color: "text-primary",
    },
  ];

  // Mock recent work items
  const recentWork = [
    {
      id: 1,
      title: "Mobile App Redesign",
      type: "project",
      lastActivity: "2 hours ago",
      status: "active",
      tools: ["Figma", "Slack", "Notion"],
      description: "Working on the new mobile interface design",
    },
    {
      id: 2,
      title: "Q4 Marketing Strategy",
      type: "document",
      lastActivity: "4 hours ago",
      status: "review",
      tools: ["Google Docs", "Slack"],
      description: "Finalizing the Q4 marketing plan",
    },
    {
      id: 3,
      title: "Bug Fix: Login Flow",
      type: "task",
      lastActivity: "1 day ago",
      status: "completed",
      tools: ["Linear", "GitHub", "Slack"],
      description: "Fixed authentication issue in login flow",
    },
    {
      id: 4,
      title: "User Research Findings",
      type: "document",
      lastActivity: "2 days ago",
      status: "active",
      tools: ["Notion", "Figma", "Slack"],
      description: "Compiling user feedback and insights",
    },
  ];

  // Mock team activity
  const teamActivity = [
    {
      user: "Sarah Chen",
      action: "updated Mobile App Redesign",
      time: "5 min ago",
      tool: "Figma",
    },
    {
      user: "Mike Rodriguez",
      action: "commented on Q4 Marketing Strategy",
      time: "12 min ago",
      tool: "Google Docs",
    },
    {
      user: "Alex Johnson",
      action: "completed Bug Fix: Login Flow",
      time: "1 hour ago",
      tool: "Linear",
    },
    {
      user: "Emma Wilson",
      action: "shared User Research Findings",
      time: "2 hours ago",
      tool: "Notion",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "review": return "bg-yellow-500";
      case "completed": return "bg-blue-500";
      default: return "bg-muted-foreground";
    }
  };

  const getToolIcon = (tool: string) => {
    switch (tool.toLowerCase()) {
      case "figma": return <FileText className="h-3 w-3" />;
      case "slack": return <MessageSquare className="h-3 w-3" />;
      case "notion": return <FileText className="h-3 w-3" />;
      case "google docs": return <FileText className="h-3 w-3" />;
      case "linear": return <Calendar className="h-3 w-3" />;
      case "github": return <FileText className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your team&apos;s work today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Assistant
          </Button>
        </div>
      </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="hover:shadow-md transition-shadow border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
                <Badge variant="secondary" className="mt-2">
                  {stat.trend}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Work and Team Activity */}
        <div className="grid gap-6 md:grid-cols-2">
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
                {recentWork.map((work) => (
                  <div key={work.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(work.status)}`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium truncate text-card-foreground">{work.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {work.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {work.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {work.tools.slice(0, 3).map((tool) => (
                            <div key={tool} className="flex items-center gap-1 text-xs text-muted-foreground">
                              {getToolIcon(tool)}
                              <span>{tool}</span>
                            </div>
                          ))}
                          {work.tools.length > 3 && (
                            <span className="text-xs text-muted-foreground">+{work.tools.length - 3} more</span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{work.lastActivity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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
                {teamActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {activity.user.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-card-foreground">
                        <span className="font-medium">{activity.user}</span>
                        <span className="text-muted-foreground"> {activity.action}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {getToolIcon(activity.tool)}
                          <span>{activity.tool}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>  
    </div>
  );
}
