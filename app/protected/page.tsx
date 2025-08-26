'use client'

import { useOrganization } from "@/components/organization-provider"
import { useDashboardData } from "@/hooks/use-dashboard-updates"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { DynamicDashboardSection } from "@/components/dashboard/dynamic-dashboard-section"

export default function ProtectedPage() {
  const { currentOrganization } = useOrganization()
  const { data: dashboardData, isLoading, error } = useDashboardData(currentOrganization?.id)

  if (!currentOrganization) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
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
          <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
          <p className="text-muted-foreground">
            Loading your dashboard...
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
          <p className="text-muted-foreground">
            Error loading dashboard data. Please try again.
          </p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
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
        <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your team&apos;s work today.
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={dashboardData.stats} />

      {/* Recent Work and Team Activity */}
      <DynamicDashboardSection 
        initialWorkItems={dashboardData.workItems}
        initialTeamActivity={dashboardData.teamActivity}
        initialActivityUsers={dashboardData.activityUsers}
      />
    </div>
  )
}

