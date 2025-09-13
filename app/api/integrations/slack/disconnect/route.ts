import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { integration_id } = body;

    if (!integration_id) {
      return NextResponse.json({ error: 'Integration ID is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Deactivate the integration instead of deleting it
    const { error: updateError } = await supabase
      .from('integrations')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', integration_id)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error disconnecting Slack integration:', updateError);
      return NextResponse.json({ error: 'Failed to disconnect integration' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Slack integration disconnected successfully' 
    });

  } catch (error) {
    console.error('Error disconnecting Slack integration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
