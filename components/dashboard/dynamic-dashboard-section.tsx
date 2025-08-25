'use client';

import { RecentWork } from "./recent-work";
import { TeamActivity } from "./team-activity";
import { useDashboardUpdates } from "@/hooks/use-dashboard-updates";
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
  const { workItems, teamActivity, activityUsers } = useDashboardUpdates({
    workItems: initialWorkItems,
    teamActivity: initialTeamActivity,
    activityUsers: initialActivityUsers,
  });

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
