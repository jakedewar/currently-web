"use client"

import { Home, Waves, Users, Settings, LogOut, Building2, Plus } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { type Organization } from "@/components/organization-selector"
import { useOrganization } from "@/components/organization-provider"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

// Mock data - in a real app, this would come from your API/database
const mockOrganizations: Organization[] = [
  {
    id: "1",
    name: "Acme Corp",
    slug: "acme-corp",
    avatar: undefined,
    role: "owner",
  },
  {
    id: "2", 
    name: "Startup Inc",
    slug: "startup-inc",
    avatar: undefined,
    role: "admin",
  },
  {
    id: "3",
    name: "Freelance Projects",
    slug: "freelance-projects", 
    avatar: undefined,
    role: "member",
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { currentOrganization, organizations, setCurrentOrganization } = useOrganization()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize with mock data if no organizations exist
  const displayOrganizations = organizations.length > 0 ? organizations : mockOrganizations
  const displayCurrentOrganization = currentOrganization || mockOrganizations[0]

  const navItems = [
    {
      href: "/protected",
      icon: Home,
      label: "Dashboard",
    },
    {
      href: "/protected/analytics",
      icon: Waves,
      label: "Streams",
    },
    {
      href: "/protected/users",
      icon: Users,
      label: "Team",
    },
  ]



  // Fetch user data on component mount
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    fetchUser()
  }, [])

  const handleOrganizationChange = (org: Organization) => {
    setCurrentOrganization(org)
    // In a real app, you would:
    // 1. Update the URL to include the organization slug
    // 2. Update any global state/context
    // 3. Refetch data for the new organization
    // 4. Update any organization-specific settings
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const getUserInitials = (email: string | undefined) => {
    if (!email) return 'U'
    return email.split('@')[0].substring(0, 2).toUpperCase()
  }

  return (
    <aside className="w-64 border-r bg-sidebar sticky top-0 h-screen overflow-y-auto flex flex-col">
      <div className="flex h-16 items-center border-b px-4">
        <div className="flex items-center gap-2">
          <Waves className="w-5 h-5 text-primary" />
          <div className="font-semibold">Currently</div>
        </div>
      </div>
      
      <nav className="p-4 flex-1">
        <div className="space-y-2">
          {navItems.map((item) => {
            // Check if the current path matches the nav item or is a sub-route
            const isActive = pathname === item.href || 
              (item.href === "/protected/users" && pathname.startsWith("/protected/users/"))
            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-primary/10 text-primary"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </a>
            )
          })}
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="border-t p-4">
        {loading ? (
          <div className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
            <div className="flex-1 space-y-1">
              <div className="h-3 bg-muted rounded animate-pulse" />
              <div className="h-2 bg-muted rounded w-2/3 animate-pulse" />
            </div>
          </div>
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-2 h-auto">
                <div className="flex items-center gap-3 w-full">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {getUserInitials(user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium truncate">
                      {user.email}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {displayCurrentOrganization.name}
                    </div>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.email}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {displayCurrentOrganization.name}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Organization Management */}
              <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                Organizations
              </DropdownMenuLabel>
              {displayOrganizations.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => handleOrganizationChange(org)}
                  className="flex items-center gap-3 px-3 py-2 cursor-pointer"
                >
                  <Avatar className="h-6 w-6">
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
              <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                  <Building2 className="h-3 w-3" />
                </div>
                <span className="text-sm">Manage organizations</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/protected/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="space-y-2">
            <Button asChild variant="outline" className="w-full" size="sm">
              <a href="/auth/login">Sign in</a>
            </Button>
            <Button asChild className="w-full" size="sm">
              <a href="/auth/sign-up">Sign up</a>
            </Button>
          </div>
        )}
      </div>
    </aside>
  )
}
