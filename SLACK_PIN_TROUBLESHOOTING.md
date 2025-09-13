# Slack "Pin to Currently" Troubleshooting Guide

## Problem: "Pin to Currently" or "Pin to Stream" functionality not visible in Slack

If you can't see the "Pin to Currently" option when right-clicking on Slack messages, follow this troubleshooting guide.

## Quick Checklist

### 1. ✅ Slack App Installation
- [ ] The Currently Slack app is installed in your workspace
- [ ] You have granted the necessary permissions
- [ ] The app appears in your workspace's app list

### 2. ✅ User Account Linking
- [ ] You have connected your Slack account in Currently (go to Integrations page)
- [ ] Your Slack user ID is properly linked to your Currently account
- [ ] You are a member of at least one Currently stream

### 3. ✅ Slack App Configuration
- [ ] Message shortcuts are enabled in the Slack app
- [ ] Interactive components URL is correctly configured
- [ ] The app has the required OAuth scopes

## Step-by-Step Troubleshooting

### Step 1: Verify Slack App Installation

1. **Check if the app is installed:**
   - Go to your Slack workspace
   - Click on "Apps" in the left sidebar
   - Look for "Currently" in the list
   - If not found, the app needs to be installed

2. **Install the app if missing:**
   - Go to [api.slack.com/apps](https://api.slack.com/apps)
   - Find your "Currently" app
   - Click "Install to Workspace"
   - Grant all requested permissions

### Step 2: Check User Account Linking

1. **Connect your Slack account in Currently:**
   - Go to your Currently app
   - Navigate to Settings → Integrations
   - Click "Connect Slack" on the Slack integration card
   - Complete the OAuth flow

2. **Verify you have access to streams:**
   - Make sure you're a member of at least one active stream
   - The "Pin to Currently" option only appears if you have accessible streams

### Step 3: Verify Slack App Configuration

1. **Check Message Shortcuts:**
   - Go to [api.slack.com/apps](https://api.slack.com/apps)
   - Select your "Currently" app
   - Go to "Interactivity & Shortcuts"
   - Verify "Message Shortcuts" section shows:
     - Name: "Pin to Currently"
     - Type: "message"
     - Callback ID: "pin_message"

2. **Check Interactive Components:**
   - In the same "Interactivity & Shortcuts" section
   - Verify "Interactivity" is enabled
   - Check that the Request URL is set to: `https://your-domain.com/api/integrations/slack/interactive`

3. **Check OAuth Scopes:**
   - Go to "OAuth & Permissions"
   - Verify these scopes are present:
     - `channels:read`
     - `chat:write`
     - `users:read`
     - `groups:read`
     - `im:read`
     - `mpim:read`

### Step 4: Test the Functionality

1. **Test with a simple message:**
   - Go to any Slack channel
   - Right-click on a message
   - Look for "Pin to Currently" in the context menu
   - If not visible, try refreshing Slack or logging out/in

2. **Test the slash command:**
   - Type `/pin-to-currently` in any channel
   - This should trigger the pinning flow

### Step 5: Check Server Logs

If the above steps don't work, check your server logs for errors:

1. **Enable debug logging:**
   ```bash
   # Add to your .env.local
   DEBUG_SLACK=true
   SLACK_DEBUG=true
   ```

2. **Check for common errors:**
   - Signature verification failures
   - User not found errors
   - Stream access permission errors
   - Database connection issues

## Common Issues and Solutions

### Issue 1: "Pin to Currently" not in context menu

**Cause:** Message shortcuts not properly configured or app not installed

**Solution:**
1. Reinstall the Slack app
2. Verify message shortcuts are enabled in app settings
3. Check that the interactive components URL is correct

### Issue 2: Modal doesn't appear when clicking "Pin to Currently"

**Cause:** Interactive components URL not accessible or returning errors

**Solution:**
1. Test the URL: `https://your-domain.com/api/integrations/slack/interactive`
2. Check server logs for errors
3. Verify the endpoint is returning proper responses

### Issue 3: "No streams found" error

**Cause:** User not a member of any streams or streams are inactive

**Solution:**
1. Ensure user is a member of at least one active stream
2. Check stream status in Currently
3. Verify organization membership

### Issue 4: "User not found" error

**Cause:** Slack user ID not linked to Currently account

**Solution:**
1. Reconnect Slack account in Currently
2. Verify the OAuth flow completed successfully
3. Check that the user record exists in the database

## Environment Variables Check

Make sure these are set in your `.env.local`:

```env
# Required for Slack integration
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
SLACK_SIGNING_SECRET=your_slack_signing_secret
SLACK_BOT_TOKEN=xoxb-your-bot-token

# Your app's base URL (must match Slack app configuration)
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Testing Checklist

- [ ] Slack app is installed in workspace
- [ ] User has connected Slack account in Currently
- [ ] User is member of at least one active stream
- [ ] Message shortcuts are enabled in Slack app
- [ ] Interactive components URL is correct and accessible
- [ ] OAuth scopes are properly configured
- [ ] Environment variables are set correctly
- [ ] Server is running and accessible
- [ ] Database is accessible and migrations are applied

## Still Not Working?

If you've gone through all these steps and the "Pin to Currently" functionality still isn't working:

1. **Check the browser console** for JavaScript errors
2. **Check server logs** for API errors
3. **Test the endpoints directly** using curl or Postman
4. **Verify your domain** is accessible from Slack's servers
5. **Check Slack's app status** in the Slack API dashboard

## Support

For additional help:
1. Check the [Slack API documentation](https://api.slack.com/)
2. Review the [Currently Slack integration code](https://github.com/your-repo)
3. Contact support with specific error messages and logs
