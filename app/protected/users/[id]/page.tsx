"use client"

import { useEffect, useState, use } from "react"
import { usePathname } from "next/navigation"
import { StreamsList } from "@/components/streams/streams-list"
import type { StreamsData } from "@/lib/data/streams"
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

function UserStreams({ userId }: { userId: string }) {
  const pathname = usePathname()
  const [streamsData, setStreamsData] = useState<StreamsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentOrganization } = useOrganization()

  useEffect(() => {
    const fetchUserStreams = async () => {
      if (!currentOrganization) {
        setError('Please select an organization')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/users/${userId}/streams?organizationId=${currentOrganization.id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch user streams')
        }

        setStreamsData(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching user streams:', err)
        setError(err instanceof Error ? err.message : 'Failed to load user streams')
      } finally {
        setLoading(false)
      }
    }

    fetchUserStreams()
  }, [userId, currentOrganization])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 border rounded-lg animate-pulse">
            <div className="h-6 bg-muted rounded w-1/4 mb-2" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (!streamsData || streamsData.streams.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No streams found for this user.</p>
      </div>
    )
  }

  return <StreamsList data={streamsData} pathname={pathname} />
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
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch user data')
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
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/protected/users">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Team
            </Button>
          </Link>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Please select an organization to view user details.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/protected/users">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Team
            </Button>
          </Link>
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-muted rounded-full animate-pulse" />
            <div className="space-y-2">
              <div className="h-8 bg-muted rounded w-48 animate-pulse" />
              <div className="h-4 bg-muted rounded w-32 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !userProfile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/protected/users">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Team
            </Button>
          </Link>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/protected/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Team
          </Button>
        </Link>
      </div>

      {/* User Info */}
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarImage src={userProfile.avatar_url || undefined} alt={displayName} />
                <AvatarFallback className="text-lg">
                  {displayName.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{displayName}</h1>
              <p className="text-muted-foreground mt-1">{displayRole} • {displayDepartment}</p>
              <div className="flex items-center gap-4 mt-3">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {displayLocation}
                </span>
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {displayTimezone}
                </span>
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  Joined: {joinDate}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button variant="outline" size="sm">
              <Video className="h-4 w-4 mr-2" />
              Call
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Waves className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground">Currently:</span>
          <span className="text-sm font-medium">Member of {currentOrganization.name}</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="streams" className="space-y-4">
        <TabsList>
          <TabsTrigger value="streams">Streams</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="streams" className="space-y-4">
          <UserStreams userId={id} />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="text-center py-12">
            <p className="text-muted-foreground">No tasks found for this user.</p>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="text-center py-12">
            <p className="text-muted-foreground">No recent activity found for this user.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}