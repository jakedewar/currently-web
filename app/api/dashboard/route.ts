import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getDashboardData } from '@/lib/data/dashboard'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user has access to the requested organization
    const { data: orgMemberships } = await supabase
      .from('organization_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)

    if (!orgMemberships || orgMemberships.length === 0) {
      return NextResponse.json(
        { error: 'No access to this organization' },
        { status: 403 }
      )
    }

    // Get dashboard data for the organization
    const dashboardData = await getDashboardData(organizationId)

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Error in /api/dashboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
