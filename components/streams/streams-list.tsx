"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FolderOpen, 
  Users, 
  Calendar,
  Plus,
  MoreHorizontal,
  Search,
  Eye,
  User
} from "lucide-react";
import { ClientOnly } from "@/components/ui/client-only";
import { StreamsData } from "@/lib/data/streams";
import { 
  getStatusIcon, 
  getToolIcon, 
  getPriorityColor, 
  formatDate, 
  filterStreams, 
  getEmptyStateMessage 
} from "@/lib/utils/streams";

interface StreamsListProps {
  data: StreamsData;
}

export function StreamsList({ data }: StreamsListProps) {
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

  const hasOtherFilters = searchQuery || statusFilter !== "all" || priorityFilter !== "all";
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
        
        <div className="flex gap-2">
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
      <ClientOnly>
        <Accordion type="multiple" className="space-y-4">
          {filteredStreams.map((stream) => (
            <AccordionItem key={stream.id} value={`stream-${stream.id}`} className="border rounded-lg">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  {/* Stream Header Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">{stream.name}</CardTitle>
                      <Badge variant={stream.status === 'active' ? 'default' : 'secondary'}>
                        {stream.status}
                      </Badge>
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(stream.priority)}`}></div>
                      {stream.stream_members.some(member => member.user_id === data.currentUser.id) && (
                        <Badge variant="outline" className="text-xs">
                          <User className="h-3 w-3 mr-1" />
                          Member
                        </Badge>
                      )}
                      {stream.created_by === data.currentUser.id && (
                        <Badge variant="outline" className="text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          Owner
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Progress and Dates - Always Visible */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(stream.start_date)} - {formatDate(stream.end_date)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{stream.progress}%</div>
                        <div className="text-xs text-muted-foreground">Complete</div>
                      </div>
                      <div className="w-20">
                        <Progress value={stream.progress} className="h-2" />
                      </div>
                    </div>
                    
                    <div className="ml-2 p-1 hover:bg-muted rounded cursor-pointer">
                      <MoreHorizontal className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-6 pt-4">
                  {/* Stream Description */}
                  <div>
                    <p className="text-muted-foreground">{stream.description || "No description available"}</p>
                  </div>
                  
                  {/* Team Members */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Team ({stream.stream_members.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {stream.stream_members.map((member) => (
                        <div key={member.id} className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1">
                          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">
                              {member.users?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                            </span>
                          </div>
                          <span className="text-sm">{member.users?.full_name || 'Unknown User'}</span>
                          <span className="text-xs text-muted-foreground">({member.role})</span>
                          {member.user_id === data.currentUser.id && (
                            <Badge variant="outline" className="text-xs">You</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Work Items */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <FolderOpen className="h-4 w-4" />
                      Work Items ({stream.work_items.length})
                    </h4>
                    <div className="space-y-2">
                      {stream.work_items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                          {getStatusIcon(item.status)}
                          <div className="flex-1">
                            <span className="text-sm font-medium">{item.title}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {item.type}
                              </Badge>
                              {item.tool && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  {getToolIcon(item.tool)}
                                  <span>{item.tool}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Connected Tools */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Connected Tools</h4>
                    <div className="flex flex-wrap gap-2">
                      {stream.stream_tools.map((tool) => (
                        <Badge key={tool.id} variant="secondary" className="text-xs">
                          {getToolIcon(tool.tool_name)}
                          <span className="ml-1">{tool.tool_name}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ClientOnly>

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
