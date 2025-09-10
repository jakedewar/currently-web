"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Building2, XCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/hooks/use-user"
import { createClient } from "@/lib/supabase/client"

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
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const { toast } = useToast()
  
  // Check authentication status
  const { data: user, isLoading: userLoading, error: userError } = useUser()
  const isAuthenticated = !!user && !userError

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
        setEmail(data.invitation.email) // Pre-fill email from invitation
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

  const handleSignUp = async () => {
    if (!email || !password || !fullName) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      })
      return
    }

    setJoining(true)
    try {
      const supabase = createClient()
      
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // User created successfully, now join the organization
        await joinOrganization()
      } else {
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link. Please check your email and click the link to complete your account setup.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create account.",
        variant: "destructive",
      })
    } finally {
      setJoining(false)
    }
  }

  const handleSignIn = async () => {
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter your email and password.",
        variant: "destructive",
      })
      return
    }

    setJoining(true)
    try {
      const supabase = createClient()
      
      // Sign in the user
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      if (authData.user) {
        // User signed in successfully, now join the organization
        await joinOrganization()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to sign in.",
        variant: "destructive",
      })
    } finally {
      setJoining(false)
    }
  }

  const joinOrganization = async () => {
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
    }
  }


  const isExpired = (expiresAt: string) => {
    return new Date() > new Date(expiresAt)
  }

  // Show loading state while checking authentication
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3">Checking authentication...</span>
            </div>
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
          <CardTitle className="text-2xl">Join Organization</CardTitle>
          <CardDescription>
            {invitationDetails 
              ? `You've been invited to join ${invitationDetails.organization.name}`
              : "Enter your invitation code to join an organization"
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!invitationDetails ? (
            // Step 1: Enter invitation code
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
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          ) : isExpired(invitationDetails.expires_at) ? (
            // Expired invitation
            <div className="flex items-center gap-2 p-3 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950/20">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800 dark:text-red-200">This invitation has expired</span>
            </div>
          ) : isAuthenticated ? (
            // Step 3: User is authenticated, join organization
            <div className="space-y-4">
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
                    <span className="text-muted-foreground">Your Email:</span>
                    <span className="font-medium">{user?.email}</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={joinOrganization} 
                className="w-full"
                disabled={joining}
              >
                {joining ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  "Join Organization"
                )}
              </Button>
            </div>
          ) : (
            // Step 2: Authentication form
            <div className="space-y-4">
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
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={joining}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={joining}
                  />
                </div>

                {isSigningUp && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      disabled={joining}
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={isSigningUp ? handleSignUp : handleSignIn} 
                    className="flex-1"
                    disabled={joining || !email || !password || (isSigningUp && !fullName)}
                  >
                    {joining ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isSigningUp ? "Creating Account..." : "Signing In..."}
                      </>
                    ) : (
                      isSigningUp ? "Create Account & Join" : "Sign In & Join"
                    )}
                  </Button>
                </div>

                <div className="text-center">
                  <Button 
                    variant="link" 
                    onClick={() => setIsSigningUp(!isSigningUp)}
                    className="text-sm"
                    disabled={joining}
                  >
                    {isSigningUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {invitationDetails && (
            <div className="text-center">
              <Button 
                variant="link" 
                onClick={() => {
                  setInvitationDetails(null)
                  setInvitationCode("")
                  setEmail("")
                  setPassword("")
                  setFullName("")
                  setIsSigningUp(false)
                }}
                className="text-sm"
                disabled={joining}
              >
                Try Different Code
              </Button>
            </div>
          )}
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
