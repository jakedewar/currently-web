"use client"

import { useState, useEffect } from "react"
import { useOrganization } from "@/components/organization-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Users, Plus, Settings, Calendar } from "lucide-react"
import { CreateOrganizationDialog } from "./create-organization-dialog"
import { OrganizationMembers } from "./organization-members"
import { OrganizationInvitations } from "./organization-invitations"

interface Organization {
  id: string
  name: string
  slug: string
  avatar_url?: string
  role: "owner" | "admin" | "member"
  created_at: string
  updated_at: string
}

export function OrganizationManagement() {
  const { setCurrentOrganization } = useOrganization()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    fetchOrganizations()
  }, [])

  useEffect(() => {
    if (organizations.length > 0 && !selectedOrg) {
      setSelectedOrg(organizations[0])
    }
  }, [organizations, selectedOrg])

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations')
      const data = await response.json()
      
      if (response.ok) {
        setOrganizations(data.organizations)
      } else {
        console.error('Failed to fetch organizations:', data.error)
      }
    } catch (error) {
      console.error('Error fetching organizations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrganization = async (name: string, slug: string) => {
    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, slug }),
      })

      const data = await response.json()

      if (response.ok) {
        setOrganizations(prev => [...prev, data.organization])
        setSelectedOrg(data.organization)
        setCurrentOrganization(data.organization)
        setShowCreateDialog(false)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Error creating organization:', error)
      throw error
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Organizations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {organizations.map((org) => (
          <Card 
            key={org.id} 
            className={`cursor-pointer transition-colors hover:bg-accent/50 ${
              selectedOrg?.id === org.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedOrg(org)}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={org.avatar_url} />
                  <AvatarFallback>
                    {org.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{org.name}</CardTitle>
                  <CardDescription className="truncate">
                    {org.slug}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="capitalize">
                  {org.role}
                </Badge>
                <div className="text-xs text-muted-foreground">
                  Created {formatDate(org.created_at)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        <Card 
          className="cursor-pointer transition-colors hover:bg-accent/50 border-dashed"
          onClick={() => setShowCreateDialog(true)}
        >
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Create Organization</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Organization Details */}
      {selectedOrg && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedOrg.avatar_url} />
                  <AvatarFallback>
                    {selectedOrg.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{selectedOrg.name}</CardTitle>
                  <CardDescription>{selectedOrg.slug}</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {selectedOrg.role}
                </Badge>
                {['owner', 'admin'].includes(selectedOrg.role) && (
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="invitations">Invitations</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Organization</p>
                      <p className="text-xs text-muted-foreground">Active</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Members</p>
                      <p className="text-xs text-muted-foreground">Loading...</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(selectedOrg.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="members">
                <OrganizationMembers organizationId={selectedOrg.id} />
              </TabsContent>
              
              <TabsContent value="invitations">
                <OrganizationInvitations organizationId={selectedOrg.id} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      <CreateOrganizationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateOrganization={handleCreateOrganization}
      />
    </div>
  )
}
