'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Slack, 
  ExternalLink, 
  CheckCircle, 
  XCircle,
  TestTube,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/components/organization-provider';

interface SlackIntegration {
  id: string;
  provider: string;
  is_active: boolean;
  metadata: {
    team_id: string;
    team_name: string;
    team_domain: string;
    scope: string;
  };
  created_at: string;
}

export function SlackIntegration() {
  const [integration, setIntegration] = useState<SlackIntegration | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();
  const { currentOrganization } = useOrganization();

  const fetchIntegration = useCallback(async () => {
    if (!currentOrganization) return;

    try {
      const response = await fetch(`/api/integrations/slack/status?organization_id=${currentOrganization.id}`);
      if (response.ok) {
        const data = await response.json();
        setIntegration(data.integration);
      }
    } catch (error) {
      console.error('Error fetching Slack integration:', error);
    } finally {
      setLoading(false);
    }
  }, [currentOrganization]);

  useEffect(() => {
    if (currentOrganization) {
      fetchIntegration();
    }
  }, [currentOrganization, fetchIntegration]);

  const connectSlack = () => {
    if (!currentOrganization) return;
    
    const clientId = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/integrations/slack/auth`;
    const scopes = 'channels:read,chat:write,team:read';
    const state = currentOrganization.id; // Pass organization ID as state
    
    const authUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
    
    window.open(authUrl, '_blank', 'width=600,height=700');
  };

  const disconnectSlack = async () => {
    if (!integration) return;

    try {
      const response = await fetch('/api/integrations/slack/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integration_id: integration.id }),
      });

      if (response.ok) {
        setIntegration(null);
        toast({
          title: 'Slack disconnected',
          description: 'Your Slack integration has been disconnected successfully.',
        });
      } else {
        throw new Error('Failed to disconnect');
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to disconnect Slack integration.',
        variant: 'destructive',
      });
    }
  };

  const testConnection = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/integrations/slack/test', {
        method: 'POST',
      });

      if (response.ok) {
        toast({
          title: 'Connection successful',
          description: 'Your Slack integration is working correctly.',
        });
      } else {
        throw new Error('Connection test failed');
      }
    } catch {
      toast({
        title: 'Connection failed',
        description: 'Unable to connect to Slack. Please check your integration settings.',
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };


  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!integration) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Slack className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Slack</CardTitle>
                <CardDescription>Team communication</CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              Not Connected
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Connect your Slack workspace to link important messages directly to your Currently streams. Never lose track of important discussions again.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Pin Slack messages to streams
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              View linked messages in stream context
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Keep important discussions organized
            </div>
          </div>
          <Button onClick={connectSlack} className="w-full mt-4">
            <ExternalLink className="h-4 w-4 mr-2" />
            Connect Slack
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Slack className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Slack</CardTitle>
              <CardDescription>
                Connected to {integration.metadata.team_name}
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Connected
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Workspace:</span>
            <span className="font-medium">{integration.metadata.team_name}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Domain:</span>
            <span className="font-medium">{integration.metadata.team_domain}.slack.com</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Connected:</span>
            <span className="font-medium">
              {new Date(integration.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <Separator />

        {/* Instructions */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-base">How to Pin Messages</Label>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>1. Install the Currently Slack app in your workspace</p>
              <p>2. Use the &ldquo;Pin to Currently&rdquo; action on any message</p>
              <p>3. Select the stream you want to link the message to</p>
              <p>4. View linked messages in your stream&apos;s Slack Messages section</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <Button onClick={testConnection} disabled={testing} variant="outline" size="sm">
            <TestTube className="h-4 w-4 mr-2" />
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
          <Button onClick={disconnectSlack} variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
