import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logSlackError, getErrorLog } from '@/lib/integrations/slack-debug';

interface DebugInfo {
  timestamp: string;
  environment: {
    SLACK_SIGNING_SECRET: boolean;
    NEXT_PUBLIC_SLACK_CLIENT_ID: boolean;
    NEXT_PUBLIC_SITE_URL: boolean;
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

    const debugInfo: DebugInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        SLACK_SIGNING_SECRET: !!process.env.SLACK_SIGNING_SECRET,
        NEXT_PUBLIC_SLACK_CLIENT_ID: !!process.env.NEXT_PUBLIC_SLACK_CLIENT_ID,
        NEXT_PUBLIC_SITE_URL: !!process.env.NEXT_PUBLIC_SITE_URL,
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

    // Get streams for each organization
    const streamPromises = orgMembers.map(async (org) => {
      const { data: streams, error: streamError } = await supabase
        .from('streams')
        .select(`
          id,
          name,
          description,
          stream_members!inner(user_id)
        `)
        .eq('organization_id', org.organization_id)
        .eq('stream_members.user_id', data.user_id)
        .eq('status', 'active')
        .order('name');

      return {
        organization_id: org.organization_id,
        organization_name: org.organizations.name,
        streams: streams || [],
        error: streamError
      };
    });

    const streamResults = await Promise.all(streamPromises);

    return NextResponse.json({
      success: true,
      organizations: streamResults
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
  stream_id: string;
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

    // Verify user has access to the stream
    const { data: streamMember, error: streamError } = await supabase
      .from('stream_members')
      .select('id')
      .eq('stream_id', data.stream_id)
      .eq('user_id', integration.user_id)
      .single();

    if (streamError || !streamMember) {
      return NextResponse.json({
        success: false,
        error: 'User does not have access to this stream',
        details: streamError
      });
    }

    // Get stream organization
    const { data: stream, error: streamOrgError } = await supabase
      .from('streams')
      .select('organization_id')
      .eq('id', data.stream_id)
      .single();

    if (streamOrgError || !stream) {
      return NextResponse.json({
        success: false,
        error: 'Stream not found',
        details: streamOrgError
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
        stream_id: data.stream_id,
        user_id: integration.user_id,
      }),
    });

    const pinResult = await pinResponse.json();

    return NextResponse.json({
      success: pinResponse.ok,
      status: pinResponse.status,
      result: pinResult,
      user_id: integration.user_id,
      stream_organization_id: stream.organization_id
    });
  } catch (error) {
    logSlackError('simulate_pin', error, data);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
