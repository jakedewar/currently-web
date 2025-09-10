import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { invitationId, invitationCode } = await request.json()

    // Get current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate input
    if (!invitationId && !invitationCode) {
      return NextResponse.json(
        { error: 'Invitation ID or invitation code is required' },
        { status: 400 }
      )
    }

    // Find the invitation by ID or code
    let query = supabase
      .from('organization_invitations')
      .select(`
        *,
        organizations (
          id,
          name,
          slug
        )
      `)
      .eq('status', 'active')

    if (invitationId) {
      query = query.eq('id', invitationId)
    } else if (invitationCode) {
      query = query.eq('invitation_code', invitationCode)
    }

    const { data: invitation, error: invitationError } = await query.single()

    if (invitationError || !invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 404 }
      )
    }

    // Check if invitation has expired
    if (new Date() > new Date(invitation.expires_at)) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 410 }
      )
    }

    // Check if user is already a member of the organization
    const { data: existingMember, error: existingError } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', invitation.organization_id)
      .eq('user_id', user.id)
      .single()

    if (existingError && existingError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Failed to check existing membership' },
        { status: 500 }
      )
    }

    if (existingMember) {
      return NextResponse.json(
        { error: 'You are already a member of this organization' },
        { status: 409 }
      )
    }

    // Add user to organization
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: invitation.organization_id,
        user_id: user.id,
        role: invitation.role,
      })

    if (memberError) {
      return NextResponse.json(
        { error: 'Failed to join organization' },
        { status: 500 }
      )
    }

    // Mark invitation as accepted
    const { error: updateError } = await supabase
      .from('organization_invitations')
      .update({ 
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        accepted_by: user.id
      })
      .eq('id', invitation.id)

    if (updateError) {
      console.error('Failed to update invitation status:', updateError)
      // Don't fail the request if this fails, as the user is already added
    }

    return NextResponse.json({ 
      message: 'Successfully joined organization',
      organization: {
        id: invitation.organizations.id,
        name: invitation.organizations.name,
        slug: invitation.organizations.slug,
        role: invitation.role
      }
    })
  } catch (error) {
    console.error('Error in /api/invitations/accept:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
