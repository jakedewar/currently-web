import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  MapPin, 
  CheckCircle, 
  Circle, 
  MessageSquare, 
  Video,
  ArrowLeft,
  Mail,
  Waves
} from "lucide-react";
import Link from "next/link";

// Mock data - in a real app, this would come from your database
const getUserData = (id: string) => {
  const users = {
    "1": {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      avatar: "/avatars/john.jpg",
      status: "online" as const,
      currentWork: "Designing the new user onboarding flow in Figma",
      lastActive: "2 minutes ago",
      location: "San Francisco, CA",
      timezone: "PST",
      role: "Senior Product Designer",
      department: "Product",
      joinDate: "March 2023",
      streams: [
        {
          id: 1,
          title: "User Onboarding Redesign",
          status: "active",
          progress: 75,
          lastUpdated: "2 hours ago",
          description: "Redesigning the user onboarding experience to improve conversion rates"
        },
        {
          id: 2,
          title: "Design System Updates",
          status: "active",
          progress: 45,
          lastUpdated: "1 day ago",
          description: "Updating the design system with new components and guidelines"
        }
      ],
      tasks: [
        {
          id: 1,
          title: "Create wireframes for onboarding flow",
          status: "completed",
          priority: "high",
          dueDate: "2024-01-15"
        },
        {
          id: 2,
          title: "Review user feedback from beta testing",
          status: "in-progress",
          priority: "medium",
          dueDate: "2024-01-20"
        },
        {
          id: 3,
          title: "Update design documentation",
          status: "pending",
          priority: "low",
          dueDate: "2024-01-25"
        }
      ],
      recentActivity: [
        {
          id: 1,
          type: "stream_update",
          message: "Updated User Onboarding Redesign stream",
          timestamp: "2 hours ago"
        },
        {
          id: 2,
          type: "task_completed",
          message: "Completed wireframes for onboarding flow",
          timestamp: "1 day ago"
        },
        {
          id: 3,
          type: "comment",
          message: "Left feedback on design system PR",
          timestamp: "2 days ago"
        }
      ]
    },
    "2": {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      avatar: "/avatars/jane.jpg",
      status: "busy" as const,
      currentWork: "Code review for the authentication system PR",
      lastActive: "5 minutes ago",
      location: "New York, NY",
      timezone: "EST",
      role: "Senior Software Engineer",
      department: "Engineering",
      joinDate: "January 2023",
      streams: [
        {
          id: 1,
          title: "Authentication System Overhaul",
          status: "active",
          progress: 90,
          lastUpdated: "30 minutes ago",
          description: "Implementing new authentication system with enhanced security"
        }
      ],
      tasks: [
        {
          id: 1,
          title: "Review authentication PR",
          status: "in-progress",
          priority: "high",
          dueDate: "2024-01-16"
        },
        {
          id: 2,
          title: "Write unit tests for new auth endpoints",
          status: "pending",
          priority: "high",
          dueDate: "2024-01-18"
        }
      ],
      recentActivity: [
        {
          id: 1,
          type: "stream_update",
          message: "Updated Authentication System Overhaul stream",
          timestamp: "30 minutes ago"
        },
        {
          id: 2,
          type: "task_started",
          message: "Started reviewing authentication PR",
          timestamp: "1 hour ago"
        }
      ]
    },
    "3": {
      id: 3,
      name: "Bob Johnson",
      email: "bob.johnson@example.com",
      avatar: "/avatars/bob.jpg",
      status: "away" as const,
      currentWork: "Writing documentation for the API endpoints",
      lastActive: "15 minutes ago",
      location: "Austin, TX",
      timezone: "CST",
      role: "Technical Writer",
      department: "Documentation",
      joinDate: "June 2023",
      streams: [
        {
          id: 1,
          title: "API Documentation Overhaul",
          status: "active",
          progress: 60,
          lastUpdated: "1 hour ago",
          description: "Comprehensive update of all API documentation"
        }
      ],
      tasks: [
        {
          id: 1,
          title: "Write authentication API docs",
          status: "in-progress",
          priority: "high",
          dueDate: "2024-01-17"
        },
        {
          id: 2,
          title: "Review existing documentation",
          status: "pending",
          priority: "medium",
          dueDate: "2024-01-22"
        }
      ],
      recentActivity: [
        {
          id: 1,
          type: "stream_update",
          message: "Updated API Documentation Overhaul stream",
          timestamp: "1 hour ago"
        },
        {
          id: 2,
          type: "task_started",
          message: "Started writing authentication API docs",
          timestamp: "2 hours ago"
        }
      ]
    },
    "4": {
      id: 4,
      name: "Alice Brown",
      email: "alice.brown@example.com",
      avatar: "/avatars/alice.jpg",
      status: "online" as const,
      currentWork: "Planning the Q2 roadmap in Notion",
      lastActive: "1 minute ago",
      location: "Seattle, WA",
      timezone: "PST",
      role: "Product Manager",
      department: "Product",
      joinDate: "September 2022",
      streams: [
        {
          id: 1,
          title: "Q2 Product Roadmap",
          status: "active",
          progress: 85,
          lastUpdated: "30 minutes ago",
          description: "Planning and prioritizing Q2 product initiatives"
        }
      ],
      tasks: [
        {
          id: 1,
          title: "Finalize Q2 roadmap",
          status: "in-progress",
          priority: "high",
          dueDate: "2024-01-19"
        },
        {
          id: 2,
          title: "Stakeholder review meeting",
          status: "pending",
          priority: "high",
          dueDate: "2024-01-23"
        }
      ],
      recentActivity: [
        {
          id: 1,
          type: "stream_update",
          message: "Updated Q2 Product Roadmap stream",
          timestamp: "30 minutes ago"
        },
        {
          id: 2,
          type: "task_started",
          message: "Started finalizing Q2 roadmap",
          timestamp: "1 hour ago"
        }
      ]
    },
    "5": {
      id: 5,
      name: "Charlie Wilson",
      email: "charlie.wilson@example.com",
      avatar: "/avatars/charlie.jpg",
      status: "offline" as const,
      currentWork: "Debugging the mobile app performance issues",
      lastActive: "2 hours ago",
      location: "Remote",
      timezone: "GMT",
      role: "Mobile Developer",
      department: "Engineering",
      joinDate: "November 2023",
      streams: [
        {
          id: 1,
          title: "Mobile App Performance",
          status: "active",
          progress: 40,
          lastUpdated: "3 hours ago",
          description: "Optimizing mobile app performance and fixing bugs"
        }
      ],
      tasks: [
        {
          id: 1,
          title: "Fix memory leak in iOS app",
          status: "in-progress",
          priority: "high",
          dueDate: "2024-01-16"
        },
        {
          id: 2,
          title: "Optimize image loading",
          status: "pending",
          priority: "medium",
          dueDate: "2024-01-24"
        }
      ],
      recentActivity: [
        {
          id: 1,
          type: "stream_update",
          message: "Updated Mobile App Performance stream",
          timestamp: "3 hours ago"
        },
        {
          id: 2,
          type: "task_started",
          message: "Started debugging memory leak",
          timestamp: "4 hours ago"
        }
      ]
    },
    "6": {
      id: 6,
      name: "Diana Garcia",
      email: "diana.garcia@example.com",
      avatar: "/avatars/diana.jpg",
      status: "online" as const,
      currentWork: "Customer feedback analysis in Google Sheets",
      lastActive: "Just now",
      location: "Miami, FL",
      timezone: "EST",
      role: "Customer Success Manager",
      department: "Customer Success",
      joinDate: "February 2023",
      streams: [
        {
          id: 1,
          title: "Customer Feedback Analysis",
          status: "active",
          progress: 70,
          lastUpdated: "15 minutes ago",
          description: "Analyzing customer feedback to improve product features"
        }
      ],
      tasks: [
        {
          id: 1,
          title: "Compile Q4 feedback report",
          status: "in-progress",
          priority: "high",
          dueDate: "2024-01-18"
        },
        {
          id: 2,
          title: "Schedule customer interviews",
          status: "pending",
          priority: "medium",
          dueDate: "2024-01-26"
        }
      ],
      recentActivity: [
        {
          id: 1,
          type: "stream_update",
          message: "Updated Customer Feedback Analysis stream",
          timestamp: "15 minutes ago"
        },
        {
          id: 2,
          type: "task_started",
          message: "Started compiling Q4 feedback report",
          timestamp: "1 hour ago"
        }
      ]
    }
  };
  
  return users[id as keyof typeof users] || users["1"];
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "online":
      return "bg-green-500";
    case "away":
      return "bg-yellow-500";
    case "busy":
      return "bg-red-500";
    case "offline":
      return "bg-gray-400";
    default:
      return "bg-gray-400";
  }
};



const getTaskStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "in-progress":
      return <Circle className="h-4 w-4 text-blue-500" />;
    case "pending":
      return <Circle className="h-4 w-4 text-gray-400" />;
    default:
      return <Circle className="h-4 w-4 text-gray-400" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "low":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default async function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = getUserData(id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/protected/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Team
          </Button>
        </Link>
      </div>

      {/* User Info */}
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-lg">
                  {user.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div
                className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background ${getStatusColor(user.status)}`}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
              <p className="text-muted-foreground mt-1">{user.role} • {user.department}</p>
              <div className="flex items-center gap-4 mt-3">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </span>
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {user.location}
                </span>
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {user.timezone}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button variant="outline" size="sm">
              <Video className="h-4 w-4 mr-2" />
              Call
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Waves className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground">Currently:</span>
          <span className="text-sm font-medium">{user.currentWork}</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="streams" className="space-y-4">
        <TabsList>
          <TabsTrigger value="streams">Streams</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="streams" className="space-y-4">
          <div className="grid gap-4">
            {user.streams.map((stream) => (
              <Card key={stream.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{stream.title}</CardTitle>
                      <CardDescription>{stream.description}</CardDescription>
                    </div>
                    <Badge variant={stream.status === "active" ? "default" : "secondary"}>
                      {stream.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{stream.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${stream.progress}%` }}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Last updated: {stream.lastUpdated}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="grid gap-4">
            {user.tasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTaskStatusIcon(task.status)}
                      <div>
                        <h3 className="font-medium">{task.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="space-y-4">
            {user.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-4 border rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
