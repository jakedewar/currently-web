"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Building2, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface InvitationDetails {
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

function JoinOrganizationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [invitationCode, setInvitationCode] = useState("")
  const [invitationDetails, setInvitationDetails] = useState<InvitationDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [joining, setJoining] = useState(false)
  const { toast } = useToast()

  const validateInvitation = useCallback(async (code: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/invitations/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invitationCode: code }),
      })

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
        description: "Failed to validate invitation.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Check if there's a code in the URL
  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      setInvitationCode(code)
      validateInvitation(code)
    }
  }, [searchParams, validateInvitation])

  const handleJoinOrganization = async () => {
    if (!invitationCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter an invitation code.",
        variant: "destructive",
      })
      return
    }

    setJoining(true)
    try {
      const response = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invitationCode: invitationCode.trim() }),
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
        description: error instanceof Error ? error.message : "Failed to join organization.",
        variant: "destructive",
      })
    } finally {
      setJoining(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isExpired = (expiresAt: string) => {
    return new Date() > new Date(expiresAt)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Join Organization</CardTitle>
          <CardDescription>
            Enter your invitation code to join an organization
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!invitationDetails ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invitation-code">Invitation Code</Label>
                <Input
                  id="invitation-code"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value)}
                  placeholder="Enter your invitation code"
                  disabled={loading}
                />
              </div>
              
              <Button 
                onClick={() => validateInvitation(invitationCode)} 
                className="w-full"
                disabled={loading || !invitationCode.trim()}
              >
                {loading ? "Validating..." : "Validate Invitation"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Organization Details */}
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-3 mb-3">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">{invitationDetails.organization.name}</h3>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Role:</span>
                    <Badge variant="secondary" className="capitalize">
                      {invitationDetails.role}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Invited Email:</span>
                    <span className="font-medium">{invitationDetails.email}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Expires:</span>
                    <span className={isExpired(invitationDetails.expires_at) ? "text-red-600" : ""}>
                      {formatDate(invitationDetails.expires_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status and Action */}
              {isExpired(invitationDetails.expires_at) ? (
                <div className="flex items-center gap-2 p-3 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950/20">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="text-red-800 dark:text-red-200">This invitation has expired</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 border border-green-200 rounded-lg bg-green-50 dark:bg-green-950/20">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-800 dark:text-green-200">Invitation is valid</span>
                  </div>
                  
                  <Button 
                    onClick={handleJoinOrganization} 
                    className="w-full"
                    disabled={joining}
                  >
                    {joining ? "Joining..." : "Join Organization"}
                  </Button>
                </div>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setInvitationDetails(null)
                  setInvitationCode("")
                }}
                className="w-full"
              >
                Try Different Code
              </Button>
            </div>
          )}
          
          <div className="text-center">
            <Button 
              variant="link" 
              onClick={() => router.push('/auth/login')}
              className="text-sm"
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function JoinOrganizationPage() {
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
      <JoinOrganizationContent />
    </Suspense>
  )
}
