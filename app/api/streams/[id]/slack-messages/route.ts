import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { SlackMessageService } from '@/lib/integrations/slack-messages';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: streamId } = await params;
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

    // Get messages and stats
    const [messages, stats] = await Promise.all([
      SlackMessageService.getStreamMessages(streamId),
      SlackMessageService.getStreamMessageStats(streamId),
    ]);

    return NextResponse.json({
      messages,
      stats,
    });

  } catch (error) {
    console.error('Error in GET /api/streams/[id]/slack-messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: streamId } = await params;
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

    // Get stream organization
    const { data: stream } = await supabase
      .from('streams')
      .select('organization_id')
      .eq('id', streamId)
      .single();

    if (!stream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      slack_message_id,
      slack_channel_id,
      slack_channel_name,
      slack_user_id,
      slack_user_name,
      slack_user_display_name,
      message_text,
      message_timestamp,
      thread_ts,
      permalink,
      attachments,
      reactions,
      metadata,
    } = body;

    // Validate required fields
    if (!slack_message_id || !slack_channel_id || !slack_user_id || !message_text || !permalink) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if message is already linked
    const isLinked = await SlackMessageService.isMessageLinked(slack_message_id);
    if (isLinked) {
      return NextResponse.json({ error: 'Message already linked to a stream' }, { status: 409 });
    }

    // Add message to stream
    const message = await SlackMessageService.addMessageToStream(user.id, {
      stream_id: streamId,
      organization_id: stream.organization_id,
      slack_message_id,
      slack_channel_id,
      slack_channel_name,
      slack_user_id,
      slack_user_name,
      slack_user_display_name,
      message_text,
      message_timestamp,
      thread_ts,
      permalink,
      attachments: attachments || [],
      reactions: reactions || [],
      metadata: metadata || {},
    });

    if (!message) {
      return NextResponse.json({ error: 'Failed to add message to stream' }, { status: 500 });
    }

    return NextResponse.json(message, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/streams/[id]/slack-messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
