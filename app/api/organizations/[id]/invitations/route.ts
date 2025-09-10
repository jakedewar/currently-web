import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { sendInvitationEmail } from '@/lib/email'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: organizationId } = await params

    // Get current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has admin/owner permissions
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Get active invitations for the organization
    const { data: invitations, error: invitationsError } = await supabase
      .from('organization_invitations')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (invitationsError) {
      return NextResponse.json(
        { error: 'Failed to fetch invitations' },
        { status: 500 }
      )
    }

    return NextResponse.json({ invitations: invitations || [] })
  } catch (error) {
    console.error('Error in /api/organizations/[id]/invitations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: organizationId } = await params
    const { email, role = 'member', expiresIn = 7 } = await request.json()

    // Get current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has admin/owner permissions
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!['owner', 'admin', 'member'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Generate invitation code
    const invitationCode = randomBytes(16).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresIn)

    // Get organization details for email
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', organizationId)
      .single()

    if (orgError || !organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Get inviter details for email
    const { data: inviterProfile } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const inviterName = inviterProfile?.full_name || user.email || 'Someone'

    // Create invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('organization_invitations')
      .insert({
        organization_id: organizationId,
        email,
        role,
        invitation_code: invitationCode,
        expires_at: expiresAt.toISOString(),
        created_by: user.id,
        status: 'active'
      })
      .select()
      .single()

    if (invitationError) {
      return NextResponse.json(
        { error: 'Failed to create invitation' },
        { status: 500 }
      )
    }

    // Send invitation email
    const invitationLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/join?code=${invitationCode}`
    
    const emailResult = await sendInvitationEmail({
      to: email,
      organizationName: organization.name,
      inviterName,
      role,
      invitationLink,
      expiresAt: expiresAt.toISOString()
    })

    // Update invitation with email status
    if (emailResult.success) {
      await supabase
        .from('organization_invitations')
        .update({ 
          email_sent_at: new Date().toISOString(),
          email_sent_status: 'sent'
        })
        .eq('id', invitation.id)
    } else {
      console.error('Failed to send invitation email:', emailResult.error)
      await supabase
        .from('organization_invitations')
        .update({ 
          email_sent_status: 'failed',
          email_error: emailResult.error
        })
        .eq('id', invitation.id)
    }

    return NextResponse.json({ 
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        invitation_code: invitation.invitation_code,
        expires_at: invitation.expires_at,
        status: invitation.status,
        created_at: invitation.created_at,
        email_sent: emailResult.success,
        email_error: emailResult.success ? null : emailResult.error
      }
    })
  } catch (error) {
    console.error('Error in /api/organizations/[id]/invitations POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
