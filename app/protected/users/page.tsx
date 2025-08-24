"use client"

import { useEffect, useState } from "react"
import { TeamTable } from "@/components/team-table"
import { useOrganization } from "@/components/organization-provider"
import { type Database } from "@/lib/supabase/types"

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
  const [users, setUsers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const { currentOrganization } = useOrganization()

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!currentOrganization) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/users?organizationId=${currentOrganization.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch team members');
        }

        const teamMembers: TeamMember[] = data.users.map((user: Database['public']['Tables']['users']['Row']) => ({
          id: user.id,
          name: user.full_name || 'Unknown User',
          email: '-', // We don't have email in the users table
          avatar: user.avatar_url || null,
          department: user.department || '-',
          currentWork: `Member since ${new Date(user.created_at || '').toLocaleDateString()}`,
          lastActive: 'Recently active',
          location: user.location || '-',
          timezone: user.timezone || '-',
        }));

        setUsers(teamMembers);
      } catch (err) {
        console.error('Error fetching team members:', err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, [currentOrganization])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">
            Loading team members...
          </p>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
              <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
                <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!currentOrganization) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">
            Please select an organization to view team members.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team</h1>
        <p className="text-muted-foreground">
          See what your teammates in {currentOrganization.name} are currently working on and stay connected.
        </p>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No team members found in this organization.</p>
        </div>
      ) : (
        <TeamTable users={users} />
      )}
    </div>
  )
}