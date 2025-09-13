# Currently Slack Integration - Complete Setup Guide

## Overview

The Currently Slack integration allows users to pin important Slack messages directly to Currently streams, keeping important discussions organized and easily accessible. This integration includes:

- **Message Pinning**: Right-click any Slack message and pin it to a Currently stream
- **Slash Commands**: Use `/pin-to-currently` to get help and see available streams
- **Rich Notifications**: Get notified in Slack when streams and tasks are updated
- **Secure Authentication**: OAuth-based connection with signature verification

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Slack App     │    │   Currently API  │    │   Database      │
│                 │    │                  │    │                 │
│ • Message       │───▶│ • Interactive    │───▶│ • slack_messages│
│   Shortcuts     │    │   Components     │    │ • integrations  │
│ • Slash Commands│    │ • Webhooks       │    │ • streams       │
│ • Bot Events    │    │ • OAuth          │    │ • organizations │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Quick Start

### 1. Database Setup
```bash
# Run the migration to create the slack_messages table
supabase db push
```

### 2. Environment Variables
Add to your `.env.local`:
```env
# Slack App Configuration
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
SLACK_SIGNING_SECRET=your_slack_signing_secret
SLACK_BOT_TOKEN=xoxb-your-bot-token

# Your app's base URL
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 3. Create Slack App
1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Name: "Currently"
4. Select your workspace
5. Use the provided manifest or configure manually

### 4. Configure Slack App
- **OAuth Scopes**: `channels:read`, `chat:write`, `team:read`, `users:read`
- **Interactive Components**: `https://your-domain.com/api/integrations/slack/interactive`
- **Event Subscriptions**: `https://your-domain.com/api/integrations/slack/events`
- **Slash Command**: `/pin-to-currently` → `https://your-domain.com/api/integrations/slack/slash-command`
- **Message Shortcut**: "Pin to Currently" with callback_id: `pin_message`

### 5. Install and Test
1. Install the app to your workspace
2. Connect your Slack account in Currently (Integrations page)
3. Test: `/pin-to-currently` in any channel
4. Test: Right-click a message → "Pin to Currently"

## API Endpoints

### Interactive Components
- **POST** `/api/integrations/slack/interactive`
  - Handles message shortcuts and modal submissions
  - Verifies Slack signatures for security
  - Shows stream selection modal

### Slash Commands
- **POST** `/api/integrations/slack/slash-command`
  - Handles `/pin-to-currently` command
  - Lists available streams
  - Provides usage instructions

### Event Subscriptions
- **POST** `/api/integrations/slack/events`
  - Handles Slack events (messages, etc.)
  - URL verification for Slack
  - Future: Auto-sync reactions, edits

### Message Management
- **POST** `/api/integrations/slack/pin-message`
  - Pins a Slack message to a stream
  - Validates user permissions
  - Stores message data

- **GET** `/api/streams/[id]/slack-messages`
  - Retrieves pinned messages for a stream
  - Includes message stats

- **DELETE** `/api/streams/[id]/slack-messages/[messageId]`
  - Removes a pinned message
  - Validates ownership

## Database Schema

### slack_messages Table
```sql
CREATE TABLE slack_messages (
    id UUID PRIMARY KEY,
    stream_id UUID REFERENCES streams(id),
    organization_id UUID REFERENCES organizations(id),
    slack_message_id TEXT NOT NULL,
    slack_channel_id TEXT NOT NULL,
    slack_channel_name TEXT NOT NULL,
    slack_user_id TEXT NOT NULL,
    slack_user_name TEXT NOT NULL,
    slack_user_display_name TEXT,
    message_text TEXT NOT NULL,
    message_timestamp TIMESTAMPTZ NOT NULL,
    thread_ts TEXT,
    permalink TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    reactions JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Security Features

### Signature Verification
All webhook requests are verified using Slack's signature verification:
- Uses HMAC-SHA256 with signing secret
- Validates request timestamp (5-minute window)
- Prevents replay attacks

### Row Level Security (RLS)
- Users can only see messages for streams they have access to
- Users can only pin messages to streams they're members of
- Users can only delete messages they created

### OAuth Integration
- Secure token-based authentication
- Scoped permissions (read channels, write messages)
- Token expiration handling

## User Experience

### For End Users
1. **Connect Account**: Go to Currently → Integrations → Connect Slack
2. **Pin Messages**: Right-click any Slack message → "Pin to Currently"
3. **Select Stream**: Choose which stream to pin the message to
4. **View in Currently**: Messages appear in the stream's "Slack Messages" tab

### For Developers
```typescript
// Send notifications to Slack
import { useSlackNotifications } from '@/hooks/use-slack-notifications';

const { sendStreamNotification } = useSlackNotifications();
await sendStreamNotification(stream, 'created');

// Manage Slack messages
import { SlackMessageService } from '@/lib/integrations/slack-messages';

const messages = await SlackMessageService.getStreamMessages(streamId);
```

## Troubleshooting

### Common Issues

1. **"User not found"**
   - User needs to connect Slack account in Currently first
   - Check that OAuth integration is properly configured

2. **"No streams found"**
   - User needs to be a member of at least one active stream
   - Verify stream membership in Currently

3. **"Invalid signature"**
   - Check `SLACK_SIGNING_SECRET` environment variable
   - Ensure webhook URLs are correct

4. **Modal doesn't appear**
   - Verify interactive components URL is accessible
   - Check Slack app configuration

5. **Slash command not working**
   - Verify command URL is set correctly
   - Check that the endpoint is accessible

### Debug Mode
```env
DEBUG_SLACK=true
```

### Logs to Check
- Server logs for API errors
- Slack app event logs
- Database query logs
- Signature verification logs

## Future Enhancements

- [ ] Token refresh automation
- [ ] Interactive message buttons
- [ ] File upload support
- [ ] User mention notifications
- [ ] Custom message templates
- [ ] Thread support
- [ ] Reaction syncing
- [ ] Message editing sync

## Support

For issues:
1. Check the troubleshooting section
2. Review server logs
3. Verify Slack app configuration
4. Test with a simple message first

## Files Created/Modified

### New Files
- `supabase/migrations/20241204000000_create_slack_messages.sql`
- `slack-app-manifest.json`
- `lib/integrations/slack-verification.ts`
- `app/api/integrations/slack/slash-command/route.ts`

### Modified Files
- `app/api/integrations/slack/interactive/route.ts` (added signature verification)
- `app/api/integrations/slack/events/route.ts` (added signature verification)
- `SLACK_APP_SETUP.md` (updated with complete instructions)

The Slack integration is now complete and ready for production use! 🎉
