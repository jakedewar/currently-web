import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDashboardStats } from "@/lib/utils/dashboard";

interface StatsCardsProps {
  stats: {
    yourStreams: number;
    totalStreams: number;
    totalHours: number;
    tasksCompletedThisWeek: number;
    teamSize: number;
  } | undefined;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const dashboardStats = getDashboardStats(stats);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {dashboardStats.map((stat) => (
        <Card key={stat.title} className="hover:shadow-md transition-shadow border-border bg-card">
          <CardContent className="px-4 py-0">
            <div className="flex items-center justify-between mb-1">
              <CardTitle className="text-sm font-medium text-card-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold text-card-foreground mb-2">{stat.value}</div>
            <Badge variant="secondary" className="text-xs">
              {stat.trend}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
