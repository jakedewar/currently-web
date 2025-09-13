"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Copy, Mail, Plus, Clock, CircleCheck, XCircle, Send, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Invitation {
  id: string
  email: string
  role: "owner" | "admin" | "member"
  invitation_code: string
  expires_at: string
  status: "active" | "accepted" | "expired"
  created_at: string
  email_sent?: boolean
  email_sent_at?: string
  email_sent_status?: "pending" | "sent" | "failed"
  email_error?: string
}

interface OrganizationInvitationsProps {
  organizationId: string
}

export function OrganizationInvitations({ organizationId }: OrganizationInvitationsProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"admin" | "member">("member")
  const [expiresIn, setExpiresIn] = useState("7")
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  const fetchInvitations = useCallback(async () => {
    try {
      const response = await fetch(`/api/organizations/${organizationId}/invitations`)
      const data = await response.json()
      
      if (response.ok) {
        setInvitations(data.invitations || [])
      } else {
        console.error('Failed to fetch invitations:', data.error)
        toast({
          title: "Error",
          description: "Failed to load invitations.",
          variant: "destructive",
        })
      }
    } catch {
      console.error('Error fetching invitations:')
      toast({
        title: "Error",
        description: "Failed to load invitations.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [organizationId, toast])

  useEffect(() => {
    fetchInvitations()
  }, [organizationId, fetchInvitations])

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address.",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch(`/api/organizations/${organizationId}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim(), 
          role,
          expiresIn: parseInt(expiresIn)
        }),
      })

      const data = await response.json()

      if (response.ok) {
        const emailStatus = data.invitation.email_sent ? "and email sent" : "but email failed to send"
        toast({
          title: "Success",
          description: `Invitation created successfully ${emailStatus}!`,
        })
        setEmail("")
        setRole("member")
        setExpiresIn("7")
        setShowCreateForm(false)
        fetchInvitations() // Refresh the invitations list
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create invitation.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const copyInvitationLink = async (invitationCode: string) => {
    const invitationLink = `${window.location.origin}/auth/join?code=${invitationCode}`
    
    try {
      await navigator.clipboard.writeText(invitationLink)
      toast({
        title: "Copied!",
        description: "Invitation link copied to clipboard.",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy invitation link.",
        variant: "destructive",
      })
    }
  }

  const resendInvitationEmail = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/organizations/${organizationId}/invitations/${invitationId}/resend`, {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Email Sent",
          description: "Invitation email has been resent successfully.",
        })
        fetchInvitations() // Refresh the invitations list
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to resend email.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'accepted':
        return <CircleCheck className="h-4 w-4 text-green-500" />
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getEmailStatusIcon = (emailStatus?: string) => {
    switch (emailStatus) {
      case 'sent':
        return <CircleCheck className="h-4 w-4 text-green-500" />
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Mail className="h-4 w-4 text-gray-500" />
    }
  }

  const getEmailStatusText = (emailStatus?: string) => {
    switch (emailStatus) {
      case 'sent':
        return 'Email sent'
      case 'failed':
        return 'Email failed'
      case 'pending':
        return 'Email pending'
      default:
        return 'No email'
    }
  }

  const isExpired = (expiresAt: string) => {
    return new Date() > new Date(expiresAt)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Invitations</h3>
          <div className="h-8 w-24 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg animate-pulse">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
                <div className="h-6 w-20 bg-muted rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          <h3 className="text-lg font-medium">Invitations ({invitations.length})</h3>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Invitation
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create New Invitation</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateInvitation} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  disabled={isCreating}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={(value: "admin" | "member") => setRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expiresIn">Expires In (days)</Label>
                  <Select value={expiresIn} onValueChange={setExpiresIn}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Invitation"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEmail("")
                    setRole("member")
                    setExpiresIn("7")
                  }}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {invitations.map((invitation) => (
          <Card key={invitation.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{invitation.email}</span>
                    <Badge variant="secondary" className="capitalize">
                      {invitation.role}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Created: {formatDate(invitation.created_at)}</span>
                    <span>Expires: {formatDate(invitation.expires_at)}</span>
                  </div>
                  
                  {/* Email Status */}
                  <div className="flex items-center gap-2 mt-2">
                    {getEmailStatusIcon(invitation.email_sent_status)}
                    <span className="text-sm text-muted-foreground">
                      {getEmailStatusText(invitation.email_sent_status)}
                    </span>
                    {invitation.email_sent_at && (
                      <span className="text-xs text-muted-foreground">
                        ({formatDate(invitation.email_sent_at)})
                      </span>
                    )}
                  </div>
                  
                  {invitation.email_error && (
                    <div className="text-xs text-red-600 mt-1">
                      Error: {invitation.email_error}
                    </div>
                  )}
                  
                  {invitation.status === 'active' && !isExpired(invitation.expires_at) && (
                    <div className="mt-3 p-2 bg-muted rounded text-sm font-mono">
                      {invitation.invitation_code}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  {getStatusIcon(invitation.status)}
                  <Badge className={`capitalize ${getStatusColor(invitation.status)}`}>
                    {invitation.status}
                  </Badge>
                  
                  {invitation.status === 'active' && !isExpired(invitation.expires_at) && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyInvitationLink(invitation.invitation_code)}
                        className="flex items-center gap-1"
                      >
                        <Copy className="h-3 w-3" />
                        Copy
                      </Button>
                      
                      {(invitation.email_sent_status === 'failed' || invitation.email_sent_status === 'pending') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resendInvitationEmail(invitation.id)}
                          className="flex items-center gap-1"
                        >
                          <Send className="h-3 w-3" />
                          Resend
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {invitations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No invitations found</p>
            <p className="text-sm">Create an invitation to invite team members</p>
          </div>
        )}
      </div>
    </div>
  )
}
