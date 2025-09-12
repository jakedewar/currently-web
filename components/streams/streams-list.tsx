"use client";

import { useState, useMemo, useEffect } from "react";
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
  Calendar,
  Users,
  UserPlus,
  Archive,
  ChevronLeft,
  ChevronRight,
  Link,
  CircleCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ClientOnly } from "@/components/ui/client-only";
import { PriorityIndicator } from "@/components/ui/priority-indicator";
import { StatusBadge } from "@/components/ui/status-badge";
import { StreamsData } from "@/lib/data/streams";
import { ArchivedStreams } from "./archived-streams";
import { 
  filterStreams, 
  getEmptyStateMessage,
  formatDate,
} from "@/lib/utils/streams";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface StreamsListProps {
  data: StreamsData;
  pathname?: string;
}

const STREAMS_PER_PAGE = 6;

export function StreamsList({ data, pathname: customPathname }: StreamsListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [joiningStreams, setJoiningStreams] = useState<Set<string>>(new Set());
  
  console.log('StreamsList data:', {
    streams: data.streams.map(stream => ({
      id: stream.id,
      name: stream.name,
      emoji: stream.emoji,
      memberCount: stream.stream_members?.length,
      members: stream.stream_members
    })),
    currentUser: data.currentUser
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed" | "paused" | "archived">("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [streamFilter, setStreamFilter] = useState<"all" | "my">("all");
  const [sortBy, setSortBy] = useState<"progress" | "name" | "startDate" | "endDate">("progress");
  const [showArchived, setShowArchived] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

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

  // Separate archived streams
  const archivedStreams = data.streams.filter(stream => stream.status === 'archived');
  const activeStreams = filteredStreams.filter(stream => stream.status !== 'archived');

  // Pagination logic
  const totalPages = Math.ceil(activeStreams.length / STREAMS_PER_PAGE);
  const startIndex = (currentPage - 1) * STREAMS_PER_PAGE;
  const endIndex = startIndex + STREAMS_PER_PAGE;
  const paginatedStreams = activeStreams.slice(startIndex, endIndex);

  // Reset to first page when filters change
  const resetPagination = () => {
    setCurrentPage(1);
  };

  // Update pagination when filters change
  useEffect(() => {
    resetPagination();
  }, [searchQuery, statusFilter, priorityFilter, streamFilter, sortBy]);

  const hasOtherFilters = Boolean(searchQuery) || statusFilter !== "all" || priorityFilter !== "all";
  const emptyState = getEmptyStateMessage(streamFilter, hasOtherFilters);

  const handleJoinStream = async (streamId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click
    setJoiningStreams(prev => new Set(prev).add(streamId));
    
    try {
      const response = await fetch(`/api/streams/${streamId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'join',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join stream');
      }

      toast({
        title: "Joined stream",
        description: "You have successfully joined the stream",
      });
      
      // Refresh the page to update the stream list
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to join stream: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setJoiningStreams(prev => {
        const newSet = new Set(prev);
        newSet.delete(streamId);
        return newSet;
      });
    }
  };

  const isUserMemberOfStream = (stream: StreamsData['streams'][0]) => {
    return stream.stream_members.some((member) => member.user_id === data.currentUser.id);
  };

  const isUserOwnerOfStream = (stream: StreamsData['streams'][0]) => {
    return stream.created_by === data.currentUser.id;
  };

  // Helper functions to count resources and tasks
  const getResourceCount = (stream: StreamsData['streams'][0]) => {
    return stream.work_items.filter(item => item.type === 'url').length;
  };

  const getTaskCount = (stream: StreamsData['streams'][0]) => {
    return stream.work_items.filter(item => item.type === 'note').length;
  };

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
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | "active" | "completed" | "paused" | "archived")}>
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
            <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as "all" | "high" | "medium" | "low")}>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedStreams.map((stream) => {
          const isMember = isUserMemberOfStream(stream);
          const isOwner = isUserOwnerOfStream(stream);
          const canJoin = !isMember && !isOwner;
          const isJoining = joiningStreams.has(stream.id);

          return (
            <Card
              key={stream.id}
              className={`hover:shadow-md transition-shadow cursor-pointer mb-3 p-4 h-full flex flex-col ${
                stream.status === 'archived' ? 'opacity-75 bg-muted/30' : ''
              } ${canJoin ? 'border-blue-200 hover:border-blue-300' : ''}`}
              onClick={() => {
                // Store the current path as the referrer
                sessionStorage.setItem('streamReferrer', customPathname || pathname)
                router.push(`/protected/streams/${stream.id}`)
              }}
            >
              <div className="flex flex-col h-full">
                {/* Header with priority, status, and role/join button */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <PriorityIndicator priority={stream.priority} />
                      <span className="text-xs text-muted-foreground capitalize">
                        {stream.priority}
                      </span>
                    </div>
                    {stream.status !== 'active' && (
                      <StatusBadge status={stream.status} variant="compact" />
                    )}
                  </div>
                  
                  {/* Role indicator or Join button */}
                  <div className="flex-shrink-0">
                    {isOwner && (
                      <Badge variant="outline" className="text-xs">
                        Owner
                      </Badge>
                    )}
                    {isMember && !isOwner && (
                      <Badge variant="outline" className="text-xs">
                        Member
                      </Badge>
                    )}
                    {canJoin && (
                      <Button
                        size="sm"
                        onClick={(e) => handleJoinStream(stream.id, e)}
                        disabled={isJoining}
                        className="bg-blue-600 hover:bg-blue-700 text-white h-6 px-2 text-xs"
                      >
                        {isJoining ? (
                          <>
                            <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-white mr-1" />
                            Joining
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-3 w-3 mr-1" />
                            Join
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Title with emoji */}
                <div className="flex items-center gap-2 mb-3">
                  {stream.emoji && (
                    <span className="text-xl">{stream.emoji}</span>
                  )}
                  <h3 className="text-lg font-semibold line-clamp-2 hover:text-primary">
                    {stream.name}
                  </h3>
                </div>
                
                {/* Description - flexible height */}
                <div className="flex-1 mb-3">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {stream.description || "No description available"}
                  </p>
                </div>
                
                {/* Progress - fixed at bottom */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-muted-foreground">Progress</span>
                    <span className="text-xs text-muted-foreground">{stream.progress}%</span>
                  </div>
                  <Progress value={stream.progress} className="h-1.5" />
                </div>
                
                {/* Metadata - fixed at bottom */}
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(stream.start_date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{stream.stream_members.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      <Link className="h-3 w-3" />
                      <span>{getResourceCount(stream)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      <CircleCheck className="h-3 w-3" />
                      <span>{getTaskCount(stream)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, activeStreams.length)} of {activeStreams.length} streams
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Empty State (when no streams match filters) */}
      {activeStreams.length === 0 && (
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

      {/* Archived Streams Section */}
      {archivedStreams.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Archived Streams</h2>
              <Badge variant="secondary">{archivedStreams.length}</Badge>
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
            <ArchivedStreams
              streams={archivedStreams}
              onStreamUpdated={() => window.location.reload()}
            />
          )}
        </div>
      )}
    </div>
  );
}
