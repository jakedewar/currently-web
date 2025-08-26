"use client"

import { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react"
import { Organization } from "./organization-selector"

// API organization data structure
interface ApiOrganization {
  id: string
  name: string
  slug: string
  avatar_url?: string
  avatar?: string
  role: "owner" | "admin" | "member"
}

interface OrganizationContextType {
  currentOrganization: Organization | null
  organizations: Organization[]
  setCurrentOrganization: (org: Organization) => void
  setOrganizations: (orgs: ApiOrganization[]) => void
  clearCurrentOrganization: () => void
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
  const previousOrgId = useRef<string | null>(null)

  // Transform API organization data to match the Organization interface
  const transformOrganizations = (apiOrgs: ApiOrganization[]): Organization[] => {
    return apiOrgs.map(org => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      avatar: org.avatar_url || org.avatar, // Handle both avatar_url and avatar
      role: org.role
    }))
  }

  // Handle setting organizations with data transformation
  const handleSetOrganizations = (apiOrgs: ApiOrganization[]) => {
    const transformedOrgs = transformOrganizations(apiOrgs)
    setOrganizations(transformedOrgs)
  }

  // Load saved organization from localStorage whenever organizations change
  useEffect(() => {
    if (typeof window !== 'undefined' && organizations.length > 0) {
      const savedOrgId = localStorage.getItem('selectedOrganizationId')
      
      if (savedOrgId) {
        // Try to find the saved organization
        const savedOrg = organizations.find(org => org.id === savedOrgId)
        if (savedOrg && previousOrgId.current !== savedOrg.id) {
          setCurrentOrganization(savedOrg)
          previousOrgId.current = savedOrg.id
        }
      }
      
      // Set loading to false once we have organizations
      setIsLoading(false)
    } else if (typeof window !== 'undefined' && organizations.length === 0) {
      // Set loading to false if we have no organizations
      setIsLoading(false)
    }
  }, [organizations])

  // Save organization selection to localStorage
  const handleSetCurrentOrganization = (org: Organization) => {
    setCurrentOrganization(org)
    previousOrgId.current = org.id
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedOrganizationId', org.id)
    }
  }

  const clearCurrentOrganization = () => {
    setCurrentOrganization(null)
    previousOrgId.current = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('selectedOrganizationId')
    }
  }

  const value = {
    currentOrganization,
    organizations,
    setCurrentOrganization: handleSetCurrentOrganization,
    setOrganizations: handleSetOrganizations,
    clearCurrentOrganization,
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
