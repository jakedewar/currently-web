"use client"

import { useOrganization } from "@/components/organization-provider"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, Calendar } from "lucide-react"

export function OrganizationInfo() {
  const { currentOrganization } = useOrganization()

  if (!currentOrganization) {
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Organization Info
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg">{currentOrganization.name}</h3>
          <p className="text-sm text-muted-foreground">
            Slug: {currentOrganization.slug}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="capitalize">
            {currentOrganization.role}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>Team Members</span>
          </div>
          <div className="text-right font-medium">8</div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Created</span>
          </div>
          <div className="text-right font-medium">Jan 2024</div>
        </div>
      </CardContent>
    </Card>
  )
}
