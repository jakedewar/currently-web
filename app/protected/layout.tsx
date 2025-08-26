'use client'

import { DashboardHeader } from "@/components/dashboard-header"
import { AppSidebar } from "@/components/app-sidebar"
import { OrganizationProvider } from "@/components/organization-provider"
import { OrganizationPrefetcher } from "@/components/organization-prefetcher"
import { DataProvider } from "@/components/data-provider"
import { OrganizationSelectionModal } from "@/components/organization-selection-modal"
import { useOrganizationQueryInvalidation } from "@/hooks/use-organization-data"
import { useOrganizationSelection } from "@/hooks/use-organization-selection"

function ProtectedLayoutContent({ children }: { children: React.ReactNode }) {
  // Invalidate queries when organization changes
  useOrganizationQueryInvalidation()
  
  // Handle organization selection modal
  const { showModal, isNewLogin, closeModal } = useOrganizationSelection()

  return (
    <div className="flex min-h-screen bg-background">
      {/* Organization data prefetcher */}
      <OrganizationPrefetcher />
      
      {/* Centralized data provider */}
      <DataProvider>
        {/* Sidebar */}
        <AppSidebar />

        {/* Main Content */}
        <div className="flex flex-1 flex-col">
          <DashboardHeader />
          <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </DataProvider>

      {/* Organization Selection Modal */}
      <OrganizationSelectionModal
        isOpen={showModal}
        onClose={closeModal}
        isNewLogin={isNewLogin}
      />
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
