// In-memory error log (in production, you'd want to use a proper logging service)
const errorLog: Array<{
  timestamp: string;
  endpoint: string;
  error: string;
  details?: string;
}> = [];

export function logSlackError(endpoint: string, error: unknown, details?: unknown) {
  errorLog.push({
    timestamp: new Date().toISOString(),
    endpoint,
    error: error instanceof Error ? error.message : String(error),
    details: details ? JSON.stringify(details, null, 2) : undefined,
  });
  
  // Keep only last 50 errors
  if (errorLog.length > 50) {
    errorLog.splice(0, errorLog.length - 50);
  }
  
  console.error(`[SLACK DEBUG] ${endpoint}:`, error, details);
}

export function getErrorLog() {
  return errorLog.slice(-10); // Last 10 errors
}
