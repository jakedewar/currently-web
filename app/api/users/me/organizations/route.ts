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

    // Get user's organizations with their roles
    const { data: orgMemberships, error: membershipError } = await supabase
      .from('organization_members')
      .select(`
        role,
        organizations (
          id,
          name,
          slug,
          avatar_url
        )
      `)
      .eq('user_id', user.id)

    if (membershipError) {
      return NextResponse.json(
        { error: 'Failed to fetch organizations' },
        { status: 500 }
      )
    }

    // Transform the data to a cleaner format
    const organizations = orgMemberships?.map(membership => ({
      id: membership.organizations.id,
      name: membership.organizations.name,
      slug: membership.organizations.slug,
      avatar_url: membership.organizations.avatar_url,
      role: membership.role
    })) || []

    return NextResponse.json({ organizations })
  } catch (error) {
    console.error('Error in /api/users/me/organizations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
