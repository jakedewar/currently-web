# Currently Integrations

This document provides an overview of the integrations system in Currently and how to use the Slack integration.

## Overview

The integrations system allows Currently to connect with external services to enhance workflow automation and team collaboration. Currently supports various integrations including Slack, GitHub, Zapier, and more.

## Slack Integration

The Slack integration is the first fully implemented integration in Currently. It allows teams to receive real-time notifications about stream updates, task completions, and team activities directly in their Slack channels.

### Features

- **OAuth Authentication**: Secure connection to Slack workspaces
- **Rich Notifications**: Beautiful formatted messages with stream and task details
- **Channel Management**: Choose which Slack channels receive notifications
- **Real-time Updates**: Get notified when streams are created, updated, or completed
- **Task Notifications**: Receive updates when tasks are added or completed
- **Test Messages**: Send test messages to verify the integration is working
- **Webhook Support**: Handle incoming events from Slack (optional)

### Architecture

The Slack integration consists of several components:

#### 1. Database Schema

```sql
-- Integrations table stores all integration configurations
CREATE TABLE integrations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID REFERENCES organizations(id),
  provider TEXT CHECK (provider IN ('slack', 'github', 'zapier', 'google_calendar', 'email')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. API Routes

- `/api/integrations/slack/auth` - OAuth callback handler
- `/api/integrations/slack/status` - Get integration status and settings
- `/api/integrations/slack/test` - Test connection to Slack
- `/api/integrations/slack/settings` - Update integration settings
- `/api/integrations/slack/disconnect` - Disconnect the integration
- `/api/integrations/slack/send-test` - Send a test message
- `/api/integrations/slack/notify` - Send notifications (internal)
- `/api/integrations/slack/webhook` - Handle Slack webhook events

#### 3. Core Libraries

- `lib/integrations/slack.ts` - Slack API client and utilities
- `lib/integrations/notifications.ts` - Notification service
- `hooks/use-slack-notifications.ts` - React hook for sending notifications

#### 4. UI Components

- `components/integrations/slack-integration.tsx` - Main integration management component
- `components/streams/create-stream-dialog-with-slack.tsx` - Example integration usage

### Setup Instructions

1. **Create a Slack App**:
   - Go to [api.slack.com/apps](https://api.slack.com/apps)
   - Create a new app with the required scopes: `channels:read`, `chat:write`, `team:read`

2. **Configure Environment Variables**:
   ```bash
   SLACK_CLIENT_ID=your_slack_client_id
   SLACK_CLIENT_SECRET=your_slack_client_secret
   SLACK_SIGNING_SECRET=your_slack_signing_secret
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   ```

3. **Install the App**:
   - Install the Slack app to your workspace
   - Configure the redirect URI to point to your app

4. **Test the Integration**:
   - Go to the Integrations page in Currently
   - Click "Connect Slack"
   - Configure notification settings
   - Send a test message

### Usage Examples

#### Sending Stream Notifications

```typescript
import { useSlackNotifications } from '@/hooks/use-slack-notifications';

function MyComponent() {
  const { sendStreamNotification } = useSlackNotifications();

  const handleStreamCreated = async (stream) => {
    // Send notification to Slack
    await sendStreamNotification({
      id: stream.id,
      title: stream.title,
      description: stream.description,
      status: stream.status,
      organization_id: organization.id,
    }, 'created');
  };
}
```

#### Sending Task Notifications

```typescript
const { sendTaskNotification } = useSlackNotifications();

const handleTaskCompleted = async (task) => {
  await sendTaskNotification({
    id: task.id,
    title: task.title,
    stream_id: task.stream_id,
    stream_title: task.stream_title,
    status: task.status,
    organization_id: organization.id,
  }, 'completed');
};
```

#### Custom Messages

```typescript
import { NotificationService } from '@/lib/integrations/notifications';

await NotificationService.sendCustomMessage(
  organizationId,
  'general',
  'Custom Title',
  'This is a custom message',
  [
    { title: 'Field 1', value: 'Value 1', short: true },
    { title: 'Field 2', value: 'Value 2', short: true }
  ]
);
```

### Message Formats

The Slack integration sends rich, formatted messages using Slack's Block Kit:

#### Stream Update Message
```
🆕 Stream created
Project Alpha
A new project to improve our workflow
Stream ID: 123e4567-e89b-12d3-a456-426614174000
```

#### Task Update Message
```
✅ Task completed
Fix login bug
In stream: Project Alpha
Task ID: 987fcdeb-51a2-43d1-b789-123456789abc
```

### Security Considerations

- All Slack credentials are stored securely in the database
- OAuth tokens are encrypted and have expiration times
- Webhook endpoints verify Slack signatures (when implemented)
- RLS policies ensure users can only access their own integrations
- Environment variables are used for all sensitive configuration

### Troubleshooting

#### Common Issues

1. **"Invalid redirect URI"**: Check that `NEXT_PUBLIC_SITE_URL` matches your Slack app configuration
2. **"Insufficient permissions"**: Verify your Slack app has the required scopes
3. **Messages not sending**: Ensure the bot is added to the target channel
4. **Connection test fails**: Check that the access token is valid and not expired

#### Debug Mode

Enable debug logging by setting:
```bash
DEBUG_SLACK=true
```

### Future Enhancements

- Token refresh automation
- Webhook signature verification
- Support for Slack threads
- Interactive message buttons
- File upload support
- User mention notifications
- Custom message templates

### Contributing

When adding new integrations:

1. Follow the same pattern as the Slack integration
2. Create the necessary API routes
3. Implement the integration client
4. Add UI components for management
5. Update the database schema if needed
6. Add proper error handling and logging
7. Write comprehensive tests
8. Update documentation

### API Reference

#### SlackIntegration Class

```typescript
class SlackIntegration {
  async getChannels(): Promise<SlackChannel[]>
  async sendMessage(message: SlackMessage): Promise<boolean>
  async sendRichMessage(channel: string, title: string, text: string, fields?: Array<{title: string, value: string, short?: boolean}>): Promise<boolean>
  async getTeamInfo(): Promise<any>
  async testConnection(): Promise<boolean>
}
```

#### NotificationService Class

```typescript
class NotificationService {
  static async sendStreamUpdate(stream: StreamUpdate, updateType: 'created' | 'updated' | 'completed' | 'task_added' | 'task_completed')
  static async sendTaskUpdate(task: TaskUpdate, updateType: 'created' | 'updated' | 'completed' | 'assigned')
  static async sendCustomMessage(organizationId: string, channel: string, title: string, text: string, fields?: Array<{title: string, value: string, short?: boolean}>)
}
```

For more detailed setup instructions, see [SLACK_INTEGRATION_SETUP.md](./SLACK_INTEGRATION_SETUP.md).
