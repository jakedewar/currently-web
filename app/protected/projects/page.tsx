'use client'

import { ProjectsList } from "@/components/projects/projects-list"
import { useOrganization } from "@/components/organization-provider"
import { CreateProjectDialog } from "@/components/projects/create-project-dialog"
import { LoadingProject } from "@/components/projects/loading-project"
import { Accordion } from "@/components/ui/accordion"
import { useProjects } from "@/hooks/use-projects"

export default function ProjectsPage() {
  const { currentOrganization } = useOrganization()
  
  // Use React Query hook for projects data
  const { data: projectsData, isLoading, error, refetch } = useProjects(currentOrganization?.id)

  if (!currentOrganization) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Please select an organization to view projects
            </p>
          </div>
          <CreateProjectDialog onProjectCreated={() => refetch()} />
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Loading projects...
            </p>
          </div>
          <CreateProjectDialog onProjectCreated={() => refetch()} />
        </div>
        <Accordion type="multiple" className="space-y-3 sm:space-y-4">
          {[...Array(3)].map((_, i) => (
            <LoadingProject key={i} />
          ))}
        </Accordion>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {error instanceof Error ? error.message : 'Failed to load projects'}
            </p>
          </div>
          <CreateProjectDialog onProjectCreated={() => refetch()} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your team&apos;s projects and track progress
          </p>
        </div>
        <CreateProjectDialog onProjectCreated={() => refetch()} />
      </div>
      
      {projectsData && <ProjectsList data={projectsData} />}
    </div>
  )
}
