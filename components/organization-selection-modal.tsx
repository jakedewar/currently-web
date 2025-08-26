"use client"

import { useState, useEffect, useMemo } from "react"
import { Building2, Plus, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useOrganization } from "@/components/organization-provider"
import { useOrganizations } from "@/hooks/use-organizations"
import { useRouter } from "next/navigation"

interface OrganizationSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  isNewLogin?: boolean
}

export function OrganizationSelectionModal({
  isOpen,
  onClose,
  isNewLogin = false,
}: OrganizationSelectionModalProps) {
  const { currentOrganization, setCurrentOrganization } = useOrganization()
  const { data: orgsData, isLoading } = useOrganizations()
  const router = useRouter()
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)

  const organizations = useMemo(() => orgsData?.organizations || [], [orgsData?.organizations])

  // Set initial selection if no organization is currently selected
  useEffect(() => {
    if (organizations.length > 0 && !currentOrganization) {
      setSelectedOrgId(organizations[0].id)
    } else if (currentOrganization) {
      setSelectedOrgId(currentOrganization.id)
    }
  }, [organizations, currentOrganization])

  const handleContinue = () => {
    if (selectedOrgId) {
      const selectedOrg = organizations.find(org => org.id === selectedOrgId)
      if (selectedOrg) {
        setCurrentOrganization(selectedOrg)
        onClose()
      }
    }
  }

  const handleCreateOrganization = () => {
    onClose()
    router.push('/protected/organizations')
  }

  const handleManageOrganizations = () => {
    onClose()
    router.push('/protected/organizations')
  }

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Loading organizations...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isNewLogin ? "Welcome! Select your organization" : "Select Organization"}
          </DialogTitle>
          <DialogDescription>
            {isNewLogin 
              ? "Choose which organization you&apos;d like to work with, or create a new one."
              : "Select an organization to continue working."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {organizations.length > 0 ? (
            <div className="space-y-2">
              {organizations.map((org) => (
                <div
                  key={org.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedOrgId === org.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedOrgId(org.id)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={org.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {org.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{org.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {org.role}
                    </div>
                  </div>
                  {selectedOrgId === org.id && (
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                You don&apos;t have any organizations yet.
              </p>
              <Button onClick={handleCreateOrganization}>
                <Plus className="mr-2 h-4 w-4" />
                Create your first organization
              </Button>
            </div>
          )}

          {organizations.length > 0 && (
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={handleCreateOrganization}
                className="flex-1"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New
              </Button>
              <Button
                variant="outline"
                onClick={handleManageOrganizations}
                className="flex-1"
              >
                <Settings className="mr-2 h-4 w-4" />
                Manage
              </Button>
            </div>
          )}

          {organizations.length > 0 && selectedOrgId && (
            <Button onClick={handleContinue} className="w-full">
              Continue with {organizations.find(org => org.id === selectedOrgId)?.name || "selected organization"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
