"use client"

import { TeamTable } from "@/components/team-table"
import { useOrganization } from "@/components/organization-provider"
import { useUsers } from "@/hooks/use-users"

interface TeamMember {
  id: string
  name: string
  email: string
  avatar: string | null
  department: string | null
  currentWork: string
  lastActive: string
  location: string | null
  timezone: string | null
}

export default function UsersPage() {
  const { currentOrganization } = useOrganization()
  const { data: usersData, isLoading, error } = useUsers(currentOrganization?.id)

  // Transform the data to match the TeamMember interface
  const users: TeamMember[] = usersData?.users.map((user) => ({
    id: user.id,
    name: user.full_name || 'Unknown User',
    email: '-', // We don't have email in the users table
    avatar: user.avatar_url || null,
    department: user.department || '-',
    currentWork: `Member since ${new Date(user.joined_at || '').toLocaleDateString()}`,
    lastActive: 'Recently active',
    location: user.location || '-',
    timezone: user.timezone || '-',
  })) || []

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Loading team members...
          </p>
        </div>
        <div className="space-y-3 sm:space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 border rounded-lg">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-full animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2 min-w-0">
                <div className="h-3 sm:h-4 bg-muted rounded w-1/3 sm:w-1/4 animate-pulse" />
                <div className="h-2 sm:h-3 bg-muted rounded w-1/2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!currentOrganization) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Please select an organization to view team members.
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Error loading team members. Please try again.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Team</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          See what your teammates in {currentOrganization.name} are currently working on and stay connected.
        </p>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <p className="text-sm sm:text-base text-muted-foreground">No team members found in this organization.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <TeamTable users={users} />
        </div>
      )}
    </div>
  )
}