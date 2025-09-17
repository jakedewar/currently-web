import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSlackConfig } from '@/lib/integrations/slack-config';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL(`/protected/integrations?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/protected/integrations?error=missing_parameters', request.url)
    );
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.redirect(
        new URL('/auth/login?error=unauthorized', request.url)
      );
    }

    // Exchange code for access token
    const slackConfig = getSlackConfig();
    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: slackConfig.clientId,
        client_secret: slackConfig.clientSecret,
        code,
        redirect_uri: `${slackConfig.siteUrl}/api/integrations/slack/auth`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.ok) {
      console.error('Slack OAuth error:', tokenData);
      return NextResponse.redirect(
        new URL('/protected/integrations?error=slack_auth_failed', request.url)
      );
    }

    // Get team info
    const teamResponse = await fetch('https://slack.com/api/team.info', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    const teamData = await teamResponse.json();

    // Store the integration in the database
    console.log('[SLACK DEBUG] Storing integration:', {
      user_id: user.id,
      organization_id: state,
      team_id: tokenData.team.id,
      authed_user_id: tokenData.authed_user.id
    });

    const { error: dbError } = await supabase
      .from('integrations')
      .upsert({
        user_id: user.id,
        organization_id: state, // state contains the organization_id
        provider: 'slack',
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: tokenData.expires_in 
          ? new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString()
          : null,
        metadata: {
          team_id: tokenData.team.id,
          team_name: teamData.team?.name,
          team_domain: tokenData.team?.domain,
          authed_user: tokenData.authed_user,
          scope: tokenData.scope,
        },
        is_active: true,
      }, {
        onConflict: 'user_id,organization_id,provider'
      });

    if (dbError) {
      console.error('[SLACK DEBUG] Database error:', dbError);
      return NextResponse.redirect(
        new URL('/protected/integrations?error=database_error', request.url)
      );
    }

    console.log('[SLACK DEBUG] Integration stored successfully');

    return NextResponse.redirect(
      new URL('/protected/integrations?success=slack_connected', request.url)
    );

  } catch (error) {
    console.error('Slack OAuth error:', error);
    return NextResponse.redirect(
      new URL('/protected/integrations?error=unexpected_error', request.url)
    );
  }
}
