import { NextRequest, NextResponse } from 'next/server';
import { SlackMessageService } from '@/lib/integrations/slack-messages';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';
import { logSlackError } from '@/lib/integrations/slack-debug';

function createServiceRoleClient() {
  return createServiceClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

export async function POST(request: NextRequest) {
  try {
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
      stream_id,
      user_id,
    } = body;

    console.log('[SLACK DEBUG] Pin message request received:', {
      slack_message_id,
      slack_channel_id,
      slack_user_id,
      stream_id,
      user_id,
      message_text_length: message_text?.length,
      has_permalink: !!permalink
    });

    // Validate required fields
    const missingFields = [];
    if (!slack_message_id) missingFields.push('slack_message_id');
    if (!slack_channel_id) missingFields.push('slack_channel_id');
    if (!slack_user_id) missingFields.push('slack_user_id');
    if (!message_text) missingFields.push('message_text');
    if (!permalink) missingFields.push('permalink');
    if (!stream_id) missingFields.push('stream_id');
    if (!user_id) missingFields.push('user_id');

    if (missingFields.length > 0) {
      logSlackError('/api/integrations/slack/pin-message', new Error('Missing required fields'), {
        missingFields,
        receivedFields: Object.keys(body)
      });
      return NextResponse.json({ 
        error: 'Missing required fields',
        missingFields 
      }, { status: 400 });
    }

    // Verify user has access to the stream using service role client
    const serviceSupabase = createServiceRoleClient();
    const { data: streamMember, error: streamMemberError } = await serviceSupabase
      .from('stream_members')
      .select('id')
      .eq('stream_id', stream_id)
      .eq('user_id', user_id)
      .single();

    if (streamMemberError || !streamMember) {
      logSlackError('/api/integrations/slack/pin-message', new Error('User does not have access to stream'), {
        stream_id,
        user_id,
        error: streamMemberError
      });
      return NextResponse.json({ 
        error: 'User does not have access to this stream',
        details: streamMemberError
      }, { status: 403 });
    }

    // Get stream organization
    const { data: stream, error: streamError } = await serviceSupabase
      .from('streams')
      .select('organization_id')
      .eq('id', stream_id)
      .single();

    if (streamError || !stream) {
      logSlackError('/api/integrations/slack/pin-message', new Error('Stream not found'), {
        stream_id,
        error: streamError
      });
      return NextResponse.json({ 
        error: 'Stream not found',
        details: streamError
      }, { status: 404 });
    }

    // Check if message is already linked
    const isLinked = await SlackMessageService.isMessageLinked(slack_message_id);
    if (isLinked) {
      logSlackError('/api/integrations/slack/pin-message', new Error('Message already linked'), {
        slack_message_id
      });
      return NextResponse.json({ 
        error: 'Message already linked to a stream' 
      }, { status: 409 });
    }

    console.log('[SLACK DEBUG] Adding message to stream:', {
      stream_id,
      organization_id: stream.organization_id,
      slack_message_id
    });

    // Add message to stream
    const message = await SlackMessageService.addMessageToStream(user_id, {
      stream_id,
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
      logSlackError('/api/integrations/slack/pin-message', new Error('Failed to add message to stream'), {
        stream_id,
        user_id,
        slack_message_id
      });
      return NextResponse.json({ 
        error: 'Failed to add message to stream' 
      }, { status: 500 });
    }

    console.log('[SLACK DEBUG] Message successfully pinned:', {
      message_id: message.id,
      stream_id: message.stream_id
    });

    return NextResponse.json({
      success: true,
      message: 'Message successfully pinned to stream',
      data: message,
    });

  } catch (error) {
    logSlackError('/api/integrations/slack/pin-message', error, { body: await request.json().catch(() => 'Could not parse body') });
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
