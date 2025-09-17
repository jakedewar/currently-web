# Slack Integration Environment Setup Guide

This guide explains how to set up separate Slack integrations for testing (staging) and production environments.

## Overview

The Slack integration now supports both staging and production environments with separate Slack apps. This allows you to test the integration without affecting your production setup.

## Environment Detection

The system automatically detects the environment based on:

1. **Staging Environment** (uses staging Slack app):
   - `NODE_ENV === 'development'` (local development)
   - `VERCEL_ENV === 'preview'` (Vercel preview deployments)
   - Presence of `NEXT_STAGING_PUBLIC_SITE_URL` environment variable

2. **Production Environment** (uses production Slack app):
   - `NODE_ENV === 'production'` and `VERCEL_ENV === 'production'`
   - No staging environment variables present

## Environment Variables

### Production Environment Variables

```env
# Production Slack App Configuration
NEXT_PUBLIC_SLACK_CLIENT_ID=your_production_slack_client_id
SLACK_CLIENT_SECRET=your_production_slack_client_secret
SLACK_SIGNING_SECRET=your_production_slack_signing_secret
SLACK_BOT_TOKEN=your_production_slack_bot_token

# Production Site URL
NEXT_PUBLIC_SITE_URL=https://currently.team
```

### Staging Environment Variables

```env
# Staging Slack App Configuration
NEXT_PUBLIC_SLACK_STAGING_CLIENT_ID=your_staging_slack_client_id
SLACK_STAGING_CLIENT_SECRET=your_staging_slack_client_secret
SLACK_STAGING_SIGNING_SECRET=your_staging_slack_signing_secret
SLACK_STAGING_BOT_TOKEN=your_staging_slack_bot_token

# Staging Site URL (for local development, use ngrok or similar)
NEXT_STAGING_PUBLIC_SITE_URL=https://your-staging-domain.com
# OR for local development:
NEXT_STAGING_PUBLIC_SITE_URL=https://your-ngrok-url.ngrok.io
```

## Slack App Setup

### 1. Production Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Create a new app called "Currently"
3. Use the `slack-app-manifest.json` file to configure the app
4. Update the URLs in the manifest to point to `https://currently.team`
5. Install the app to your workspace
6. Copy the credentials to your production environment variables

### 2. Staging Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Create a new app called "Currently-Staging"
3. Use the `slack-app-manifest-staging.json` file to configure the app
4. Update the URLs in the staging manifest to point to your staging domain
5. Install the app to your workspace
6. Copy the credentials to your staging environment variables

## Local Development Setup

For local development, you'll need to expose your local server to the internet so Slack can reach your webhooks.

### Option 1: Using ngrok (Recommended)

1. Install ngrok: `npm install -g ngrok`
2. Start your Next.js development server: `npm run dev`
3. In another terminal, expose your local server: `ngrok http 3000`
4. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
5. Set your staging environment variable: `NEXT_STAGING_PUBLIC_SITE_URL=https://abc123.ngrok.io`
6. Update your staging Slack app manifest with the ngrok URL

### Option 2: Using Vercel Preview Deployments

1. Push your changes to a branch
2. Create a pull request
3. Vercel will create a preview deployment
4. The system will automatically use staging configuration for preview deployments

## Testing

### 1. Environment Detection Test

Visit `/api/integrations/slack/debug` to see which environment is being used:

```json
{
  "environment": {
    "is_staging": true,
    "slack_app_name": "Currently-Staging",
    "site_url": "https://your-staging-domain.com",
    "config_valid": true,
    "missing_vars": []
  }
}
```

### 2. Slack Integration Test

1. Go to the Integrations page in your app
2. You should see "Environment: Staging" or "Environment: Production" in the Slack integration card
3. The Slack app name should show "Currently-Staging" or "Currently"
4. Test connecting to Slack - it should use the appropriate app

### 3. Message Pinning Test

1. Connect your Slack account
2. Try pinning a message using the "Pin to Currently" shortcut
3. Verify the message appears in your Currently streams

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**:
   - Check that your `NEXT_PUBLIC_SITE_URL` or `NEXT_STAGING_PUBLIC_SITE_URL` matches your Slack app configuration
   - Ensure the URL is accessible from the internet (use ngrok for local development)

2. **"Invalid signature" error**:
   - Verify that your `SLACK_SIGNING_SECRET` or `SLACK_STAGING_SIGNING_SECRET` is correct
   - Make sure you're using the right secret for the right environment

3. **Wrong Slack app being used**:
   - Check the environment detection by visiting `/api/integrations/slack/debug`
   - Verify your environment variables are set correctly

4. **Environment not detected correctly**:
   - Check that `NODE_ENV` is set correctly
   - For Vercel deployments, check `VERCEL_ENV`
   - For local development, ensure `NEXT_STAGING_PUBLIC_SITE_URL` is set

### Debug Information

The debug endpoint (`/api/integrations/slack/debug`) provides comprehensive information about:

- Current environment (staging vs production)
- Slack app being used
- Environment variables status
- Configuration validation
- Recent errors

## File Structure

```
├── lib/integrations/slack-config.ts          # Environment detection and configuration
├── slack-app-manifest.json                   # Production Slack app manifest
├── slack-app-manifest-staging.json          # Staging Slack app manifest
├── components/integrations/slack-integration.tsx  # Updated UI component
└── app/api/integrations/slack/               # Updated API routes
    ├── auth/route.ts
    ├── interactive/route.ts
    ├── events/route.ts
    ├── slash-command/route.ts
    └── debug/route.ts
```

## Migration from Single Environment

If you're migrating from a single Slack app setup:

1. Create the new staging Slack app
2. Add the staging environment variables
3. Update your existing production Slack app manifest with the correct URLs
4. Test both environments
5. The system will automatically use the appropriate configuration based on the environment

## Best Practices

1. **Always test in staging first** before deploying to production
2. **Use descriptive names** for your Slack apps (e.g., "Currently-Staging")
3. **Keep environment variables organized** - use clear naming conventions
4. **Monitor the debug endpoint** to ensure correct environment detection
5. **Use ngrok for local development** to test webhook functionality
6. **Document your staging URLs** so team members can use the same setup
