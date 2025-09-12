import { NextRequest, NextResponse } from 'next/server'
import { getCurrentlyDashboardData } from '@/lib/data/currently-dashboard'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')

    const dashboardData = await getCurrentlyDashboardData(organizationId || undefined)
    
    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Error in GET /api/currently-dashboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
