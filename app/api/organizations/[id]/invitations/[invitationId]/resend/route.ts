import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendInvitationEmail } from '@/lib/email'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; invitationId: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: organizationId, invitationId } = await params

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

    // Get the invitation details
    const { data: invitation, error: invitationError } = await supabase
      .from('organization_invitations')
      .select(`
        *,
        organizations (
          id,
          name
        )
      `)
      .eq('id', invitationId)
      .eq('organization_id', organizationId)
      .single()

    if (invitationError || !invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // Check if invitation is still active
    if (invitation.status !== 'active') {
      return NextResponse.json(
        { error: 'Invitation is no longer active' },
        { status: 400 }
      )
    }

    // Check if invitation has expired
    if (new Date() > new Date(invitation.expires_at)) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      )
    }

    // Get inviter details for email
    const { data: inviterProfile } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', invitation.created_by)
      .single()

    const inviterName = inviterProfile?.full_name || user.email || 'Someone'

    // Send invitation email
    const invitationLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/join?code=${invitation.invitation_code}`
    
    const emailResult = await sendInvitationEmail({
      to: invitation.email,
      organizationName: invitation.organizations.name,
      inviterName,
      role: invitation.role,
      invitationLink,
      expiresAt: invitation.expires_at
    })

    // Update invitation with email status
    if (emailResult.success) {
      await supabase
        .from('organization_invitations')
        .update({ 
          email_sent_at: new Date().toISOString(),
          email_sent_status: 'sent',
          email_error: null
        })
        .eq('id', invitationId)

      return NextResponse.json({ 
        success: true,
        message: 'Invitation email sent successfully'
      })
    } else {
      await supabase
        .from('organization_invitations')
        .update({ 
          email_sent_status: 'failed',
          email_error: emailResult.error
        })
        .eq('id', invitationId)

      return NextResponse.json(
        { error: `Failed to send email: ${emailResult.error}` },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in resend invitation email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
