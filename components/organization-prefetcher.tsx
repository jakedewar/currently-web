"use client"

import { useOrganizationPrefetch } from "@/hooks/use-organization-data"

export function OrganizationPrefetcher() {
  useOrganizationPrefetch()
  return null
}
