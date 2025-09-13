import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plug, 
  Github, 
  Zap, 
  Calendar,
  Mail,
  Database,
  ExternalLink,
  CheckCircle,
  Clock
} from "lucide-react";
import { SlackIntegration } from "@/components/integrations/slack-integration";
import { SlackDebug } from "@/components/integrations/slack-debug";

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground">
          Connect your favorite tools and services to streamline your workflow.
        </p>
      </div>

      {/* Available Integrations */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Available Integrations</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          
          {/* GitHub Integration */}
          <Card className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-900 rounded-lg">
                    <Github className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">GitHub</CardTitle>
                    <CardDescription>Connect your repositories</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Available
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Sync your GitHub repositories and track development progress directly in your streams.
              </p>
              <Button className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                Connect GitHub
              </Button>
            </CardContent>
          </Card>

          {/* Slack Integration */}
          <SlackIntegration />

          {/* Zapier Integration */}
          <Card className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Zapier</CardTitle>
                    <CardDescription>Automation workflows</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Available
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Create automated workflows between Currently and 5000+ other apps.
              </p>
              <Button className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                Connect Zapier
              </Button>
            </CardContent>
          </Card>

          {/* Google Calendar Integration */}
          <Card className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Google Calendar</CardTitle>
                    <CardDescription>Schedule management</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Coming Soon
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Sync your calendar events with your streams and tasks for better time management.
              </p>
              <Button className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          {/* Email Integration */}
          <Card className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-600 rounded-lg">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Email</CardTitle>
                    <CardDescription>Email notifications</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Coming Soon
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Set up email notifications for stream updates, task assignments, and team activities.
              </p>
              <Button className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          {/* Database Integration */}
          <Card className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-600 rounded-lg">
                    <Database className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Database</CardTitle>
                    <CardDescription>Data synchronization</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Coming Soon
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Connect external databases to sync data and maintain consistency across platforms.
              </p>
              <Button className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Connected Integrations */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Connected Integrations</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Plug className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No integrations connected</h3>
              <p className="text-muted-foreground mb-4">
                Connect your first integration to get started with automated workflows.
              </p>
              <Button>
                Browse Available Integrations
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Slack Debug Console */}
      <SlackDebug />

      {/* Integration Help */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="h-5 w-5" />
            Need Help with Integrations?
          </CardTitle>
          <CardDescription>
            Learn how to set up and manage your integrations effectively.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Getting Started</h4>
              <p className="text-sm text-muted-foreground">
                Learn the basics of connecting and managing integrations in Currently.
              </p>
              <Button variant="outline" size="sm">
                View Documentation
              </Button>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">API Access</h4>
              <p className="text-sm text-muted-foreground">
                Build custom integrations using our REST API and webhooks.
              </p>
              <Button variant="outline" size="sm">
                API Documentation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
