import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDashboardStats } from "@/lib/utils/dashboard";

interface StatsCardsProps {
  stats: {
    activeStreams: number;
    totalUrlItems?: number;
    totalNoteItems?: number;
    totalTasks?: number; // Legacy support
    totalResources?: number; // Legacy support
    teamSize: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const dashboardStats = getDashboardStats(stats);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {dashboardStats.map((stat) => (
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
  );
}
