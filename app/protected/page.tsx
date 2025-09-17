'use client'

import { useOrganization } from "@/components/organization-provider"
import { useCurrentlyDashboardData } from "@/hooks/use-currently-dashboard"
import { UpcomingTasks } from "@/components/dashboard/upcoming-tasks"
import { RecentProjects } from "@/components/dashboard/recent-projects"
import { ActivityFeed } from "@/components/dashboard/team-activity"
import { StatsCards } from "@/components/dashboard/stats-cards"

export default function ProtectedPage() {
  const { currentOrganization } = useOrganization()
  const { data: dashboardData, isLoading, error } = useCurrentlyDashboardData(currentOrganization?.id)

  if (!currentOrganization) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Please select an organization to view your dashboard.
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Loading your dashboard...
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Error loading your dashboard. Please try again.
          </p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            No dashboard data available.
          </p>
        </div>
      </div>
    )
  }



  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Your central hub for staying on top of everything.
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={dashboardData.stats} />

      {/* 3 Core Features Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <UpcomingTasks 
          currentFocus={dashboardData.currentFocus}
          upcomingDeadlines={dashboardData.upcomingDeadlines}
        />
        <RecentProjects 
          quickActions={dashboardData.quickActions}
        />
        <ActivityFeed 
          context={dashboardData.context}
        />
      </div>
    </div>
  )
}

