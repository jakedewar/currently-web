# Slack Integration Debugging Guide

## Overview

This guide helps you debug issues with the Slack integration, particularly the "Pin to Currently" functionality that was showing errors.

## New Debugging Tools

### 1. Debug Console UI
- **Location**: `/protected/integrations` page
- **Component**: Slack Debug Console
- **Features**:
  - Real-time system health check
  - Environment variable validation
  - Database statistics
  - Recent error logs
  - Copy debug information to clipboard

### 2. Debug API Endpoint
- **URL**: `/api/integrations/slack/debug`
- **Methods**: GET, POST
- **Features**:
  - System information
  - Error logging
  - Test functions for integration validation

### 3. Enhanced Error Logging
- **Location**: All Slack API endpoints
- **Features**:
  - Detailed error context
  - Request/response logging
  - User action tracking
  - In-memory error storage (last 50 errors)

## How to Debug the "Pin to Currently" Error

### Step 1: Check System Health
1. Go to `/protected/integrations`
2. Scroll down to the "Slack Debug Console"
3. Click "Run Diagnostics"
4. Review the test results

### Step 2: Check Recent Errors
1. In the debug console, look at the "Recent Errors" section
2. Look for errors with timestamps around when you tried to pin a message
3. Check the error details for specific failure points

### Step 3: Test Integration Components
Use the debug API to test individual components:

```bash
# Test user lookup by Slack user ID
curl -X POST http://localhost:3000/api/integrations/slack/debug \
  -H "Content-Type: application/json" \
  -d '{"action": "test_user_lookup", "data": {"slack_user_id": "U1234567890"}}'

# Test stream access for a user
curl -X POST http://localhost:3000/api/integrations/slack/debug \
  -H "Content-Type: application/json" \
  -d '{"action": "test_stream_access", "data": {"user_id": "your-user-id"}}'
```

### Step 4: Monitor Real-time Logs
1. Open your terminal where the Next.js app is running
2. Look for `[SLACK DEBUG]` prefixed log messages
3. Try pinning a message in Slack
4. Watch the console for detailed logging

## Common Issues and Solutions

### Issue 1: "Sorry, that didn't work. Try again?"
**Possible Causes**:
- User not found in integrations table
- Missing environment variables
- Database connection issues
- Invalid Slack user ID mapping

**Debug Steps**:
1. Check if the user has a Slack integration: Look in the debug console
2. Verify environment variables are set
3. Check the recent errors for specific failure details

### Issue 2: POST /auth/login 200 in Terminal
**SOLUTION FOUND**: This was caused by the middleware redirecting Slack API calls to the login page.

**Root Cause**: The middleware was intercepting ALL API calls (including Slack webhooks) and redirecting them to `/auth/login` if there was no authenticated user session. Since Slack webhooks don't have user sessions, they were being redirected.

**Fix Applied**: Updated the middleware to exclude Slack API endpoints from authentication checks by adding:
```typescript
!request.nextUrl.pathname.startsWith("/api/integrations/slack/")
```

**Debug Steps**:
1. The fix has been applied - try pinning a message again
2. You should now see detailed `[SLACK DEBUG]` logs instead of login redirects
3. Check the terminal for the new debug output

### Issue 3: "You need to connect your Slack account to Currently first"
**SOLUTION FOUND**: Integration lookup was failing due to inefficient query method.

**Root Cause**: The original code was fetching all Slack integrations and filtering in JavaScript, which is not scalable. The integration exists but wasn't being found properly.

**Fix Applied**: 
1. Created a database function `find_slack_integration_by_user_id()` for efficient JSON queries
2. Updated the code to use proper database queries instead of client-side filtering
3. This approach is now scalable and multi-tenant friendly

**Debug Steps**:
1. Check the debug logs for `Total active Slack integrations: X`
2. Look for `found_integration: true` in the integration search results
3. If `found_integration: false`, the user needs to connect Slack first
4. The new approach uses efficient database queries instead of fetching all records

## Debug API Reference

### GET /api/integrations/slack/debug
Returns system information and recent errors.

**Response**:
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": {
    "SLACK_SIGNING_SECRET": true,
    "NEXT_PUBLIC_SLACK_CLIENT_ID": true,
    "NEXT_PUBLIC_SITE_URL": true
  },
  "database": {
    "integrations_count": 5,
    "slack_messages_count": 12,
    "users_with_slack": 3
  },
  "recent_errors": [...]
}
```

### POST /api/integrations/slack/debug
Test specific integration components.

**Actions**:
- `test_integration`: Test integration lookup by user ID
- `test_user_lookup`: Test user lookup by Slack user ID
- `test_stream_access`: Test user's stream access
- `simulate_pin`: Simulate pinning a message

## Enhanced Logging

All Slack endpoints now include detailed logging:

### Interactive Endpoint (`/api/integrations/slack/interactive`)
- Logs incoming payloads
- Tracks user actions
- Records modal interactions
- Logs API calls to pin-message endpoint

### Pin Message Endpoint (`/api/integrations/slack/pin-message`)
- Validates all required fields
- Logs database operations
- Tracks success/failure of message pinning
- Records detailed error information

## Troubleshooting Checklist

- [ ] Environment variables are set correctly
- [ ] Slack app is installed in the workspace
- [ ] User has connected their Slack account
- [ ] Integration is marked as active in the database
- [ ] User has access to at least one stream
- [ ] Slack signing secret is correct
- [ ] No recent errors in the debug console

## Next Steps

1. **Test the debugging tools**: Use the debug console to check system health
2. **Try pinning a message**: Watch the console logs for detailed information
3. **Check error logs**: Review any errors that appear in the debug console
4. **Use the debug API**: Test individual components if needed

## Support

If you continue to experience issues:
1. Copy the debug information from the console
2. Check the recent errors section
3. Look at the terminal logs for `[SLACK DEBUG]` messages
4. Use the debug API to test specific components

The enhanced logging should now provide much more detailed information about what's happening when you try to pin messages in Slack.
