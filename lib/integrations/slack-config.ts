/**
 * Environment-specific Slack configuration
 * Handles both staging and production Slack app configurations
 */

export interface SlackConfig {
  clientId: string;
  clientSecret: string;
  signingSecret: string;
  botToken?: string;
  siteUrl: string;
}

/**
 * Determines if we're in staging environment
 * Staging is detected by:
 * 1. NODE_ENV === 'development' (local development)
 * 2. VERCEL_ENV === 'preview' (Vercel preview deployments)
 * 3. Presence of NEXT_STAGING_PUBLIC_SITE_URL environment variable
 */
export function isStagingEnvironment(): boolean {
  // Check for explicit staging environment variable
  if (process.env.NEXT_STAGING_PUBLIC_SITE_URL) {
    return true;
  }
  
  // Check for development environment
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // Check for Vercel preview environment
  if (process.env.VERCEL_ENV === 'preview') {
    return true;
  }
  
  return false;
}

/**
 * Gets the appropriate Slack configuration based on the current environment
 */
export function getSlackConfig(): SlackConfig {
  const isStaging = isStagingEnvironment();
  
  if (isStaging) {
    return {
      clientId: process.env.NEXT_PUBLIC_SLACK_STAGING_CLIENT_ID || process.env.SLACK_STAGING_CLIENT_ID || '',
      clientSecret: process.env.SLACK_STAGING_CLIENT_SECRET || '',
      signingSecret: process.env.SLACK_STAGING_SIGNING_SECRET || '',
      botToken: process.env.SLACK_STAGING_BOT_TOKEN,
      siteUrl: process.env.NEXT_STAGING_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    };
  } else {
    return {
      clientId: process.env.NEXT_PUBLIC_SLACK_CLIENT_ID || process.env.SLACK_CLIENT_ID || '',
      clientSecret: process.env.SLACK_CLIENT_SECRET || '',
      signingSecret: process.env.SLACK_SIGNING_SECRET || '',
      botToken: process.env.SLACK_BOT_TOKEN,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://currently.team',
    };
  }
}

/**
 * Gets the appropriate Slack app name for the current environment
 */
export function getSlackAppName(): string {
  return isStagingEnvironment() ? 'Currently-Staging' : 'Currently';
}

/**
 * Validates that all required Slack environment variables are present
 */
export function validateSlackConfig(): { isValid: boolean; missing: string[] } {
  const config = getSlackConfig();
  const missing: string[] = [];
  
  if (!config.clientId) {
    missing.push(isStagingEnvironment() ? 'NEXT_PUBLIC_SLACK_STAGING_CLIENT_ID' : 'NEXT_PUBLIC_SLACK_CLIENT_ID');
  }
  
  if (!config.clientSecret) {
    missing.push(isStagingEnvironment() ? 'SLACK_STAGING_CLIENT_SECRET' : 'SLACK_CLIENT_SECRET');
  }
  
  if (!config.signingSecret) {
    missing.push(isStagingEnvironment() ? 'SLACK_STAGING_SIGNING_SECRET' : 'SLACK_SIGNING_SECRET');
  }
  
  if (!config.siteUrl) {
    missing.push(isStagingEnvironment() ? 'NEXT_STAGING_PUBLIC_SITE_URL' : 'NEXT_PUBLIC_SITE_URL');
  }
  
  return {
    isValid: missing.length === 0,
    missing
  };
}

/**
 * Logs the current Slack configuration for debugging (without sensitive data)
 */
export function logSlackConfig(): void {
  const config = getSlackConfig();
  const isStaging = isStagingEnvironment();
  
  console.log(`[SLACK CONFIG] Environment: ${isStaging ? 'STAGING' : 'PRODUCTION'}`);
  console.log(`[SLACK CONFIG] App Name: ${getSlackAppName()}`);
  console.log(`[SLACK CONFIG] Site URL: ${config.siteUrl}`);
  console.log(`[SLACK CONFIG] Client ID: ${config.clientId ? '***' + config.clientId.slice(-4) : 'NOT SET'}`);
  console.log(`[SLACK CONFIG] Client Secret: ${config.clientSecret ? 'SET' : 'NOT SET'}`);
  console.log(`[SLACK CONFIG] Signing Secret: ${config.signingSecret ? 'SET' : 'NOT SET'}`);
  console.log(`[SLACK CONFIG] Bot Token: ${config.botToken ? 'SET' : 'NOT SET'}`);
}
