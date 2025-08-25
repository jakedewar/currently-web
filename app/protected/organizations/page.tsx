import { Suspense } from "react"
import { OrganizationManagement } from "@/components/organizations/organization-management"

export default function OrganizationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
        <p className="text-muted-foreground">
          Manage your organizations and team members.
        </p>
      </div>
      
      <Suspense fallback={<div>Loading...</div>}>
        <OrganizationManagement />
      </Suspense>
    </div>
  )
}
