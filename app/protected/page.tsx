import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { getDashboardData } from "@/lib/data/dashboard";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentWork } from "@/components/dashboard/recent-work";
import { TeamActivity } from "@/components/dashboard/team-activity";

export default async function ProtectedPage() {
  const dashboardData = await getDashboardData();

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
      <StatsCards stats={dashboardData.stats} />

      {/* Recent Work and Team Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <RecentWork workItems={dashboardData.workItems} />
        <TeamActivity 
          teamActivity={dashboardData.teamActivity} 
          activityUsers={dashboardData.activityUsers} 
        />
      </div>  
    </div>
  );
}

