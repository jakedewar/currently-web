"use client"

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
  MessageSquare,
  FileText,
  CheckCircle,
  Circle,
  AlertCircle,
  Search,
  Eye,
  User,
  Figma
} from "lucide-react";
import { ClientOnly } from "@/components/ui/client-only";

export default function StreamsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed" | "paused">("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [streamFilter, setStreamFilter] = useState<"all" | "my">("all");
  const [sortBy, setSortBy] = useState<"progress" | "name" | "startDate" | "endDate">("progress");

  // Mock current user - in real app, this would come from auth context
  const currentUser = {
    id: "user-1",
    name: "Sarah Chen",
    avatar: "SC",
    role: "Design Lead"
  };

  // Mock data for active streams
  const allStreams = useMemo(() => [
    {
      id: 1,
      name: "Mobile App Redesign",
      description: "Complete redesign of the mobile application with new UI/UX",
      progress: 75,
      startDate: "2024-01-15",
      endDate: "2024-02-15",
      status: "active",
      teamMembers: [
        { id: "user-1", name: "Sarah Chen", avatar: "SC", role: "Design Lead" },
        { id: "user-2", name: "Mike Rodriguez", avatar: "MR", role: "Frontend Dev" },
        { id: "user-3", name: "Alex Johnson", avatar: "AJ", role: "Backend Dev" },
        { id: "user-4", name: "Emma Wilson", avatar: "EW", role: "Product Manager" },
      ],
      workItems: [
        { id: 1, title: "Design System Updates", type: "design", status: "completed", tool: "Figma" },
        { id: 2, title: "Navigation Component", type: "development", status: "in-progress", tool: "GitHub" },
        { id: 3, title: "User Testing Plan", type: "research", status: "todo", tool: "Notion" },
        { id: 4, title: "API Integration", type: "development", status: "in-progress", tool: "Linear" },
        { id: 5, title: "Performance Optimization", type: "development", status: "todo", tool: "GitHub" },
      ],
      tools: ["Figma", "GitHub", "Notion", "Linear", "Slack"],
      priority: "high",
      createdBy: "user-1",
    },
    {
      id: 2,
      name: "Q4 Marketing Campaign",
      description: "Launch comprehensive marketing campaign for Q4 product release",
      progress: 45,
      startDate: "2024-01-20",
      endDate: "2024-03-01",
      status: "active",
      teamMembers: [
        { id: "user-5", name: "David Kim", avatar: "DK", role: "Marketing Lead" },
        { id: "user-6", name: "Lisa Park", avatar: "LP", role: "Content Creator" },
        { id: "user-7", name: "Tom Anderson", avatar: "TA", role: "Designer" },
      ],
      workItems: [
        { id: 1, title: "Campaign Strategy", type: "strategy", status: "completed", tool: "Notion" },
        { id: 2, title: "Social Media Assets", type: "design", status: "in-progress", tool: "Figma" },
        { id: 3, title: "Email Templates", type: "content", status: "in-progress", tool: "Google Docs" },
        { id: 4, title: "Analytics Setup", type: "technical", status: "todo", tool: "Google Analytics" },
      ],
      tools: ["Notion", "Figma", "Google Docs", "Google Analytics", "Slack"],
      priority: "medium",
      createdBy: "user-5",
    },
    {
      id: 3,
      name: "Customer Support Platform",
      description: "Build internal customer support platform with ticket management",
      progress: 90,
      startDate: "2024-01-10",
      endDate: "2024-01-30",
      status: "active",
      teamMembers: [
        { id: "user-8", name: "Rachel Green", avatar: "RG", role: "Product Manager" },
        { id: "user-9", name: "Chris Lee", avatar: "CL", role: "Full Stack Dev" },
        { id: "user-10", name: "Maria Garcia", avatar: "MG", role: "UX Designer" },
      ],
      workItems: [
        { id: 1, title: "Database Schema", type: "development", status: "completed", tool: "GitHub" },
        { id: 2, title: "UI Components", type: "development", status: "completed", tool: "GitHub" },
        { id: 3, title: "API Endpoints", type: "development", status: "completed", tool: "GitHub" },
        { id: 4, title: "User Testing", type: "testing", status: "in-progress", tool: "Notion" },
        { id: 5, title: "Documentation", type: "documentation", status: "todo", tool: "Notion" },
      ],
      tools: ["GitHub", "Notion", "Slack", "Linear"],
      priority: "high",
      createdBy: "user-8",
    },
    {
      id: 4,
      name: "Website Redesign",
      description: "Complete overhaul of the company website with modern design",
      progress: 100,
      startDate: "2023-12-01",
      endDate: "2024-01-15",
      status: "completed",
      teamMembers: [
        { id: "user-1", name: "Sarah Chen", avatar: "SC", role: "Design Lead" },
        { id: "user-2", name: "Mike Rodriguez", avatar: "MR", role: "Frontend Dev" },
        { id: "user-11", name: "John Smith", avatar: "JS", role: "Backend Dev" },
      ],
      workItems: [
        { id: 1, title: "Design Mockups", type: "design", status: "completed", tool: "Figma" },
        { id: 2, title: "Frontend Implementation", type: "development", status: "completed", tool: "GitHub" },
        { id: 3, title: "Content Migration", type: "content", status: "completed", tool: "WordPress" },
        { id: 4, title: "SEO Optimization", type: "marketing", status: "completed", tool: "Google Analytics" },
      ],
      tools: ["Figma", "GitHub", "WordPress", "Google Analytics"],
      priority: "medium",
      createdBy: "user-1",
    },
    {
      id: 5,
      name: "Data Analytics Dashboard",
      description: "Build comprehensive analytics dashboard for business metrics",
      progress: 25,
      startDate: "2024-02-01",
      endDate: "2024-04-01",
      status: "active",
      teamMembers: [
        { id: "user-12", name: "Anna Davis", avatar: "AD", role: "Data Scientist" },
        { id: "user-13", name: "Carlos Mendez", avatar: "CM", role: "Backend Dev" },
        { id: "user-1", name: "Sarah Chen", avatar: "SC", role: "Design Lead" },
      ],
      workItems: [
        { id: 1, title: "Data Pipeline Setup", type: "development", status: "in-progress", tool: "GitHub" },
        { id: 2, title: "Dashboard Design", type: "design", status: "todo", tool: "Figma" },
        { id: 3, title: "API Development", type: "development", status: "todo", tool: "GitHub" },
        { id: 4, title: "Data Visualization", type: "development", status: "todo", tool: "Tableau" },
      ],
      tools: ["GitHub", "Figma", "Tableau", "Python"],
      priority: "low",
      createdBy: "user-12",
    },
  ], []);

  // Filter streams based on current tab and filters
  const filteredStreams = useMemo(() => {
    let filtered = allStreams;

    // Filter by stream type (My Streams vs All Streams)
    if (streamFilter === "my") {
      filtered = filtered.filter(stream => 
        stream.teamMembers.some(member => member.id === currentUser.id) ||
        stream.createdBy === currentUser.id
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(stream =>
        stream.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stream.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stream.teamMembers.some(member => 
          member.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(stream => stream.status === statusFilter);
    }

    // Filter by priority
    if (priorityFilter !== "all") {
      filtered = filtered.filter(stream => stream.priority === priorityFilter);
    }

    // Sort streams
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "progress":
          return b.progress - a.progress;
        case "name":
          return a.name.localeCompare(b.name);
        case "startDate":
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        case "endDate":
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [allStreams, streamFilter, searchQuery, statusFilter, priorityFilter, sortBy, currentUser.id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-3 w-3 text-green-500" />;
      case "in-progress": return <Circle className="h-3 w-3 text-blue-500" />;
      case "todo": return <Circle className="h-3 w-3 text-gray-400" />;
      default: return <AlertCircle className="h-3 w-3 text-yellow-500" />;
    }
  };

  const getToolIcon = (tool: string) => {
    switch (tool.toLowerCase()) {
      case "figma": return <Figma className="h-3 w-3" />;
      case "github": return <FileText className="h-3 w-3" />;
      case "notion": return <FileText className="h-3 w-3" />;
      case "linear": return <Calendar className="h-3 w-3" />;
      case "slack": return <MessageSquare className="h-3 w-3" />;
      case "google docs": return <FileText className="h-3 w-3" />;
      case "google analytics": return <FileText className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };



  const getEmptyStateMessage = () => {
    const hasOtherFilters = searchQuery || statusFilter !== "all" || priorityFilter !== "all";
    if (hasOtherFilters) {
      return {
        title: "No streams match your filters",
        description: "Try adjusting your search or filters"
      };
    }
    
    switch (streamFilter) {
      case "my":
        return {
          title: "You're not part of any streams yet",
          description: "Join existing streams or create your own to get started"
        };
      default:
        return {
          title: "No streams found",
          description: "Create your first stream to start organizing your team's work"
        };
    }
  };

  const emptyState = getEmptyStateMessage();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Streams</h1>
          <p className="text-muted-foreground">
            Manage your organization&apos;s work streams and track progress
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Stream
        </Button>
      </div>



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
                    {stream.teamMembers.some(member => member.id === currentUser.id) && (
                      <Badge variant="outline" className="text-xs">
                        <User className="h-3 w-3 mr-1" />
                        Member
                      </Badge>
                    )}
                    {stream.createdBy === currentUser.id && (
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
                      <span>{formatDate(stream.startDate)} - {formatDate(stream.endDate)}</span>
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
                  <p className="text-muted-foreground">{stream.description}</p>
                </div>
                
                {/* Team Members */}
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Team ({stream.teamMembers.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {stream.teamMembers.map((member, index) => (
                      <div key={index} className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">{member.avatar}</span>
                        </div>
                        <span className="text-sm">{member.name}</span>
                        <span className="text-xs text-muted-foreground">({member.role})</span>
                        {member.id === currentUser.id && (
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
                    Work Items ({stream.workItems.length})
                  </h4>
                  <div className="space-y-2">
                    {stream.workItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                        {getStatusIcon(item.status)}
                        <div className="flex-1">
                          <span className="text-sm font-medium">{item.title}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {item.type}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              {getToolIcon(item.tool)}
                              <span>{item.tool}</span>
                            </div>
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
                    {stream.tools.map((tool) => (
                      <Badge key={tool} variant="secondary" className="text-xs">
                        {getToolIcon(tool)}
                        <span className="ml-1">{tool}</span>
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

