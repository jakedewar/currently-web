import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Activity, Clock, MapPin } from "lucide-react";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  department: string | null;
  currentWork: string;
  lastActive: string;
  location?: string | null;
  timezone?: string | null;
}

interface TeamTableProps {
  users: User[];
}

export function TeamTable({ users }: TeamTableProps) {
  const getDepartmentColor = (department: string | null) => {
    if (!department) return "bg-gray-500";
    
    switch (department.toLowerCase()) {
      case "engineering":
        return "bg-blue-500";
      case "design":
        return "bg-purple-500";
      case "marketing":
        return "bg-green-500";
      case "product":
        return "bg-orange-500";
      case "sales":
        return "bg-red-500";
      case "hr":
        return "bg-pink-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 sm:gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search team members..."
            className="pl-8 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team Member</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Currently Working On</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                <TableCell>
                  <Link href={`/protected/users/${user.id}`} className="block">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar || undefined} alt={user.name} />
                          <AvatarFallback className="text-xs">
                            {user.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-background ${getDepartmentColor(user.department)}`}
                        />
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={`/protected/users/${user.id}`} className="block">
                    <Badge variant="outline" className="text-xs">
                      {user.department || 'Unknown'}
                    </Badge>
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={`/protected/users/${user.id}`} className="block">
                    <div className="max-w-xs">
                      <div className="text-sm font-medium flex items-center gap-2">
                        <Activity className="h-3 w-3" />
                        {user.currentWork}
                      </div>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={`/protected/users/${user.id}`} className="block">
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {user.lastActive}
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={`/protected/users/${user.id}`} className="block">
                    {user.location && (
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {user.location}
                      </div>
                    )}
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {users.map((user) => (
          <Link key={user.id} href={`/protected/users/${user.id}`} className="block">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-start space-x-3">
                <div className="relative flex-shrink-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar || undefined} alt={user.name} />
                    <AvatarFallback className="text-sm">
                      {user.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-background ${getDepartmentColor(user.department)}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm truncate">{user.name}</h3>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {user.department || 'Unknown'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{user.email}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Activity className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs text-muted-foreground truncate">{user.currentWork}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">{user.lastActive}</span>
                    </div>
                    
                    {user.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-muted-foreground truncate">{user.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
