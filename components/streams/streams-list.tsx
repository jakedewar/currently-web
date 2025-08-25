"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FolderOpen, 
  Plus,
  Search,
  ArrowRight,
  Calendar,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ClientOnly } from "@/components/ui/client-only";
import { StreamsData } from "@/lib/data/streams";
import { 
  filterStreams, 
  getEmptyStateMessage,
  getPriorityColor,
  formatDate,
} from "@/lib/utils/streams";
import { useRouter, usePathname } from "next/navigation";

interface StreamsListProps {
  data: StreamsData;
  pathname?: string;
}

export function StreamsList({ data, pathname: customPathname }: StreamsListProps) {
  const router = useRouter();
  const pathname = usePathname();
  console.log('StreamsList data:', {
    streams: data.streams.map(stream => ({
      id: stream.id,
      name: stream.name,
      memberCount: stream.stream_members?.length,
      members: stream.stream_members
    })),
    currentUser: data.currentUser
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed" | "paused">("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [streamFilter, setStreamFilter] = useState<"all" | "my">("all");
  const [sortBy, setSortBy] = useState<"progress" | "name" | "startDate" | "endDate">("progress");

  // Filter streams based on current filters
  const filteredStreams = useMemo(() => {
    return filterStreams(
      data.streams,
      {
        searchQuery,
        statusFilter,
        priorityFilter,
        streamFilter,
        sortBy,
      },
      data.currentUser.id
    );
  }, [data.streams, searchQuery, statusFilter, priorityFilter, streamFilter, sortBy, data.currentUser.id]);

  const hasOtherFilters = Boolean(searchQuery) || statusFilter !== "all" || priorityFilter !== "all";
  const emptyState = getEmptyStateMessage(streamFilter, hasOtherFilters);

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search streams, team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
          <ClientOnly>
            <Select value={streamFilter} onValueChange={(value) => setStreamFilter(value as "all" | "my")}>
              <SelectTrigger className="w-[140px] bg-transparent border-0 shadow-none hover:bg-muted/50">
                <SelectValue placeholder="Streams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Streams</SelectItem>
                <SelectItem value="my">My Streams</SelectItem>
              </SelectContent>
            </Select>
          </ClientOnly>

          <ClientOnly>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | "active" | "completed" | "paused")}>
              <SelectTrigger className="w-[140px] bg-transparent border-0 shadow-none hover:bg-muted/50">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </ClientOnly>

          <ClientOnly>
            <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as "all" | "high" | "medium" | "low")}>
              <SelectTrigger className="w-[140px] bg-transparent border-0 shadow-none hover:bg-muted/50">
                <SelectValue placeholder="Priority" />
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
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as "progress" | "name" | "startDate" | "endDate")}>
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

      {/* Stream Cards */}
      <div className="grid gap-4">
        {filteredStreams.map((stream) => (
          <Card
            key={stream.id}
            className="p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => {
              // Store the current path as the referrer
              sessionStorage.setItem('streamReferrer', customPathname || pathname)
              router.push(`/protected/streams/${stream.id}`)
            }}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{stream.name}</h3>
                  <Badge variant={stream.status === 'active' ? 'default' : 'secondary'}>
                    {stream.status}
                  </Badge>
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(stream.priority)}`} />
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {stream.description || "No description available"}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(stream.start_date)} - {formatDate(stream.end_date)}</span>
              </div>
              <div className="flex items-center gap-3">
                <span>{stream.progress}% Complete</span>
                <div className="w-24">
                  <Progress value={stream.progress} className="h-2" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{stream.stream_members.length} members</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State (when no streams match filters) */}
      {filteredStreams.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {emptyState.title}
            </h3>
            <p className="text-muted-foreground mb-4">
              {emptyState.description}
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Stream
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
