"use client"

import { ReactNode } from "react"
import { useOrganization } from "./organization-provider"
import { useUser } from "@/hooks/use-user"
import { useOrganizations } from "@/hooks/use-organizations"
import { useDashboardData } from "@/hooks/use-dashboard-updates"
import { useProjects } from "@/hooks/use-projects"
import { useUsers } from "@/hooks/use-users"

interface DataProviderProps {
  children: ReactNode
}

export function DataProvider({ children }: DataProviderProps) {
  const { currentOrganization } = useOrganization()
  
  // Prefetch all common data when organization changes
  // This ensures data is available when components need it
  useUser() // User data
  useOrganizations() // Organizations list
  
  // Organization-specific data - only fetch when we have an organization
  useDashboardData(currentOrganization?.id)
  useProjects(currentOrganization?.id)
  useUsers(currentOrganization?.id, 1, 10)
  
  return <>{children}</>
}
