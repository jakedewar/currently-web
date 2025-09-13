import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSlackIntegration } from '@/lib/integrations/slack';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the current organization from the request or user's default

    // For now, we'll get the first organization the user belongs to
    // In a real app, you'd get this from the request context
    const { data: organizationMember } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (!organizationMember) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    const slackIntegration = await getSlackIntegration(user.id, organizationMember.organization_id);

    if (!slackIntegration) {
      return NextResponse.json({ error: 'Slack integration not found' }, { status: 404 });
    }

    // Test the connection
    const isConnected = await slackIntegration.testConnection();

    if (isConnected) {
      return NextResponse.json({ 
        success: true, 
        message: 'Slack connection is working correctly' 
      });
    } else {
      return NextResponse.json({ 
        error: 'Slack connection test failed' 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error testing Slack connection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
