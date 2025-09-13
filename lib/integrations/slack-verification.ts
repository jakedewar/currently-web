import crypto from 'crypto';

/**
 * Verify Slack webhook signature for security
 */
export function verifySlackSignature(
  body: string,
  signature: string,
  timestamp: string,
  signingSecret: string
): boolean {
  try {
    const baseString = `v0:${timestamp}:${body}`;
    const expectedSignature = 'v0=' + crypto
      .createHmac('sha256', signingSecret)
      .update(baseString)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Error verifying Slack signature:', error);
    return false;
  }
}

/**
 * Verify that the request timestamp is not too old (within 5 minutes)
 */
export function verifySlackTimestamp(timestamp: string): boolean {
  const requestTime = parseInt(timestamp, 10);
  const currentTime = Math.floor(Date.now() / 1000);
  const timeDiff = Math.abs(currentTime - requestTime);
  
  // Allow requests within 5 minutes
  return timeDiff <= 300;
}

/**
 * Middleware function to verify Slack requests
 */
export function verifySlackRequest(
  body: string,
  headers: Headers,
  signingSecret: string
): { isValid: boolean; error?: string } {
  const signature = headers.get('x-slack-signature');
  const timestamp = headers.get('x-slack-request-timestamp');

  if (!signature || !timestamp) {
    return { isValid: false, error: 'Missing required headers' };
  }

  if (!verifySlackTimestamp(timestamp)) {
    return { isValid: false, error: 'Request timestamp too old' };
  }

  if (!verifySlackSignature(body, signature, timestamp, signingSecret)) {
    return { isValid: false, error: 'Invalid signature' };
  }

  return { isValid: true };
}
