"use client"

import { useState } from "react"
import { ChevronDown, Plus, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface Organization {
  id: string
  name: string
  slug: string
  avatar?: string | undefined
  role: "owner" | "admin" | "member"
}

interface OrganizationSelectorProps {
  organizations: Organization[]
  currentOrganization: Organization
  onOrganizationChange: (org: Organization) => void
  className?: string
}

export function OrganizationSelector({
  organizations,
  currentOrganization,
  onOrganizationChange,
  className,
}: OrganizationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-between px-3 py-2 h-auto",
            className
          )}
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-6 w-6">
              <AvatarImage src={currentOrganization.avatar} />
              <AvatarFallback className="text-xs">
                {currentOrganization.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium truncate">
                {currentOrganization.name}
              </span>
              <span className="text-xs text-muted-foreground capitalize">
                {currentOrganization.role}
              </span>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-64"
        side="bottom"
        sideOffset={8}
      >
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          Organizations
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => {
              onOrganizationChange(org)
              setIsOpen(false)
            }}
            className="flex items-center gap-3 px-3 py-2 cursor-pointer"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={org.avatar} />
              <AvatarFallback className="text-xs">
                {org.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium truncate">
                {org.name}
              </span>
              <span className="text-xs text-muted-foreground capitalize">
                {org.role}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
            <Plus className="h-3 w-3" />
          </div>
          <span className="text-sm">Create organization</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="flex items-center gap-3 px-3 py-2 cursor-pointer"
          onClick={() => {
            window.location.href = '/protected/organizations'
          }}
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
            <Settings className="h-3 w-3" />
          </div>
          <span className="text-sm">Manage organizations</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
