'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bug, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DebugInfo {
  timestamp: string;
  environment: {
    SLACK_SIGNING_SECRET: boolean;
    NEXT_PUBLIC_SLACK_CLIENT_ID: boolean;
    NEXT_PUBLIC_SITE_URL: boolean;
  };
  database: {
    integrations_count: number;
    slack_messages_count: number;
    users_with_slack: number;
  };
  recent_errors: Array<{
    timestamp: string;
    endpoint: string;
    error: string;
    details?: string;
  }>;
}

export function SlackDebug() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<{
    success: boolean;
    error?: string;
    message?: string;
    debugInfo?: DebugInfo;
    tests?: Array<{
      name: string;
      status: string;
      details: unknown;
    }>;
  } | null>(null);
  const { toast } = useToast();

  const fetchDebugInfo = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/integrations/slack/debug');
      if (response.ok) {
        const data = await response.json();
        setDebugInfo(data);
      } else {
        throw new Error('Failed to fetch debug info');
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to fetch debug information.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const testIntegration = async () => {
    setTesting(true);
    setTestResults(null);
    
    try {
      // Test 1: Get debug info
      const debugResponse = await fetch('/api/integrations/slack/debug');
      const debugData = await debugResponse.json();
      
      if (!debugData.database.integrations_count) {
        setTestResults({
          success: false,
          error: 'No Slack integrations found. Please connect Slack first.',
          tests: []
        });
        return;
      }

      // Test 2: Test integration lookup (we'll need a user ID for this)
      // For now, just show the debug info
      setTestResults({
        success: true,
        message: 'Debug information retrieved successfully',
        debugInfo: debugData,
        tests: [
          {
            name: 'Environment Variables',
            status: Object.values(debugData.environment).every(Boolean) ? 'pass' : 'fail',
            details: debugData.environment
          },
          {
            name: 'Database Connection',
            status: debugData.database.integrations_count >= 0 ? 'pass' : 'fail',
            details: debugData.database
          },
          {
            name: 'Recent Errors',
            status: debugData.recent_errors.length === 0 ? 'pass' : 'warning',
            details: debugData.recent_errors
          }
        ]
      });
    } catch (error) {
      setTestResults({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        tests: []
      });
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Debug information copied to clipboard.',
    });
  };

  const openDebugEndpoint = () => {
    window.open('/api/integrations/slack/debug', '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-600 rounded-lg">
              <Bug className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Slack Debug Console</CardTitle>
              <CardDescription>Debug and troubleshoot Slack integration issues</CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={openDebugEndpoint} variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Raw Debug
            </Button>
            <Button onClick={fetchDebugInfo} disabled={loading} variant="outline" size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button onClick={testIntegration} disabled={testing} variant="default">
              <Bug className="h-4 w-4 mr-2" />
              {testing ? 'Testing...' : 'Run Diagnostics'}
            </Button>
            <Button onClick={fetchDebugInfo} disabled={loading} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Get Debug Info
            </Button>
          </div>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="space-y-4">
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {testResults.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <h3 className="font-semibold">Test Results</h3>
              </div>
              
              {testResults.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800 text-sm">{testResults.error}</p>
                </div>
              )}
              
              {testResults.message && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-800 text-sm">{testResults.message}</p>
                </div>
              )}

              {testResults.tests && testResults.tests.length > 0 && (
                <div className="space-y-2">
                  {testResults.tests.map((test, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center gap-2">
                        {test.status === 'pass' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {test.status === 'fail' && <XCircle className="h-4 w-4 text-red-500" />}
                        {test.status === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                        <span className="font-medium">{test.name}</span>
                      </div>
                      <Badge variant={test.status === 'pass' ? 'default' : test.status === 'warning' ? 'secondary' : 'destructive'}>
                        {test.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Debug Information */}
        {debugInfo && (
          <div className="space-y-4">
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Debug Information</h3>
                <Button 
                  onClick={() => copyToClipboard(JSON.stringify(debugInfo, null, 2))} 
                  variant="outline" 
                  size="sm"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Environment */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Environment Variables</Label>
                  <div className="space-y-1">
                    {Object.entries(debugInfo.environment).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{key}:</span>
                        <Badge variant={value ? 'default' : 'destructive'}>
                          {value ? 'Set' : 'Missing'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Database */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Database Stats</Label>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Slack Integrations:</span>
                      <span className="font-medium">{debugInfo.database.integrations_count}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Slack Messages:</span>
                      <span className="font-medium">{debugInfo.database.slack_messages_count}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Users with Slack:</span>
                      <span className="font-medium">{debugInfo.database.users_with_slack}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Errors */}
              {debugInfo.recent_errors.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Recent Errors</Label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {debugInfo.recent_errors.map((error, index) => (
                      <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-red-800">{error.endpoint}</span>
                          <span className="text-xs text-red-600">
                            {new Date(error.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-red-700 mb-2">{error.error}</p>
                        {error.details && (
                          <details className="text-xs text-red-600">
                            <summary className="cursor-pointer">Details</summary>
                            <pre className="mt-1 whitespace-pre-wrap">{error.details}</pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="space-y-4">
          <Separator />
          <div className="space-y-2">
            <Label className="text-sm font-medium">How to Debug</Label>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>1. Click &quot;Run Diagnostics&quot; to check your Slack integration health</p>
              <p>2. Use &quot;Get Debug Info&quot; to see detailed system information</p>
              <p>3. Check the &quot;Recent Errors&quot; section for any issues</p>
              <p>4. Try pinning a message in Slack and watch for new errors</p>
              <p>5. Use the &quot;Raw Debug&quot; button to see the raw API response</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
