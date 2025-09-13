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

    // Get the current organization
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

    // Get the default channel from integration settings
    const { data: integration } = await supabase
      .from('integrations')
      .select('metadata')
      .eq('user_id', user.id)
      .eq('organization_id', organizationMember.organization_id)
      .eq('provider', 'slack')
      .eq('is_active', true)
      .single();

    const defaultChannel = (integration?.metadata as Record<string, unknown>)?.default_channel as string;

    if (!defaultChannel) {
      return NextResponse.json({ error: 'No default channel configured' }, { status: 400 });
    }

    // Send a test message
    const testMessage = {
      channel: defaultChannel,
      text: '🧪 Test message from Currently',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🧪 Test Message',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'This is a test message from your Currently integration. If you can see this, your Slack integration is working correctly!',
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Sent at ${new Date().toLocaleString()}`,
            },
          ],
        },
      ],
    };

    await slackIntegration.sendMessage(testMessage);

    return NextResponse.json({ 
      success: true, 
      message: 'Test message sent successfully' 
    });

  } catch (error) {
    console.error('Error sending test message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
