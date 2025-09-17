"use client"

import { useEffect, useState, use } from "react"
import { usePathname } from "next/navigation"
import { ProjectsList } from "@/components/projects/projects-list"
import type { ProjectsData } from "@/lib/data/projects"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { 
  Clock, 
  MapPin, 
  MessageSquare, 
  Video,
  ArrowLeft,
  Waves
} from "lucide-react"
import Link from "next/link"
import { useOrganization } from "@/components/organization-provider"

interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  department: string | null;
  location: string | null;
  timezone: string | null;
  organization_role: string;
  joined_at: string | null;
}

function UserProjects({ userId }: { userId: string }) {
  const pathname = usePathname()
  const [projectsData, setProjectsData] = useState<ProjectsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentOrganization } = useOrganization()

  useEffect(() => {
    const fetchUserProjects = async () => {
      if (!currentOrganization) {
        setError('Please select an organization')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/users/${userId}/projects?organizationId=${currentOrganization.id}`)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch user projects`)
        }

        const data = await response.json()
        
        // Validate the data structure
        if (!data || !Array.isArray(data.projects)) {
          throw new Error('Invalid data structure received from server')
        }

        setProjectsData(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching user projects:', err)
        setError(err instanceof Error ? err.message : 'Failed to load user projects')
      } finally {
        setLoading(false)
      }
    }

    fetchUserProjects()
  }, [userId, currentOrganization])

  if (loading) {
    return (
      <div className="space-y-3 sm:space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-3 sm:p-4 border rounded-lg animate-pulse">
            <div className="h-5 sm:h-6 bg-muted rounded w-1/4 mb-2" />
            <div className="h-3 sm:h-4 bg-muted rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-4 sm:py-6">
        <p className="text-sm sm:text-base text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (!projectsData || projectsData.projects.length === 0) {
    return (
      <div className="text-center py-4 sm:py-6">
        <p className="text-sm sm:text-base text-muted-foreground">No projects found for this user.</p>
      </div>
    )
  }

  return <ProjectsList data={projectsData} pathname={pathname} />
}

export default function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentOrganization } = useOrganization()

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentOrganization) {
        setError('Please select an organization')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/users/${id}?organizationId=${currentOrganization.id}`)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch user data`)
        }

        const data = await response.json()
        
        // Validate the data structure
        if (!data || typeof data.id !== 'string') {
          throw new Error('Invalid user data received from server')
        }

        setUserProfile(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching user data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load user data')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [id, currentOrganization])

  if (!currentOrganization) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/protected/users">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Back to Team</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </Link>
        </div>
        <div className="text-center py-8 sm:py-12">
          <p className="text-sm sm:text-base text-muted-foreground">
            Please select an organization to view user details.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/protected/users">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Back to Team</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </Link>
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full animate-pulse flex-shrink-0" />
            <div className="space-y-2 min-w-0 flex-1">
              <div className="h-6 sm:h-8 bg-muted rounded w-32 sm:w-48 animate-pulse" />
              <div className="h-3 sm:h-4 bg-muted rounded w-24 sm:w-32 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !userProfile) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/protected/users">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Back to Team</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </Link>
        </div>
        <div className="text-center py-8 sm:py-12">
          <p className="text-sm sm:text-base text-muted-foreground">
            {error || "User not found"}
          </p>
        </div>
      </div>
    )
  }

  const displayName = userProfile.full_name || 'Unknown User'
  const displayDepartment = userProfile.department || 'No department'
  const displayLocation = userProfile.location || 'No location'
  const displayTimezone = userProfile.timezone || 'No timezone'
  const displayRole = userProfile.organization_role ? `${userProfile.organization_role.charAt(0).toUpperCase() + userProfile.organization_role.slice(1)}` : 'Member'
  const joinDate = userProfile.joined_at ? new Date(userProfile.joined_at).toLocaleDateString() : 'Unknown'

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/protected/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Back to Team</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </Link>
      </div>

      {/* User Info */}
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="relative flex-shrink-0">
              <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                <AvatarImage src={userProfile.avatar_url || undefined} alt={displayName} />
                <AvatarFallback className="text-sm sm:text-lg">
                  {displayName.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-3xl font-bold tracking-tight truncate">{displayName}</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">{displayRole} • {displayDepartment}</p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 sm:mt-3">
                <span className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">{displayLocation}</span>
                </span>
                <span className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">{displayTimezone}</span>
                </span>
                <span className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <span className="hidden sm:inline">Joined:</span>
                  <span className="sm:hidden">Joined</span> {joinDate}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:flex-shrink-0">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Message</span>
              <span className="sm:hidden">Msg</span>
            </Button>
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
              <Video className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Call</span>
              <span className="sm:hidden">Call</span>
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Waves className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
          <span className="text-xs sm:text-sm text-muted-foreground">Currently:</span>
          <span className="text-xs sm:text-sm font-medium truncate">Member of {currentOrganization.name}</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="projects" className="text-xs sm:text-sm">Projects</TabsTrigger>
          <TabsTrigger value="tasks" className="text-xs sm:text-sm">Tasks</TabsTrigger>
          <TabsTrigger value="activity" className="text-xs sm:text-sm">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <UserProjects userId={id} />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="text-center py-8 sm:py-12">
            <p className="text-sm sm:text-base text-muted-foreground">No tasks found for this user.</p>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="text-center py-8 sm:py-12">
            <p className="text-sm sm:text-base text-muted-foreground">No recent activity found for this user.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}