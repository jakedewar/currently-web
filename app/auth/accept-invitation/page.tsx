"use client"

import { useState, useEffect, Suspense, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, XCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/hooks/use-user"

interface InvitationDetails {
  id: string
  organization: {
    id: string
    name: string
    slug: string
  }
  email: string
  role: string
  expires_at: string
  status: string
}

function AcceptInvitationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [invitationDetails, setInvitationDetails] = useState<InvitationDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const { toast } = useToast()
  
  // Check authentication status
  const { data: user, isLoading: userLoading, error: userError } = useUser()
  const isAuthenticated = !!user && !userError

  const loadInvitation = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/invitations/${id}`)
      const data = await response.json()

      if (response.ok) {
        setInvitationDetails(data.invitation)
      } else {
        toast({
          title: "Invalid Invitation",
          description: data.error || "This invitation is invalid or has expired.",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load invitation.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Load invitation details
  useEffect(() => {
    const invitationId = searchParams.get('invitation')
    if (invitationId) {
      loadInvitation(invitationId)
    } else {
      setLoading(false)
      toast({
        title: "Invalid Link",
        description: "No invitation found in this link.",
        variant: "destructive",
      })
    }
  }, [searchParams, toast, loadInvitation])

  const handleAcceptInvitation = async () => {
    if (!invitationDetails) return

    setAccepting(true)
    try {
      const response = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invitationId: invitationDetails.id }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success!",
          description: `You've successfully joined ${data.organization.name}!`,
        })
        // Redirect to the dashboard
        router.push('/protected')
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to accept invitation.",
        variant: "destructive",
      })
    } finally {
      setAccepting(false)
    }
  }

  const isExpired = (expiresAt: string) => {
    return new Date() > new Date(expiresAt)
  }

  // Show loading state
  if (userLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
              <span>Loading invitation...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    router.push('/auth/login')
    return null
  }

  // Show error if no invitation details
  if (!invitationDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/protected')} 
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Accept Invitation</CardTitle>
          <CardDescription>
            You&apos;ve been invited to join an organization
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {isExpired(invitationDetails.expires_at) ? (
            // Expired invitation
            <div className="flex items-center gap-2 p-3 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950/20">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800 dark:text-red-200">This invitation has expired</span>
            </div>
          ) : (
            // Valid invitation
            <div className="space-y-4">
              {/* Organization Details */}
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-3 mb-3">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">{invitationDetails.organization.name}</h3>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Your Role:</span>
                    <Badge variant="secondary" className="capitalize">
                      {invitationDetails.role}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Your Email:</span>
                    <span className="font-medium">{user?.email}</span>
                  </div>
                </div>
              </div>

              {/* Accept Button */}
              <Button 
                onClick={handleAcceptInvitation} 
                className="w-full"
                disabled={accepting}
              >
                {accepting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  "Accept Invitation"
                )}
              </Button>
            </div>
          )}
          
          <div className="text-center">
            <Button 
              variant="link" 
              onClick={() => router.push('/protected')}
              className="text-sm"
              disabled={accepting}
            >
              Skip for now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <AcceptInvitationContent />
    </Suspense>
  )
}
