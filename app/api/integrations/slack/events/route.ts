import { NextRequest, NextResponse } from 'next/server';
import { verifySlackRequest } from '@/lib/integrations/slack-verification';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signingSecret = process.env.SLACK_SIGNING_SECRET;

    if (!signingSecret) {
      console.error('SLACK_SIGNING_SECRET not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Verify the request signature
    const verification = verifySlackRequest(body, request.headers, signingSecret);
    if (!verification.isValid) {
      console.error('Slack request verification failed:', verification.error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = JSON.parse(body);

    // Handle URL verification challenge
    if (payload.type === 'url_verification') {
      return NextResponse.json({ challenge: payload.challenge });
    }

    // Handle events
    if (payload.type === 'event_callback') {
      const event = payload.event;
      
      // Log the event for debugging
      console.log('Slack event received:', {
        type: event.type,
        channel: event.channel,
        user: event.user,
        text: event.text?.substring(0, 100),
      });

      // For now, we just acknowledge the event
      // In the future, we could process message events here
      // to automatically sync reactions, edits, etc.
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('Error in Slack events endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
