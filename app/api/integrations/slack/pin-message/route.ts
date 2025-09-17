import { NextRequest, NextResponse } from 'next/server';
import { SlackMessageService } from '@/lib/integrations/slack-messages';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';
import { logSlackError } from '@/docs/tests/slack-debug';

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
      project_id,
      user_id,
    } = body;

    console.log('[SLACK DEBUG] Pin message request received:', {
      slack_message_id,
      slack_channel_id,
      slack_user_id,
      project_id,
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
    if (!project_id) missingFields.push('project_id');
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

    // Verify user has access to the project using service role client
    const serviceSupabase = createServiceRoleClient();
    const { data: projectMember, error: projectMemberError } = await serviceSupabase
      .from('project_members')
      .select('id')
      .eq('project_id', project_id)
      .eq('user_id', user_id)
      .single();

    if (projectMemberError || !projectMember) {
      logSlackError('/api/integrations/slack/pin-message', new Error('User does not have access to project'), {
        project_id,
        user_id,
        error: projectMemberError
      });
      return NextResponse.json({ 
        error: 'User does not have access to this project',
        details: projectMemberError
      }, { status: 403 });
    }

    // Get project organization
    const { data: project, error: projectError } = await serviceSupabase
      .from('projects')
      .select('organization_id')
      .eq('id', project_id)
      .single();

    if (projectError || !project) {
      logSlackError('/api/integrations/slack/pin-message', new Error('Project not found'), {
        project_id,
        error: projectError
      });
      return NextResponse.json({ 
        error: 'Project not found',
        details: projectError
      }, { status: 404 });
    }

    // Check if message is already linked
    const isLinked = await SlackMessageService.isMessageLinked(slack_message_id);
    if (isLinked) {
      logSlackError('/api/integrations/slack/pin-message', new Error('Message already linked'), {
        slack_message_id
      });
      return NextResponse.json({ 
        error: 'Message already linked to a project' 
      }, { status: 409 });
    }

    console.log('[SLACK DEBUG] Adding message to project:', {
      project_id,
      organization_id: project.organization_id,
      slack_message_id
    });

    // Add message to project
    const message = await SlackMessageService.addMessageToProject(user_id, {
      project_id,
      organization_id: project.organization_id,
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
      logSlackError('/api/integrations/slack/pin-message', new Error('Failed to add message to project'), {
        project_id,
        user_id,
        slack_message_id
      });
      return NextResponse.json({ 
        error: 'Failed to add message to project' 
      }, { status: 500 });
    }

    console.log('[SLACK DEBUG] Message successfully pinned:', {
      message_id: message.id,
      project_id: message.project_id
    });

    return NextResponse.json({
      success: true,
      message: 'Message successfully pinned to project',
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
