"use client"

import { useEffect, useState } from "react"
import { TeamTable } from "@/components/team-table"
import { createClient } from "@/lib/supabase/client"
import { useOrganization } from "@/components/organization-provider"

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

      const supabase = createClient()
      
      // First, fetch all members of the current organization
      const { data: memberships, error: membershipError } = await supabase
        .from('organization_members')
        .select('user_id, role, joined_at')
        .eq('organization_id', currentOrganization.id)

      if (membershipError) {
        console.error('Error fetching organization members:', membershipError)
        setLoading(false)
        return
      }

      if (memberships && memberships.length > 0) {
        // Get all user IDs
        const userIds = memberships.map(m => m.user_id)
        
        // Fetch user profiles for all members
        const { data: userProfiles, error: userError } = await supabase
          .from('users')
          .select('id, full_name, avatar_url, department, location, timezone')
          .in('id', userIds)

        if (userError) {
          console.error('Error fetching user profiles:', userError)
          setLoading(false)
          return
        }

        // Combine the data
        const teamMembers: TeamMember[] = memberships.map(membership => {
          const userProfile = userProfiles?.find(u => u.id === membership.user_id)
          return {
            id: membership.user_id,
            name: userProfile?.full_name || 'Unknown User',
            email: '-', // We don't have email in the users table
            avatar: userProfile?.avatar_url || null,
            department: userProfile?.department || '-',
            currentWork: `Member since ${new Date(membership.joined_at || '').toLocaleDateString()}`,
            lastActive: 'Recently active',
            location: userProfile?.location || '-',
            timezone: userProfile?.timezone || '-',
          }
        })

        setUsers(teamMembers)
      } else {
        setUsers([])
      }

      setLoading(false)
    }

    fetchTeamMembers()
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
