'use client'

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Archive, ExternalLink, Link as LinkIcon } from "lucide-react"
import { ProjectsData } from "@/lib/data/projects"
import { CreateWorkItemDialog } from "./create-work-item-dialog"

interface ProjectResourcesProps {
  project: ProjectsData['projects'][0];
  userRole: string;
  onProjectUpdated: () => void;
}

export function ProjectResources({ project, userRole, onProjectUpdated }: ProjectResourcesProps) {
  const [showArchived, setShowArchived] = useState(false)
  const isMember = userRole !== 'non_member'

  const activeResources = project.work_items.filter(item => item.type === 'url' && item.status !== 'archived')
  const archivedResources = project.work_items.filter(item => item.type === 'url' && item.status === 'archived')

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'completed': return 'bg-blue-500'
      case 'paused': return 'bg-yellow-500'
      case 'archived': return 'bg-gray-500'
      default: return 'bg-muted-foreground'
    }
  }

  return (
    <div className="space-y-6">
      {/* Active Resources */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Resources</h3>
            <Badge variant="secondary">{activeResources.length}</Badge>
          </div>
          {isMember && (
            <CreateWorkItemDialog
              projectId={project.id}
              type="url"
              onWorkItemCreated={onProjectUpdated}
            />
          )}
        </div>
        
        {activeResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeResources.map((resource) => (
              <Card
                key={resource.id}
                className="hover:shadow-md transition-shadow mb-3 p-4 cursor-pointer"
                onClick={() => {
                  if (resource.url) {
                    window.open(resource.url, '_blank')
                  }
                }}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(resource.status)} flex-shrink-0`} />
                        <Badge variant="outline" className="capitalize text-xs">
                          {resource.status}
                        </Badge>
                      </div>
                      
                      <h4 className="font-medium text-sm mb-2 line-clamp-2 hover:text-primary">
                        {resource.title}
                      </h4>
                      
                      {resource.url && (
                        <div className="mb-2">
                          <p className="text-xs text-muted-foreground truncate">
                            {resource.url}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {resource.url && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (resource.url) {
                            window.open(resource.url, '_blank')
                          }
                        }}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">
                        Added {formatDate(resource.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6">
            <div className="text-center">
              <LinkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No resources yet</h3>
              <p className="text-muted-foreground mb-4">
                Share useful links, documents, and resources with your team.
              </p>
              {isMember && (
                <CreateWorkItemDialog
                  projectId={project.id}
                  type="url"
                  onWorkItemCreated={onProjectUpdated}
                />
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Archived Resources */}
      {archivedResources.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Archived Resources</h3>
              <Badge variant="secondary">{archivedResources.length}</Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowArchived(!showArchived)}
            >
              {showArchived ? 'Hide' : 'Show'} Archived
            </Button>
          </div>
          
          {showArchived && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {archivedResources.map((resource) => (
                <Card
                  key={resource.id}
                  className="hover:shadow-md transition-shadow mb-3 p-4 cursor-pointer bg-muted/30 opacity-75"
                  onClick={() => {
                    if (resource.url) {
                      window.open(resource.url, '_blank')
                    }
                  }}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(resource.status)} flex-shrink-0`} />
                          <Badge variant="outline" className="capitalize text-xs">
                            {resource.status}
                          </Badge>
                        </div>
                        
                        <h4 className="font-medium text-sm mb-2 line-clamp-2 hover:text-primary">
                          {resource.title}
                        </h4>
                        
                        {resource.url && (
                          <div className="mb-2">
                            <p className="text-xs text-muted-foreground truncate">
                              {resource.url}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {resource.url && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (resource.url) {
                              window.open(resource.url, '_blank')
                            }
                          }}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">
                          Added {formatDate(resource.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
