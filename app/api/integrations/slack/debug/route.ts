import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSlackConfig, isStagingEnvironment, getSlackAppName, validateSlackConfig } from '@/lib/integrations/slack-config';
import { logSlackError, getErrorLog } from '@/docs/tests/slack-debug';

interface DebugInfo {
  timestamp: string;
  environment: {
    SLACK_SIGNING_SECRET: boolean;
    NEXT_PUBLIC_SLACK_CLIENT_ID: boolean;
    NEXT_PUBLIC_SITE_URL: boolean;
    is_staging: boolean;
    slack_app_name: string;
    site_url: string;
    config_valid: boolean;
    missing_vars: string[];
  };
  database: {
    integrations_count: number;
    slack_messages_count: number;
    users_with_slack: number;
  };
  recent_errors: Array<{
    timestamp: string;
    endpoint: string;
    error: string;
    details?: string;
  }>;
}


export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get database stats
    const [integrationsResult, messagesResult, usersResult] = await Promise.all([
      supabase.from('integrations').select('id', { count: 'exact' }).eq('provider', 'slack'),
      supabase.from('slack_messages').select('id', { count: 'exact' }),
      supabase.from('integrations').select('user_id', { count: 'exact' }).eq('provider', 'slack')
    ]);

    const slackConfig = getSlackConfig();
    const configValidation = validateSlackConfig();
    
    const debugInfo: DebugInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        SLACK_SIGNING_SECRET: !!slackConfig.signingSecret,
        NEXT_PUBLIC_SLACK_CLIENT_ID: !!slackConfig.clientId,
        NEXT_PUBLIC_SITE_URL: !!slackConfig.siteUrl,
        // Add environment-specific info
        is_staging: isStagingEnvironment(),
        slack_app_name: getSlackAppName(),
        site_url: slackConfig.siteUrl,
        config_valid: configValidation.isValid,
        missing_vars: configValidation.missing,
      },
      database: {
        integrations_count: integrationsResult.count || 0,
        slack_messages_count: messagesResult.count || 0,
        users_with_slack: usersResult.count || 0,
      },
      recent_errors: getErrorLog(),
    };

    return NextResponse.json(debugInfo);
  } catch (error) {
    logSlackError('/api/integrations/slack/debug', error);
    return NextResponse.json({ 
      error: 'Failed to get debug info',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'test_integration':
        return await testIntegration(data);
      case 'test_user_lookup':
        return await testUserLookup(data);
      case 'test_stream_access':
        return await testStreamAccess(data);
      case 'simulate_pin':
        return await simulatePinMessage(data);
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    logSlackError('/api/integrations/slack/debug', error);
    return NextResponse.json({ 
      error: 'Debug action failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function testIntegration(data: { user_id: string }) {
  try {
    const supabase = await createClient();
    
    // Test finding integration by user ID
    const { data: integration, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', data.user_id)
      .eq('provider', 'slack')
      .eq('is_active', true)
      .single();

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Integration not found',
        details: error
      });
    }

    return NextResponse.json({
      success: true,
      integration: {
        id: integration.id,
        user_id: integration.user_id,
        organization_id: integration.organization_id,
        is_active: integration.is_active,
        metadata: integration.metadata,
        created_at: integration.created_at
      }
    });
  } catch (error) {
    logSlackError('test_integration', error, data);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function testUserLookup(data: { slack_user_id: string }) {
  try {
    const supabase = await createClient();
    
    // Test finding user by Slack user ID
    const { data: integration, error } = await supabase
      .from('integrations')
      .select('user_id, metadata')
      .eq('provider', 'slack')
      .eq('is_active', true)
      .contains('metadata', { authed_user: { id: data.slack_user_id } })
      .single();

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        details: error
      });
    }

    return NextResponse.json({
      success: true,
      user_id: integration.user_id,
      metadata: integration.metadata
    });
  } catch (error) {
    logSlackError('test_user_lookup', error, data);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function testStreamAccess(data: { user_id: string }) {
  try {
    const supabase = await createClient();
    
    // Get user's organization memberships
    const { data: orgMembers, error: orgError } = await supabase
      .from('organization_members')
      .select(`
        organization_id,
        organizations!inner(name)
      `)
      .eq('user_id', data.user_id);

    if (orgError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to get organization memberships',
        details: orgError
      });
    }

    if (!orgMembers || orgMembers.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'User is not a member of any organizations'
      });
    }

    // Get projects for each organization
    const projectPromises = orgMembers.map(async (org) => {
      const { data: projects, error: projectError } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          description,
          project_members!inner(user_id)
        `)
        .eq('organization_id', org.organization_id)
        .eq('project_members.user_id', data.user_id)
        .eq('status', 'active')
        .order('name');

      return {
        organization_id: org.organization_id,
        organization_name: org.organizations.name,
        projects: projects || [],
        error: projectError
      };
    });

    const projectResults = await Promise.all(projectPromises);

    return NextResponse.json({
      success: true,
      organizations: projectResults
    });
  } catch (error) {
    logSlackError('test_stream_access', error, data);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function simulatePinMessage(data: {
  slack_user_id: string;
  project_id: string;
  message_data: Record<string, unknown>;
}) {
  try {
    const supabase = await createClient();
    
    // First, find the user by Slack user ID
    const { data: integration, error: userError } = await supabase
      .from('integrations')
      .select('user_id, metadata')
      .eq('provider', 'slack')
      .eq('is_active', true)
      .contains('metadata', { authed_user: { id: data.slack_user_id } })
      .single();

    if (userError || !integration) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        details: userError
      });
    }

    // Verify user has access to the project
    const { data: projectMember, error: projectError } = await supabase
      .from('project_members')
      .select('id')
      .eq('project_id', data.project_id)
      .eq('user_id', integration.user_id)
      .single();

    if (projectError || !projectMember) {
      return NextResponse.json({
        success: false,
        error: 'User does not have access to this project',
        details: projectError
      });
    }

    // Get project organization
    const { data: project, error: projectOrgError } = await supabase
      .from('projects')
      .select('organization_id')
      .eq('id', data.project_id)
      .single();

    if (projectOrgError || !project) {
      return NextResponse.json({
        success: false,
        error: 'Project not found',
        details: projectOrgError
      });
    }

    // Simulate the pin message call
    const pinResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/integrations/slack/pin-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data.message_data,
        project_id: data.project_id,
        user_id: integration.user_id,
      }),
    });

    const pinResult = await pinResponse.json();

    return NextResponse.json({
      success: pinResponse.ok,
      status: pinResponse.status,
      result: pinResult,
      user_id: integration.user_id,
      project_organization_id: project.organization_id
    });
  } catch (error) {
    logSlackError('simulate_pin', error, data);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
