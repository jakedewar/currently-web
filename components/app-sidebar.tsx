"use client"

import { Home, Waves, Users, LogOut, Building2, Bug, Megaphone, Menu, Settings } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
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
import { ChromeExtensionPromo } from "@/components/chrome-extension-promo"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/use-user"
import { useOrganizations } from "@/hooks/use-organizations"

export function AppSidebar() {
  const pathname = usePathname()
  const { currentOrganization, setCurrentOrganization } = useOrganization()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Use React Query hooks for data fetching
  const { data: userData, isLoading: userLoading, error: userError } = useUser()
  const { data: orgsData, isLoading: orgsLoading, error: orgsError } = useOrganizations()

  // Handle organization selection
  useEffect(() => {
    if (orgsData?.organizations && orgsData.organizations.length > 0 && !currentOrganization) {
      setCurrentOrganization(orgsData.organizations[0])
    }
  }, [orgsData?.organizations, currentOrganization, setCurrentOrganization])

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
    if (userData?.full_name) {
      return userData.full_name
    }
    return userData?.id || 'User'
  }

  const getCurrentOrganizationName = () => {
    if (currentOrganization?.name) {
      return currentOrganization.name
    }
    return 'No organization selected'
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
        
        {/* Chrome Extension Promotion */}
        <div className="mt-6">
          <ChromeExtensionPromo />
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
        {userLoading ? (
          <div className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
            <div className="flex-1 space-y-1">
              <div className="h-3 bg-muted rounded animate-pulse" />
              <div className="h-2 bg-muted rounded w-2/3 animate-pulse" />
            </div>
          </div>
        ) : userData ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-3 p-2 h-auto">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs">
                    {getUserInitials(userData.full_name || undefined)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">{getUserDisplayName()}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {getCurrentOrganizationName()}
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/protected/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/protected/organizations">
                  <Building2 className="mr-2 h-4 w-4" />
                  <span>Manage Organizations</span>
                </a>
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

  // Show loading state while data is being fetched
  if (userLoading || orgsLoading) {
    return (
      <div className="flex h-screen w-64 flex-col border-r bg-background">
        <div className="flex h-14 items-center border-b px-4">
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex-1 space-y-4 p-4">
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 w-full animate-pulse rounded bg-muted" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Show error state if data fetching failed
  if (userError || orgsError) {
    return (
      <div className="flex h-screen w-64 flex-col border-r bg-background">
        <div className="flex h-14 items-center border-b px-4">
          <span className="text-sm text-muted-foreground">Error loading data</span>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 border-r bg-sidebar sticky top-0 h-screen overflow-y-auto flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Navigation menu for the application
          </SheetDescription>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}
