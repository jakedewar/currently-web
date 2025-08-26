"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { Organization } from "./organization-selector"

interface OrganizationContextType {
  currentOrganization: Organization | null
  organizations: Organization[]
  setCurrentOrganization: (org: Organization) => void
  setOrganizations: (orgs: Organization[]) => void
  isLoading: boolean
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
  const [isLoading, setIsLoading] = useState(true)
  const [hasInitialized, setHasInitialized] = useState(false)

  // Load saved organization from localStorage and handle initial organization selection
  useEffect(() => {
    if (typeof window !== 'undefined' && organizations.length > 0 && !hasInitialized) {
      const savedOrgId = localStorage.getItem('selectedOrganizationId')
      
      if (savedOrgId) {
        // Try to find the saved organization
        const savedOrg = organizations.find(org => org.id === savedOrgId)
        if (savedOrg) {
          setCurrentOrganization(savedOrg)
        } else {
          // Saved organization not found, fall back to first organization
          setCurrentOrganization(organizations[0])
        }
      } else {
        // No saved organization, use first organization
        setCurrentOrganization(organizations[0])
      }
      
      setHasInitialized(true)
      setIsLoading(false)
    }
  }, [organizations, hasInitialized])

  // Save organization selection to localStorage
  const handleSetCurrentOrganization = (org: Organization) => {
    setCurrentOrganization(org)
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedOrganizationId', org.id)
    }
  }

  const value = {
    currentOrganization,
    organizations,
    setCurrentOrganization: handleSetCurrentOrganization,
    setOrganizations,
    isLoading,
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
