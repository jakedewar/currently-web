import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verify the request is from Slack (optional but recommended)
    // const slackSignature = request.headers.get('x-slack-signature');
    // const slackTimestamp = request.headers.get('x-slack-request-timestamp');
    
    // Handle URL verification challenge
    if (body.type === 'url_verification') {
      return NextResponse.json({ challenge: body.challenge });
    }

    // Handle events
    if (body.type === 'event_callback') {
      const event = body.event;
      
      // Handle different event types
      switch (event.type) {
        case 'message':
          await handleSlackMessage(event);
          break;
        case 'channel_created':
          await handleChannelCreated(event);
          break;
        case 'channel_deleted':
          await handleChannelDeleted(event);
          break;
        default:
          console.log('Unhandled Slack event type:', event.type);
      }
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('Slack webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleSlackMessage(event: Record<string, unknown>) {
  // Handle incoming messages from Slack
  // This could be used to create tasks or update streams based on Slack messages
  console.log('Received Slack message:', event);
  
  // Example: If someone mentions a stream in Slack, we could update it
  // This would require parsing the message and matching it to existing streams
}

async function handleChannelCreated(event: Record<string, unknown>) {
  // Handle new channel creation
  // Could automatically create a corresponding stream or update integration metadata
  console.log('New Slack channel created:', event);
}

async function handleChannelDeleted(event: Record<string, unknown>) {
  // Handle channel deletion
  // Could clean up related streams or update integration metadata
  console.log('Slack channel deleted:', event);
}
