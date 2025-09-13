# Slack Integration Setup Guide

This guide will help you set up the Slack integration for your Currently app.

## Prerequisites

1. A Slack workspace where you have admin permissions
2. Access to your Currently app's environment variables

## Step 1: Create a Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App"
3. Choose "From scratch"
4. Enter your app name (e.g., "Currently Integration")
5. Select your workspace
6. Click "Create App"

## Step 2: Configure OAuth & Permissions

1. In your Slack app settings, go to "OAuth & Permissions"
2. Add the following Bot Token Scopes:
   - `channels:read` - View basic information about public channels
   - `chat:write` - Send messages as the app
   - `team:read` - View the workspace name and domain

3. Copy the "Client ID" and "Client Secret" - you'll need these for your environment variables

## Step 3: Set Up Event Subscriptions (Optional)

If you want to receive events from Slack (like new messages), you can set up event subscriptions:

1. Go to "Event Subscriptions" in your Slack app settings
2. Enable Events
3. Set the Request URL to: `https://your-domain.com/api/integrations/slack/webhook`
4. Subscribe to the following Bot Events:
   - `message.channels` - Listen to messages in channels
   - `channel_created` - Listen for new channel creation
   - `channel_deleted` - Listen for channel deletion

## Step 4: Install the App

1. Go to "Install App" in your Slack app settings
2. Click "Install to Workspace"
3. Review the permissions and click "Allow"

## Step 5: Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Slack Integration
SLACK_CLIENT_ID=your_slack_client_id_here
SLACK_CLIENT_SECRET=your_slack_client_secret_here
SLACK_SIGNING_SECRET=your_slack_signing_secret_here
```

## Step 6: Update Your App URL

Make sure your `NEXT_PUBLIC_SITE_URL` environment variable is set to your production domain:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Step 7: Test the Integration

1. Go to your Currently app's Integrations page
2. Click "Connect Slack" on the Slack integration card
3. Authorize the app in Slack
4. Configure your notification settings
5. Send a test message to verify everything is working

## Features

Once set up, the Slack integration provides:

- **Stream Notifications**: Get notified when streams are created, updated, or completed
- **Task Notifications**: Receive updates when tasks are added or completed
- **Rich Messages**: Beautiful formatted messages with stream details
- **Channel Selection**: Choose which Slack channel receives notifications
- **Test Messages**: Send test messages to verify the integration is working

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**: Make sure your `NEXT_PUBLIC_SITE_URL` matches your Slack app's redirect URI
2. **"Insufficient permissions" error**: Check that your Slack app has the required scopes
3. **Messages not sending**: Verify that the bot is added to the target channel
4. **Webhook not receiving events**: Check that your webhook URL is accessible and returns a 200 status

### Debug Mode

You can enable debug logging by setting:

```bash
DEBUG_SLACK=true
```

This will log detailed information about Slack API calls and webhook events.

## Security Notes

- Never commit your Slack credentials to version control
- Use environment variables for all sensitive configuration
- Regularly rotate your Slack app credentials
- Monitor your Slack app's usage and permissions

## Support

If you encounter issues:

1. Check the browser console for JavaScript errors
2. Check your server logs for API errors
3. Verify your Slack app configuration
4. Test the integration with a simple message first

For additional help, refer to the [Slack API documentation](https://api.slack.com/).
