'use client';

import { RecentWork } from "./recent-work";
import { TeamActivity } from "./team-activity";
import { useOrganization } from "@/components/organization-provider";
import { useDashboardData } from "@/hooks/use-dashboard-updates";
import { DashboardData } from "@/lib/data/dashboard";

interface DynamicDashboardSectionProps {
  initialWorkItems: DashboardData['workItems'];
  initialTeamActivity: DashboardData['teamActivity'];
  initialActivityUsers: DashboardData['activityUsers'];
}

export function DynamicDashboardSection({
  initialWorkItems,
  initialTeamActivity,
  initialActivityUsers,
}: DynamicDashboardSectionProps) {
  const { currentOrganization } = useOrganization();
  const { data: dashboardData } = useDashboardData(currentOrganization?.id);

  // Use live data if available, otherwise fall back to initial data
  const workItems = dashboardData?.workItems || initialWorkItems;
  const teamActivity = dashboardData?.teamActivity || initialTeamActivity;
  const activityUsers = dashboardData?.activityUsers || initialActivityUsers;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <RecentWork workItems={workItems} />
      <TeamActivity 
        teamActivity={teamActivity} 
        activityUsers={activityUsers} 
      />
    </div>
  );
}
