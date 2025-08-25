import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Clock, Activity, Mail, MapPin } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  status: "online" | "away" | "offline" | "busy";
  currentWork: string;
  lastActive: string;
  location?: string;
  timezone?: string;
}

interface UsersTableProps {
  users: User[];
}

export function UsersTable({ users }: UsersTableProps) {
  const getStatusColor = (status: User["status"]) => {
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

  const getStatusText = (status: User["status"]) => {
    switch (status) {
      case "online":
        return "Online";
      case "away":
        return "Away";
      case "busy":
        return "Busy";
      case "offline":
        return "Offline";
      default:
        return "Unknown";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Team Activity</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          See what your teammates are currently working on
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search team members..."
              className="pl-8 text-sm sm:text-base"
            />
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-3 sm:gap-0"
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="relative flex-shrink-0">
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-xs sm:text-sm">
                      {user.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full border-2 border-background ${getStatusColor(user.status)}`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium flex items-center gap-2 text-sm sm:text-base">
                    <span className="truncate">{user.name}</span>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {getStatusText(user.status)}
                    </Badge>
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <Mail className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:space-x-6">
                <div className="text-left sm:text-right max-w-full sm:max-w-xs">
                  <div className="text-xs sm:text-sm font-medium flex items-center gap-2">
                    <Activity className="h-3 w-3 flex-shrink-0" />
                    <span className="hidden sm:inline">Currently working on:</span>
                    <span className="sm:hidden">Working on:</span>
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground truncate mt-1">
                    {user.currentWork}
                  </div>
                </div>
                
                <div className="text-left sm:text-right">
                  <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{user.lastActive}</span>
                  </div>
                  {user.location && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{user.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
