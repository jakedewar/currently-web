import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSlackIntegration } from '@/lib/integrations/slack';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the integration
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .eq('provider', 'slack')
      .eq('is_active', true)
      .single();

    if (integrationError || !integration) {
      return NextResponse.json({ 
        integration: null, 
        channels: [],
        settings: null 
      });
    }

    // Get channels if integration exists
    let channels: unknown[] = [];
    try {
      const slackIntegration = await getSlackIntegration(user.id, organizationId);
      if (slackIntegration) {
        channels = await slackIntegration.getChannels();
      }
    } catch (error) {
      console.error('Error fetching Slack channels:', error);
    }

    // Get settings (stored in metadata or separate table)
    const metadata = integration.metadata as Record<string, unknown>;
    const settings = {
      default_channel: (metadata?.default_channel as string) || '',
      notifications_enabled: (metadata?.notifications_enabled as boolean) || false,
    };

    return NextResponse.json({
      integration: {
        id: integration.id,
        provider: integration.provider,
        is_active: integration.is_active,
        metadata: integration.metadata,
        created_at: integration.created_at,
      },
      channels,
      settings,
    });

  } catch (error) {
    console.error('Error fetching Slack integration status:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
