import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's organization memberships
    const { data: orgMemberships, error: membershipError } = await supabase
      .from('organization_members')
      .select('role, organization_id')
      .eq('user_id', user.id)

    if (membershipError) {
      console.error('Membership error:', membershipError)
      return NextResponse.json(
        { error: 'Failed to fetch organizations' },
        { status: 500 }
      )
    }

    if (!orgMemberships || orgMemberships.length === 0) {
      return NextResponse.json({ organizations: [] })
    }

    // Get organization details for each membership
    const organizationIds = orgMemberships.map(membership => membership.organization_id)
    const { data: organizationsData, error: orgsError } = await supabase
      .from('organizations')
      .select('id, name, slug, avatar_url')
      .in('id', organizationIds)

    if (orgsError) {
      console.error('Organizations error:', orgsError)
      return NextResponse.json(
        { error: 'Failed to fetch organization details' },
        { status: 500 }
      )
    }

    // Combine the data
    const organizations = orgMemberships.map(membership => {
      const org = organizationsData?.find(o => o.id === membership.organization_id)
      return {
        id: org?.id || membership.organization_id,
        name: org?.name || 'Unknown Organization',
        slug: org?.slug || '',
        avatar_url: org?.avatar_url,
        role: membership.role
      }
    })

    return NextResponse.json({ organizations })
  } catch (error) {
    console.error('Error in /api/users/me/organizations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
