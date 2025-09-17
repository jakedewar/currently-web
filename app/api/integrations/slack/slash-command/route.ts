import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifySlackRequest } from '@/lib/integrations/slack-verification';
import { getSlackConfig } from '@/lib/integrations/slack-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const slackConfig = getSlackConfig();

    if (!slackConfig.signingSecret) {
      console.error('Slack signing secret not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Verify the request signature
    const verification = verifySlackRequest(body, request.headers, slackConfig.signingSecret);
    if (!verification.isValid) {
      console.error('Slack request verification failed:', verification.error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = new URLSearchParams(body);
    const text = formData.get('text') as string;
    const userId = formData.get('user_id') as string;
    const channelId = formData.get('channel_id') as string;
    const teamId = formData.get('team_id') as string;
    const userName = formData.get('user_name') as string;

    console.log('Slash command received:', { text, userId, channelId, teamId, userName });

    // Get user's accessible projects
    const supabase = await createClient();
    
    // First, we need to find the user in our database by their Slack user ID
    // This assumes you have a way to link Slack users to your app users
    // For now, we'll use a simple approach - you might need to adjust this
    const { data: integration } = await supabase
      .from('integrations')
      .select('user_id')
      .eq('provider', 'slack')
      .eq('is_active', true)
      .contains('metadata', { authed_user: { id: userId } })
      .single();

    const user = integration ? { id: integration.user_id } : null;

    if (!user) {
      return NextResponse.json({
        response_type: 'ephemeral',
        text: 'You need to connect your Slack account to Currently first. Please visit the Integrations page in Currently to set up the connection.'
      });
    }

    // Get user's organization memberships
    const { data: orgMembers } = await supabase
      .from('organization_members')
      .select(`
        organization_id,
        organizations!inner(name)
      `)
      .eq('user_id', user.id);

    if (!orgMembers || orgMembers.length === 0) {
      return NextResponse.json({
        response_type: 'ephemeral',
        text: 'You are not a member of any organizations in Currently.'
      });
    }

    // Get projects for each organization
    const projectPromises = orgMembers.map(async (org) => {
      const { data: projects } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          description,
          project_members!inner(user_id)
        `)
        .eq('organization_id', org.organization_id)
        .eq('project_members.user_id', user.id)
        .eq('status', 'active')
        .order('name');

      return projects || [];
    });

    const allStreams = (await Promise.all(projectPromises)).flat();

    if (allStreams.length === 0) {
      return NextResponse.json({
        response_type: 'ephemeral',
        text: 'No accessible projects found. Create a project in Currently first.'
      });
    }

    // If no project name provided, show available projects
    if (!text) {
      const projectList = allStreams.map(project => `• ${project.name}`).join('\n');
      return NextResponse.json({
        response_type: 'ephemeral',
        text: `Available projects:\n${projectList}\n\nUsage: /pin-to-currently [project-name]\n\nTo pin a message, right-click on it and select "Pin to Currently" from the message actions menu.`
      });
    }

    // Find matching project
    const matchingStream = allStreams.find(project => 
      project.name.toLowerCase().includes(text.toLowerCase())
    );

    if (!matchingStream) {
      return NextResponse.json({
        response_type: 'ephemeral',
        text: `Stream "${text}" not found. Available projects:\n${allStreams.map(s => `• ${s.name}`).join('\n')}`
      });
    }

    return NextResponse.json({
      response_type: 'ephemeral',
      text: `To pin a message to "${matchingStream.name}", right-click on the message and select "Pin to Currently" from the message actions menu.\n\nStream: ${matchingStream.name}\nDescription: ${matchingStream.description || 'No description'}`
    });

  } catch (error) {
    console.error('Error in slash command:', error);
    return NextResponse.json({
      response_type: 'ephemeral',
      text: 'An error occurred. Please try again.'
    });
  }
}
