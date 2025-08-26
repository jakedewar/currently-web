'use client'

import { DashboardHeader } from "@/components/dashboard-header"
import { AppSidebar } from "@/components/app-sidebar"
import { OrganizationProvider } from "@/components/organization-provider"
import { useOrganizationQueryInvalidation } from "@/hooks/use-organization-data"

function ProtectedLayoutContent({ children }: { children: React.ReactNode }) {
  // Invalidate queries when organization changes
  useOrganizationQueryInvalidation()

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OrganizationProvider>
      <ProtectedLayoutContent>
        {children}
      </ProtectedLayoutContent>
    </OrganizationProvider>
  );
}
