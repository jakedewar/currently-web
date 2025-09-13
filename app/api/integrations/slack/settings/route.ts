import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { integration_id, default_channel, notifications_enabled } = body;

    if (!integration_id) {
      return NextResponse.json({ error: 'Integration ID is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update the integration settings
    const { error: updateError } = await supabase
      .from('integrations')
      .update({
        metadata: {
          default_channel: default_channel || '',
          notifications_enabled: notifications_enabled || false,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', integration_id)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating Slack settings:', updateError);
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Settings updated successfully' 
    });

  } catch (error) {
    console.error('Error updating Slack settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
