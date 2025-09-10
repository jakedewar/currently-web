import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('Received invitation ID:', id)
    const supabase = await createClient()

    // Find the invitation by ID with organization details
    const { data: invitation, error: invitationError } = await supabase
      .from('organization_invitations')
      .select(`
        *,
        organizations (
          id,
          name,
          slug
        )
      `)
      .eq('id', id)
      .single()

    console.log('Invitation lookup:', { 
      id, 
      invitation, 
      error: invitationError,
      errorCode: invitationError?.code,
      errorMessage: invitationError?.message,
      errorDetails: invitationError?.details
    })

    if (invitationError || !invitation) {
      console.log('Invitation not found or error:', invitationError)
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 404 }
      )
    }

    // Check if invitation is active
    if (invitation.status !== 'active') {
      console.log('Invitation not active:', invitation.status)
      return NextResponse.json(
        { error: 'Invitation is no longer active' },
        { status: 410 }
      )
    }

    // Check if invitation has expired
    if (new Date() > new Date(invitation.expires_at)) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 410 }
      )
    }

    return NextResponse.json({ 
      invitation: {
        id: invitation.id,
        organization: invitation.organizations,
        email: invitation.email,
        role: invitation.role,
        expires_at: invitation.expires_at,
        status: invitation.status
      }
    })
  } catch (error) {
    console.error('Error in /api/invitations/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
