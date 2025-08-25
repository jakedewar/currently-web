"use client"

import { Home, Waves, Users, Settings, LogOut, Building2, Plus, Bug, Megaphone, Menu } from "lucide-react"
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
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"

import { useRouter } from "next/navigation"
interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  department: string | null;
  location: string | null;
  timezone: string | null;
}

export function AppSidebar() {
  const pathname = usePathname()
  const { currentOrganization, setCurrentOrganization } = useOrganization()
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [userOrganizations, setUserOrganizations] = useState<Organization[]>([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Fetch user data and organizations on component mount
  useEffect(() => {
    const fetchUserAndOrganizations = async () => {
      try {
        // Get current user profile
        const profileResponse = await fetch('/api/users/me');
        const profileData = await profileResponse.json();

        if (!profileResponse.ok) {
          throw new Error(profileData.error || 'Failed to fetch user profile');
        }

        setUser(profileData);
        setUserProfile(profileData);

        // Get user's organizations
        const orgsResponse = await fetch('/api/users/me/organizations');
        const orgsData = await orgsResponse.json();

        if (!orgsResponse.ok) {
          throw new Error(orgsData.error || 'Failed to fetch organizations');
        }

        const orgs: Organization[] = orgsData.organizations.map((org: { id: string; name: string; slug: string; avatar_url?: string; role: "owner" | "admin" | "member" }) => ({
          id: org.id,
          name: org.name,
          slug: org.slug,
          avatar: org.avatar_url || undefined,
          role: org.role as "owner" | "admin" | "member",
        }));

        setUserOrganizations(orgs);

        // Set the first organization as current if none is set
        if (orgs.length > 0 && !currentOrganization) {
          setCurrentOrganization(orgs[0]);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndOrganizations();
  }, [currentOrganization, setCurrentOrganization])

  // Use real organizations or show empty state
  const displayOrganizations = userOrganizations
  const displayCurrentOrganization = currentOrganization || userOrganizations[0]

  const navItems = [
    {
      href: "/protected",
      icon: Home,
      label: "Dashboard",
    },
    {
      href: "/protected/streams",
      icon: Waves,
      label: "Streams",
    },
    {
      href: "/protected/users",
      icon: Users,
      label: "Team",
    },
  ]

  const footerNavItems = [
    {
      href: "/protected/report-bug",
      icon: Bug,
      label: "Report Bug",
    },
    {
      href: "/protected/feedback",
      icon: Megaphone,
      label: "Share Feedback",
    },
  ]

  const handleOrganizationChange = (org: Organization) => {
    setCurrentOrganization(org)
    // In a real app, you would:
    // 1. Update the URL to include the organization slug
    // 2. Update any global state/context
    // 3. Refetch data for the new organization
    // 4. Update any organization-specific settings
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/auth/signout', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to sign out');
      }
      router.push("/auth/login");
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  const getUserInitials = (name: string | undefined) => {
    if (!name) return 'U'
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().substring(0, 2)
  }

  const getUserDisplayName = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name
    }
    return user?.email || user?.id || 'User'
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
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
              (item.href === "/protected/users" && pathname.startsWith("/protected/users/")) ||
              (item.href === "/protected/streams" && pathname.startsWith("/protected/streams/"))
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
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

      {/* Footer Navigation Items */}
      <div className="p-4">
        <div className="space-y-1">
          {footerNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-primary/10 text-primary"
                )}
              >
                <item.icon className="w-3 h-3" />
                {item.label}
              </a>
            )
          })}
        </div>
      </div>

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
                      {getUserInitials(getUserDisplayName())}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium truncate">
                      {getUserDisplayName()}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {displayCurrentOrganization?.name || 'No organization'}
                    </div>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {displayCurrentOrganization?.name || 'No organization'}
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
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 border-r bg-sidebar sticky top-0 h-screen overflow-y-auto flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden fixed top-4 left-4 z-50 h-10 w-10 p-0"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SheetDescription className="sr-only">Main navigation menu for the application</SheetDescription>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}
