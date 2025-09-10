"use client"

import { Waves, Building2 } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { SignUpForm } from "@/components/sign-up-form"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, Suspense, useCallback } from "react"

interface InvitationDetails {
  organization: {
    name: string
  }
  role: string
}

function SignUpPageContent() {
  const searchParams = useSearchParams()
  const [invitationDetails, setInvitationDetails] = useState<InvitationDetails | null>(null)
  
  const invitationId = searchParams.get('invitation')

  const loadInvitationDetails = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/invitations/${id}`)
      const data = await response.json()

      if (response.ok) {
        setInvitationDetails(data.invitation)
      }
    } catch (error) {
      console.error('Failed to load invitation details:', error)
    }
  }, [])

  useEffect(() => {
    if (invitationId) {
      loadInvitationDetails(invitationId)
    }
  }, [invitationId, loadInvitationDetails])
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium hover:opacity-80 transition-opacity">
            <Waves className="size-5 text-primary" />
            <span className="text-foreground">Currently</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            {/* Invitation Banner */}
            {invitationDetails && (
              <Card className="mb-6 border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary">
                        You&apos;ve been invited to join {invitationDetails.organization.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Create your account to accept your invitation as <Badge variant="secondary" className="text-xs">{invitationDetails.role}</Badge>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="mb-8 text-center lg:text-left">
              <h1 className="text-2xl font-semibold text-foreground mb-2">
                {invitationDetails ? "Create account to accept invitation" : "Create your account"}
              </h1>
              <p className="text-muted-foreground">
                {invitationDetails ? "Create your Currently account to join the organization" : "Join thousands of teams using Currently"}
              </p>
            </div>
            <Suspense fallback={<div>Loading...</div>}>
              <SignUpForm />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="bg-muted/50 relative hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-muted/50">
          <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center opacity-10" />
        </div>
        <div className="relative h-full flex items-center justify-center p-12">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <Waves className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Transform how your team works
              </h2>
              <p className="text-muted-foreground">
                Unlock your team&apos;s full potential with intelligent project organization, real-time collaboration, and powerful automation that adapts to your workflow.
              </p>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Free for up to 5 team members</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Start instantly, no credit card</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Full access for 14 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignUpPage() {
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
      <SignUpPageContent />
    </Suspense>
  )
}

