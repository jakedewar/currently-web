import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { verifySlackRequest } from '@/lib/integrations/slack-verification';
import { WebClient } from '@slack/web-api';
import { logSlackError } from '@/docs/tests/slack-debug';
import { getSlackConfig } from '@/lib/integrations/slack-config';
import type { Database } from '@/lib/supabase/types';

// Type definitions for Slack interactive components
interface SlackUser {
  id: string;
  username?: string;
  name?: string;
  team_id?: string;
}

interface SlackChannel {
  id: string;
  name?: string;
}

interface SlackMessage {
  ts: string;
  text: string;
  user: string;
  username?: string;
  user_profile?: {
    display_name?: string;
    real_name?: string;
  };
  channel?: SlackChannel;
  team?: string;
  thread_ts?: string;
  attachments?: unknown[];
  reactions?: unknown[];
}

interface SlackAction {
  action_id: string;
  type: string;
}

interface SlackView {
  state: {
    values: Record<string, Record<string, { selected_option?: { value: string } }>>;
  };
  private_metadata: string;
  callback_id?: string;
}

interface SlackPayload {
  type: 'block_actions' | 'shortcut' | 'view_submission' | 'message_action';
  user: SlackUser;
  channel?: SlackChannel;
  message?: SlackMessage;
  actions?: SlackAction[];
  callback_id?: string;
  view?: SlackView;
  trigger_id?: string;
}

// Helper function to create a service role client (bypasses RLS)
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
    console.log('[SLACK DEBUG] ===== INTERACTIVE ENDPOINT CALLED =====');
    console.log('[SLACK DEBUG] Request URL:', request.url);
    console.log('[SLACK DEBUG] Request method:', request.method);
    console.log('[SLACK DEBUG] Request headers:', Object.fromEntries(request.headers.entries()));
    
    const body = await request.text();
    const slackConfig = getSlackConfig();

    if (!slackConfig.signingSecret) {
      logSlackError('/api/integrations/slack/interactive', new Error('Slack signing secret not configured'));
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Verify the request signature
    const verification = verifySlackRequest(body, request.headers, slackConfig.signingSecret);
    if (!verification.isValid) {
      logSlackError('/api/integrations/slack/interactive', new Error('Request verification failed'), { 
        error: verification.error,
        headers: Object.fromEntries(request.headers.entries())
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the payload - Slack sends form-encoded data with a 'payload' parameter
    let payload: SlackPayload;
    try {
      if (request.headers.get('content-type')?.includes('application/x-www-form-urlencoded')) {
        // Parse form data and extract the payload parameter
        const formData = new URLSearchParams(body);
        const payloadString = formData.get('payload');
        if (!payloadString) {
          throw new Error('No payload parameter found in form data');
        }
        payload = JSON.parse(payloadString);
        console.log('[SLACK DEBUG] Parsed form-encoded payload');
      } else {
        // Direct JSON payload
        payload = JSON.parse(body);
        console.log('[SLACK DEBUG] Parsed direct JSON payload');
      }
    } catch (parseError) {
      logSlackError('/api/integrations/slack/interactive', new Error('Failed to parse payload'), {
        error: parseError instanceof Error ? parseError.message : 'Unknown error',
        body: body.substring(0, 200) + '...',
        contentType: request.headers.get('content-type')
      });
      return NextResponse.json({ error: 'Invalid payload format' }, { status: 400 });
    }
    
    // Log the incoming payload for debugging
    console.log('[SLACK DEBUG] Interactive payload received:', {
      type: payload.type,
      user_id: payload.user?.id,
      channel_id: payload.channel?.id,
      action_id: payload.actions?.[0]?.action_id,
      callback_id: payload.callback_id,
      timestamp: new Date().toISOString()
    });

    // Handle different types of Slack interactions
    if (payload.type === 'block_actions') {
      console.log('[SLACK DEBUG] Handling block_actions');
      return handleBlockActions(payload);
    } else if (payload.type === 'shortcut' || payload.type === 'message_action') {
      console.log('[SLACK DEBUG] Handling shortcut/message_action');
      return handleShortcut(payload);
    } else if (payload.type === 'view_submission') {
      console.log('[SLACK DEBUG] Handling view_submission');
      return handleViewSubmission(payload);
    }

    console.log('[SLACK DEBUG] Unknown payload type:', payload.type);
    return NextResponse.json({ text: 'Interaction received' });

  } catch (error) {
    console.log('[SLACK DEBUG] ===== ERROR IN INTERACTIVE ENDPOINT =====');
    logSlackError('/api/integrations/slack/interactive', error, { 
      body: await request.text().catch(() => 'Could not read body'),
      headers: Object.fromEntries(request.headers.entries())
    });
    return NextResponse.json({ text: 'Error processing interaction' }, { status: 500 });
  }
}

async function handleBlockActions(payload: SlackPayload) {
  try {
    const { actions, user, channel, message } = payload;

    console.log('[SLACK DEBUG] Handling block actions:', {
      user_id: user.id,
      channel_id: channel?.id,
      actions: actions?.map(a => ({ action_id: a.action_id, type: a.type })),
      message_id: message?.ts
    });

    if (!actions) {
      logSlackError('handleBlockActions', new Error('No actions found'), { payload });
      return NextResponse.json({ text: 'No actions found' });
    }

    for (const action of actions) {
      if (action.action_id === 'pin_to_currently') {
        console.log('[SLACK DEBUG] Pin to Currently action triggered');
        // Show project selection modal
        return showProjectSelectionModal(user.id, channel?.id || '', message, payload.trigger_id);
      }
    }

    return NextResponse.json({ text: 'Action processed' });
  } catch (error) {
    logSlackError('handleBlockActions', error, { payload });
    return NextResponse.json({ text: 'Error processing action' }, { status: 500 });
  }
}

async function handleShortcut(payload: SlackPayload) {
  try {
    const { user, channel, message } = payload;
    
    console.log('[SLACK DEBUG] Handling shortcut/message_action:', {
      type: payload.type,
      callback_id: payload.callback_id,
      user_id: user.id,
      channel_id: channel?.id,
      has_message: !!message,
      message_id: message?.ts
    });
    
    if (payload.callback_id === 'pin_message') {
      console.log('[SLACK DEBUG] Pin message shortcut triggered');
      return showProjectSelectionModal(user.id, channel?.id || '', message, payload.trigger_id);
    }

    console.log('[SLACK DEBUG] Unknown callback_id:', payload.callback_id);
    return NextResponse.json({ text: 'Shortcut processed' });
  } catch (error) {
    logSlackError('handleShortcut', error, { payload });
    return NextResponse.json({ text: 'Error processing shortcut' }, { status: 500 });
  }
}

async function handleViewSubmission(payload: SlackPayload) {
  try {
    const { user, view } = payload;
    
    console.log('[SLACK DEBUG] Handling view submission:', {
      user_id: user.id,
      callback_id: view?.callback_id,
      has_private_metadata: !!view?.private_metadata
    });
    
    if (!view) {
      logSlackError('handleViewSubmission', new Error('No view data found'), { payload });
      return NextResponse.json({
        response_action: 'errors',
        errors: {
          general: 'No view data found'
        }
      });
    }
    
    const values = view.state.values;
    
    console.log('[SLACK DEBUG] View submission values:', { 
      userId: user.id, 
      allValues: Object.keys(values),
      fullValues: values
    });
    
    // Extract selected project ID - find the project_select action in any block
    let projectId: string | undefined;
    for (const blockId of Object.keys(values)) {
      const block = values[blockId];
      if (block.project_select?.selected_option?.value) {
        projectId = block.project_select.selected_option.value;
        break;
      }
    }
    
    console.log('[SLACK DEBUG] Extracted project ID:', projectId);
    
    if (!projectId) {
      logSlackError('handleViewSubmission', new Error('No project selected'), { 
        userId: user.id, 
        values: values 
      });
      return NextResponse.json({
        response_action: 'errors',
        errors: {
          project_selection: 'Please select a project'
        }
      });
    }

    // Get message data from private metadata
    let messageData;
    try {
      messageData = JSON.parse(view.private_metadata);
      console.log('[SLACK DEBUG] Parsed message data:', {
        slack_message_id: messageData.slack_message_id,
        slack_channel_id: messageData.slack_channel_id,
        message_text_length: messageData.message_text?.length
      });
    } catch (error) {
      logSlackError('handleViewSubmission', new Error('Failed to parse private metadata'), { 
        private_metadata: view.private_metadata,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return NextResponse.json({
        response_action: 'errors',
        errors: {
          general: 'Invalid message data. Please try again.'
        }
      });
    }

    // First, we need to find the user in our database by their Slack user ID
    const supabase = await createClient();
    const { data: integration, error: integrationError } = await supabase
      .rpc('find_slack_integration_by_user_id', { slack_user_id: user.id });

    if (integrationError || !integration) {
      logSlackError('handleViewSubmission', new Error('Integration not found'), { 
        slack_user_id: user.id,
        error: integrationError
      });
      return NextResponse.json({
        response_action: 'errors',
        errors: {
          project_selection: 'You need to connect your Slack account to Currently first.'
        }
      });
    }

    console.log('[SLACK DEBUG] Found integration:', {
      user_id: integration?.[0]?.user_id,
      slack_user_id: user.id
    });

    // Pin the message to the selected project
    const pinPayload = {
      ...messageData,
      project_id: projectId,
      user_id: integration?.[0]?.user_id, // Use the database user ID, not Slack user ID
    };

    console.log('[SLACK DEBUG] Calling pin-message API with payload:', {
      project_id: projectId,
      user_id: integration?.[0]?.user_id,
      slack_message_id: messageData.slack_message_id
    });

    const slackConfig = getSlackConfig();
    const response = await fetch(`${slackConfig.siteUrl}/api/integrations/slack/pin-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pinPayload),
    });

    const responseData = await response.json();

    if (response.ok) {
      console.log('[SLACK DEBUG] Message pinned successfully');
      return NextResponse.json({
        response_action: 'clear'
      });
    } else {
      logSlackError('handleViewSubmission', new Error('Failed to pin message'), {
        status: response.status,
        response: responseData,
        payload: pinPayload
      });
      return NextResponse.json({
        response_action: 'errors',
        errors: {
          project_selection: `Failed to pin message: ${responseData.error || 'Unknown error'}`
        }
      });
    }
  } catch (error) {
    logSlackError('handleViewSubmission', error, { payload });
    return NextResponse.json({
      response_action: 'errors',
      errors: {
        project_selection: 'Failed to pin message. Please try again.'
      }
    });
  }
}

async function showProjectSelectionModal(userId: string, channelId: string, message: SlackMessage | undefined, triggerId?: string) {
  try {
    if (!message) {
      return NextResponse.json({
        response_action: 'errors',
        errors: {
          general: 'No message data found'
        }
      });
    }

    console.log('showStreamSelectionModal called with:', { userId, channelId, message: message.text.substring(0, 100) });
    
    // Get user's accessible projects
    const supabase = await createClient();
    
    // First, we need to find the user in our database by their Slack user ID
    // The Slack user ID is stored in the integrations table metadata
    console.log('[SLACK DEBUG] Looking for integration with Slack user ID:', userId);
    
    // Debug: Check if any integrations exist (for troubleshooting only)
    const { count: integrationCount } = await supabase
      .from('integrations')
      .select('*', { count: 'exact', head: true })
      .eq('provider', 'slack')
      .eq('is_active', true);
    
    console.log('[SLACK DEBUG] Total active Slack integrations:', integrationCount);

    // Use a proper JSON query to find the integration by Slack user ID
    // This is more scalable and multi-tenant friendly
    const { data: integration, error: integrationError } = await supabase
      .rpc('find_slack_integration_by_user_id', { slack_user_id: userId });

    console.log('[SLACK DEBUG] Integration search results:', {
      looking_for_user_id: userId,
      found_integration: !!integration,
      integration_user_id: integration?.[0]?.user_id
    });

    if (integrationError) {
      console.error('[SLACK DEBUG] Integration lookup error:', integrationError);
    }

    if (!integration) {
      console.error('Integration not found for Slack user ID:', userId);
      return NextResponse.json({
        response_action: 'errors',
        errors: {
          general: 'You need to connect your Slack account to Currently first. Please visit the Integrations page in Currently to set up the connection.'
        }
      });
    }

    console.log('Found integration for user:', integration?.[0]?.user_id);
    
    // Get user's organization memberships
    const { data: orgMembers } = await supabase
      .from('organization_members')
      .select(`
        organization_id,
        organizations!inner(name)
      `)
      .eq('user_id', integration?.[0]?.user_id);

    console.log('[SLACK DEBUG] Organization memberships found:', orgMembers?.length || 0);
    console.log('[SLACK DEBUG] Organization IDs:', orgMembers?.map(om => om.organization_id));

    // Debug: Check if there are any projects at all in the user's organizations
    if (orgMembers) {
      for (const org of orgMembers) {
        const { data: allProjectsInOrg } = await supabase
          .from('projects')
          .select('id, name, status')
          .eq('organization_id', org.organization_id);
        
        console.log('[SLACK DEBUG] All projects in org', org.organization_id, ':', allProjectsInOrg?.length || 0);
        
        // Check if user is a member of any projects
        const { data: userProjectMemberships } = await supabase
          .from('project_members')
          .select('project_id, projects!inner(name)')
          .eq('user_id', integration?.[0]?.user_id);
        
        console.log('[SLACK DEBUG] User project memberships:', userProjectMemberships?.length || 0);
      }
    }

    if (!orgMembers || orgMembers.length === 0) {
      console.log('[SLACK DEBUG] No organization memberships found');
      return NextResponse.json({
        response_action: 'errors',
        errors: {
          general: 'You are not a member of any organizations'
        }
      });
    }

    // First get the project IDs the user is a member of (once, outside the loop)
    console.log('[SLACK DEBUG] Querying project memberships for user:', integration?.[0]?.user_id);
    
    // Use service role client to bypass RLS for this query
    const serviceSupabase = createServiceRoleClient();
    const { data: userProjectMemberships, error: membershipError } = await serviceSupabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', integration?.[0]?.user_id);

    console.log('[SLACK DEBUG] Project membership query result:', {
      count: userProjectMemberships?.length || 0,
      error: membershipError?.message,
      data: userProjectMemberships
    });

    const projectIds = userProjectMemberships?.map(pm => pm.project_id) || [];
    
    console.log('[SLACK DEBUG] User project IDs:', projectIds);

    // Get projects for each organization
    const projectPromises = orgMembers.map(async (org) => {
      console.log('[SLACK DEBUG] Querying projects for organization:', org.organization_id);

      // Get the projects for this organization that the user is a member of
      const { data: projects, error: projectsError } = await serviceSupabase
        .from('projects')
        .select(`
          id,
          name,
          description
        `)
        .eq('organization_id', org.organization_id)
        .eq('status', 'active')
        .in('id', projectIds)
        .order('name');

      console.log('[SLACK DEBUG] Projects query result for org', org.organization_id, ':', {
        count: projects?.length || 0,
        error: projectsError?.message,
        projectNames: projects?.map(p => p.name)
      });

      return projects || [];
    });

    const allProjects = (await Promise.all(projectPromises)).flat();

    console.log('[SLACK DEBUG] Total projects found:', allProjects.length);
    console.log('[SLACK DEBUG] Project names:', allProjects.map(p => p.name));

    if (allProjects.length === 0) {
      console.log('[SLACK DEBUG] No projects found, returning error');
      return NextResponse.json({
        response_action: 'errors',
        errors: {
          general: 'No accessible projects found'
        }
      });
    }

    // Initialize user and channel names (will be updated if we have a bot token)
    let slackUserName = 'Unknown';
    let slackChannelName = 'Unknown';

    // If we have a trigger_id, open the modal using Slack Web API
    if (triggerId) {
      console.log('[SLACK DEBUG] Attempting to get bot token for user:', integration?.[0]?.user_id);
      
      // Get the bot token from the user's integration (not organization level)
      const serviceSupabase = createServiceRoleClient();
      const { data: userIntegration } = await serviceSupabase
        .from('integrations')
        .select('access_token')
        .eq('user_id', integration?.[0]?.user_id)
        .eq('provider', 'slack')
        .eq('is_active', true)
        .single();
      
      const botToken = userIntegration?.access_token;
      console.log('[SLACK DEBUG] Bot token result:', botToken ? 'Found' : 'Not found');
      
      if (!botToken) {
        console.log('[SLACK DEBUG] No bot token found, returning error');
        return NextResponse.json({
          response_action: 'errors',
          errors: {
            general: 'Unable to access Slack integration. Please check your connection.'
          }
        });
      }

      // Extract user and channel information from the message payload (no API calls needed)
      // Use the data that's already available in the Slack message
      slackUserName = message.user_profile?.real_name || 
                     message.user_profile?.display_name || 
                     message.username || 
                     `User ${userId.substring(0, 8)}`; // Fallback to partial user ID
      
      slackChannelName = message.channel?.name || 
                        `Channel ${channelId.substring(0, 8)}`; // Fallback to partial channel ID
      
      console.log('[SLACK DEBUG] Extracted user/channel info from message payload:', {
        slackUserName,
        slackChannelName,
        messageUser: message.user,
        messageUsername: message.username,
        messageChannel: message.channel,
        fullMessage: JSON.stringify(message, null, 2)
      });

      // Create modal with stream selection (after fetching user/channel info)
      const modal = {
        type: 'modal' as const,
        callback_id: 'pin_message_modal',
        title: {
          type: 'plain_text' as const,
          text: 'Pin to Currently'
        },
        submit: {
          type: 'plain_text' as const,
          text: 'Pin Message'
        },
        close: {
          type: 'plain_text' as const,
          text: 'Cancel'
        },
        private_metadata: JSON.stringify({
          slack_message_id: message.ts,
          slack_channel_id: channelId,
          slack_channel_name: slackChannelName,
          slack_user_id: userId,
          slack_user_name: slackUserName,
          slack_user_display_name: slackUserName,
          message_text: message.text,
          message_timestamp: new Date(parseFloat(message.ts) * 1000).toISOString(),
          thread_ts: message.thread_ts,
          permalink: `https://T08RNP1VBPF.slack.com/archives/${channelId}/p${message.ts.replace('.', '')}`,
          attachments: message.attachments || [],
          reactions: message.reactions || [],
          metadata: {},
        }),
        blocks: [
          {
            type: 'section' as const,
            text: {
              type: 'mrkdwn' as const,
              text: `*Pin this message to a Currently project:*\n\n> ${message.text.substring(0, 200)}${message.text.length > 200 ? '...' : ''}`
            }
          },
          {
            type: 'divider' as const
          },
          {
            type: 'section' as const,
            text: {
              type: 'mrkdwn' as const,
              text: '*Select a project:*'
            },
            accessory: {
              type: 'static_select' as const,
              action_id: 'project_select',
              placeholder: {
                type: 'plain_text' as const,
                text: 'Choose a project...'
              },
              options: allProjects.map(project => ({
                text: {
                  type: 'plain_text' as const,
                  text: project.name
                },
                value: project.id,
                description: {
                  type: 'plain_text' as const,
                  text: project.description ? 
                    (project.description.length > 75 ? project.description.substring(0, 72) + '...' : project.description) :
                    'No description'
                }
              }))
            }
          }
        ]
      };

      const slack = new WebClient(botToken);
      try {
        console.log('[SLACK DEBUG] Opening modal with trigger_id:', triggerId);
        console.log('[SLACK DEBUG] Modal structure:', JSON.stringify(modal, null, 2));
        
        const result = await slack.views.open({
          trigger_id: triggerId,
          view: modal
        });
        
        console.log('[SLACK DEBUG] Modal opened successfully:', result);
        return NextResponse.json({ response_action: 'clear' });
      } catch (error) {
        console.error('Error opening Slack modal:', error);
        console.error('Modal that failed:', JSON.stringify(modal, null, 2));
        return NextResponse.json({
          response_action: 'errors',
          errors: {
            general: 'Failed to open project selection modal. Please try again.'
          }
        });
      }
    } else {
      // No trigger_id provided - this shouldn't happen in normal flow
      return NextResponse.json({
        response_action: 'errors',
        errors: {
          general: 'Unable to open modal. Please try again.'
        }
      });
    }

  } catch (error) {
    console.error('Error showing project selection modal:', error);
    return NextResponse.json({
      response_action: 'errors',
      errors: {
        general: 'Failed to load projects. Please try again.'
      }
    });
  }
}
