import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { SlackMessageService } from '@/lib/integrations/slack-messages';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const { id: streamId, messageId } = await params;
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has access to this stream
    const { data: streamMember } = await supabase
      .from('stream_members')
      .select('id')
      .eq('stream_id', streamId)
      .eq('user_id', user.id)
      .single();

    if (!streamMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Remove message from stream
    const success = await SlackMessageService.removeMessageFromStream(user.id, messageId);

    if (!success) {
      return NextResponse.json({ error: 'Failed to remove message from stream' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in DELETE /api/streams/[id]/slack-messages/[messageId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
