"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { Organization } from "./organization-selector"

interface OrganizationContextType {
  currentOrganization: Organization | null
  organizations: Organization[]
  setCurrentOrganization: (org: Organization) => void
  setOrganizations: (orgs: Organization[]) => void
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

interface OrganizationProviderProps {
  children: ReactNode
  initialOrganizations?: Organization[]
  initialCurrentOrganization?: Organization | null
}

export function OrganizationProvider({
  children,
  initialOrganizations = [],
  initialCurrentOrganization = null,
}: OrganizationProviderProps) {
  const [organizations, setOrganizations] = useState<Organization[]>(initialOrganizations)
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(
    initialCurrentOrganization
  )

  const value = {
    currentOrganization,
    organizations,
    setCurrentOrganization,
    setOrganizations,
  }

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error("useOrganization must be used within an OrganizationProvider")
  }
  return context
}
