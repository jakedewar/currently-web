"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { ClientOnly } from "@/components/ui/client-only";
import { PriorityIndicator } from "@/components/ui/priority-indicator";

interface ProjectFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  projectFilter: "all" | "my";
  onProjectFilterChange: (value: "all" | "my") => void;
  statusFilter: "all" | "active" | "completed" | "paused" | "archived";
  onStatusFilterChange: (value: "all" | "active" | "completed" | "paused" | "archived") => void;
  priorityFilter: "all" | "high" | "medium" | "low";
  onPriorityFilterChange: (value: "all" | "high" | "medium" | "low") => void;
  sortBy: "progress" | "name" | "startDate" | "endDate";
  onSortByChange: (value: "progress" | "name" | "startDate" | "endDate") => void;
}

export function ProjectFilters({
  searchQuery,
  onSearchChange,
  projectFilter,
  onProjectFilterChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  sortBy,
  onSortByChange,
}: ProjectFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects, team members..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="flex flex-wrap gap-2 sm:flex-nowrap">
        <ClientOnly>
          <Select value={projectFilter} onValueChange={onProjectFilterChange}>
            <SelectTrigger className="w-[140px] bg-transparent border-0 shadow-none hover:bg-muted/50">
              <SelectValue placeholder="Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="my">My Projects</SelectItem>
            </SelectContent>
          </Select>
        </ClientOnly>

        <ClientOnly>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-[140px] bg-transparent border-0 shadow-none hover:bg-muted/50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </ClientOnly>

        <ClientOnly>
          <Select value={priorityFilter} onValueChange={onPriorityFilterChange}>
            <SelectTrigger className="w-[140px] bg-transparent border-0 shadow-none hover:bg-muted/50">
              <SelectValue placeholder="Priority">
                {priorityFilter === "all" ? (
                  "All Priority"
                ) : (
                  <div className="flex items-center gap-2">
                    <PriorityIndicator priority={priorityFilter} />
                    {priorityFilter.charAt(0).toUpperCase() + priorityFilter.slice(1)}
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </ClientOnly>

        <ClientOnly>
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="w-[140px] bg-transparent border-0 shadow-none hover:bg-muted/50">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="progress">Progress</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="startDate">Start Date</SelectItem>
              <SelectItem value="endDate">End Date</SelectItem>
            </SelectContent>
          </Select>
        </ClientOnly>
      </div>
    </div>
  );
}
