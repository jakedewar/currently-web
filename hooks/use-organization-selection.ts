import { useState, useEffect } from "react"
import { useOrganization } from "@/components/organization-provider"
import { useOrganizations } from "@/hooks/use-organizations"

export function useOrganizationSelection() {
  const { currentOrganization, isLoading: orgProviderLoading } = useOrganization()
  const { data: orgsData, isLoading: orgsLoading } = useOrganizations()
  const [showModal, setShowModal] = useState(false)
  const [isNewLogin, setIsNewLogin] = useState(false)

  const isLoading = orgProviderLoading || orgsLoading
  const organizations = orgsData?.organizations || []

  // Check if we should show the organization selection modal
  useEffect(() => {
    if (isLoading) return

    // If user has no organizations, show modal to create one
    if (organizations.length === 0) {
      setShowModal(true)
      setIsNewLogin(true)
      return
    }

    // If user has organizations but none is selected, show modal
    // Only show if we're not still loading the organization from localStorage
    if (organizations.length > 0 && !currentOrganization && !orgProviderLoading) {
      setShowModal(true)
      setIsNewLogin(true)
      return
    }

    // If user has a selected organization, don't show modal
    if (currentOrganization) {
      setShowModal(false)
      setIsNewLogin(false)
    }
  }, [organizations, currentOrganization, isLoading, orgProviderLoading])

  const openModal = () => {
    setShowModal(true)
    setIsNewLogin(false)
  }

  const closeModal = () => {
    setShowModal(false)
    setIsNewLogin(false)
  }

  return {
    showModal,
    isNewLogin,
    openModal,
    closeModal,
    isLoading,
    organizations,
    currentOrganization,
  }
}
