# Slack App Setup for Currently Integration

This guide explains how to set up the Slack app to enable "Pin to Currently" functionality.

## Overview

The Slack integration allows users to pin important Slack messages directly to Currently streams, keeping important discussions organized and easily accessible.

## Slack App Configuration

### 1. Create a Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Name your app: "Currently"
4. Select your workspace
5. Click "Create App"

### 2. App Manifest

Use this manifest configuration:

```json
{
  "display_information": {
    "name": "Currently",
    "description": "Pin important Slack messages to your Currently streams",
    "background_color": "#4A90E2",
    "long_description": "Currently helps teams organize important Slack discussions by allowing you to pin messages directly to project streams. Never lose track of important decisions, discussions, or updates again."
  },
  "features": {
    "bot_user": {
      "display_name": "Currently",
      "always_online": true
    },
    "slash_commands": [
      {
        "command": "/pin-to-currently",
        "description": "Pin a message to a Currently stream",
        "usage_hint": "[stream-name]",
        "should_escape": false
      }
    ]
  },
  "oauth_config": {
    "scopes": {
      "user": [
        "channels:read",
        "groups:read",
        "im:read",
        "mpim:read",
        "users:read"
      ],
      "bot": [
        "channels:read",
        "groups:read",
        "im:read",
        "mpim:read",
        "chat:write",
        "users:read"
      ]
    }
  },
  "settings": {
    "interactivity": {
      "is_enabled": true,
      "request_url": "https://your-domain.com/api/integrations/slack/interactive"
    },
    "event_subscriptions": {
      "is_enabled": true,
      "request_url": "https://your-domain.com/api/integrations/slack/events",
      "bot_events": [
        "message.channels",
        "message.groups",
        "message.im",
        "message.mpim"
      ]
    },
    "org_deploy_enabled": false,
    "socket_mode_enabled": false,
    "token_rotation_enabled": false
  }
}
```

### 3. Environment Variables

Add these to your `.env.local`:

```env
# Slack App Configuration
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
SLACK_SIGNING_SECRET=your_slack_signing_secret
SLACK_BOT_TOKEN=xoxb-your-bot-token

# Your app's base URL
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 4. Install the App

1. In your Slack app settings, go to "Install App"
2. Click "Install to Workspace"
3. Copy the Bot User OAuth Token (starts with `xoxb-`)
4. Add it to your environment variables

## How It Works

### For Users

1. **Pin a Message**: Right-click on any Slack message and select "Pin to Currently" (or use `/pin-to-currently` command)
2. **Select Stream**: Choose which Currently stream to pin the message to
3. **View in Currently**: The message appears in the "Slack Messages" tab of the selected stream

### For Developers

The integration works through several components:

1. **Slack App**: Handles user interactions and message events
2. **Webhook Endpoints**: Receive data from Slack
3. **Database**: Stores linked messages in the `slack_messages` table
4. **UI Components**: Display linked messages in stream views

## API Endpoints

- `POST /api/integrations/slack/pin-message` - Pin a message to a stream
- `GET /api/streams/[id]/slack-messages` - Get messages for a stream
- `DELETE /api/streams/[id]/slack-messages/[messageId]` - Remove a message from a stream

## Testing

1. Install the app in your Slack workspace
2. Test the slash command: `/pin-to-currently`
3. Right-click on a message and select "Pin to Currently"
4. Verify messages appear in your Currently streams

## Complete Setup Checklist

### 1. Database Setup
- [ ] Run the database migration: `supabase db push`
- [ ] Verify `slack_messages` table exists

### 2. Environment Variables
Add these to your `.env.local`:
```env
# Slack App Configuration
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
SLACK_SIGNING_SECRET=your_slack_signing_secret
SLACK_BOT_TOKEN=xoxb-your-bot-token

# Your app's base URL
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 3. Slack App Configuration
- [ ] Create app at [api.slack.com/apps](https://api.slack.com/apps)
- [ ] Use the provided manifest or configure manually
- [ ] Set up OAuth scopes: `channels:read`, `chat:write`, `team:read`, `users:read`
- [ ] Configure interactive components URL: `https://your-domain.com/api/integrations/slack/interactive`
- [ ] Configure event subscriptions URL: `https://your-domain.com/api/integrations/slack/events`
- [ ] Add slash command: `/pin-to-currently` → `https://your-domain.com/api/integrations/slack/slash-command`
- [ ] Add message shortcut: "Pin to Currently" with callback_id: `pin_message`

### 4. User Linking
Users need to link their Slack accounts to Currently:
- [ ] Go to Currently Integrations page
- [ ] Connect Slack workspace
- [ ] This creates the OAuth connection needed for the app to work

### 5. Testing
- [ ] Test slash command: `/pin-to-currently`
- [ ] Test message shortcut: Right-click message → "Pin to Currently"
- [ ] Verify messages appear in stream's "Slack Messages" section
- [ ] Test error handling (try with no streams, invalid permissions, etc.)

## Troubleshooting

### Common Issues

1. **"User not found" error**: User needs to connect their Slack account in Currently first
2. **"No streams found"**: User needs to be a member of at least one active stream
3. **"Invalid signature"**: Check that `SLACK_SIGNING_SECRET` is correct
4. **Modal doesn't appear**: Check that interactive components URL is correct
5. **Slash command not working**: Verify the command URL is set correctly

### Debug Mode
Enable debug logging by setting:
```env
DEBUG_SLACK=true
```

### Logs
Check your server logs for detailed error information:
- Slack API calls
- Database queries
- Signature verification
- User authentication

### Common Issues

1. **App not responding**: Check that your webhook URLs are accessible and returning 200 status codes
2. **Messages not appearing**: Verify the user has access to the target stream
3. **Permission errors**: Ensure the app has the correct OAuth scopes

### Debug Mode

Enable debug logging by setting:
```env
SLACK_DEBUG=true
```

## Security Considerations

- All webhook endpoints verify Slack signatures
- Users can only pin messages to streams they have access to
- Messages are stored securely with proper RLS policies
- Bot tokens are stored encrypted in the database

## Future Enhancements

- Bulk message pinning
- Message threading support
- Rich message formatting
- Integration with other Slack features (reactions, attachments)
- Search functionality across pinned messages
