"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Users, Plus, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Member {
  id: string
  full_name: string
  avatar_url?: string
  email: string
  role: "owner" | "admin" | "member"
  joined_at: string
}

interface OrganizationMembersProps {
  organizationId: string
}

export function OrganizationMembers({ organizationId }: OrganizationMembersProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"admin" | "member">("member")
  const [isAdding, setIsAdding] = useState(false)
  const { toast } = useToast()

  const fetchMembers = useCallback(async () => {
    try {
      const response = await fetch(`/api/organizations/${organizationId}/members`)
      const data = await response.json()
      
      if (response.ok) {
        setMembers(data.members)
      } else {
        console.error('Failed to fetch members:', data.error)
        toast({
          title: "Error",
          description: "Failed to load organization members.",
          variant: "destructive",
        })
      }
    } catch {
      console.error('Error fetching members:')
      toast({
        title: "Error",
        description: "Failed to load organization members.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [organizationId, toast])

  useEffect(() => {
    fetchMembers()
  }, [organizationId, fetchMembers])

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address.",
        variant: "destructive",
      })
      return
    }

    setIsAdding(true)
    try {
      const response = await fetch(`/api/organizations/${organizationId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), role }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Member added successfully!",
        })
        setEmail("")
        setRole("member")
        setShowAddForm(false)
        fetchMembers() // Refresh the members list
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add member.",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Members</h3>
          <div className="h-8 w-24 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 border rounded-lg animate-pulse">
              <div className="h-10 w-10 bg-muted rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
              </div>
              <div className="h-6 w-16 bg-muted rounded"></div>
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
          <Users className="h-5 w-5" />
          <h3 className="text-lg font-medium">Members ({members.length})</h3>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Member
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add New Member</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  disabled={isAdding}
                />
              </div>
              
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
              
              <div className="flex gap-2">
                <Button type="submit" disabled={isAdding}>
                  {isAdding ? "Adding..." : "Add Member"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false)
                    setEmail("")
                    setRole("member")
                  }}
                  disabled={isAdding}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-3 p-3 border rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarImage src={member.avatar_url} />
              <AvatarFallback>
                {member.full_name?.charAt(0).toUpperCase() || member.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">
                  {member.full_name || 'Unnamed User'}
                </p>
                <Mail className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm text-muted-foreground truncate">
                  {member.email}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Joined {formatDate(member.joined_at)}
              </p>
            </div>
            
            <Badge className={`capitalize ${getRoleColor(member.role)}`}>
              {member.role}
            </Badge>
          </div>
        ))}
        
        {members.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No members found</p>
            <p className="text-sm">Add your first team member to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}
