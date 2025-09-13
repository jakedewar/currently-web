'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ExternalLink, MessageSquare, Hash, Clock, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SlackMessageData } from '@/lib/integrations/slack-messages';

interface SlackMessagesProps {
  streamId: string;
  canManage?: boolean;
}

export function SlackMessages({ streamId, canManage = false }: SlackMessagesProps) {
  const [messages, setMessages] = useState<SlackMessageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_messages: 0,
    unique_channels: 0,
    unique_users: 0,
    latest_message: null as string | null,
  });
  const { toast } = useToast();

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/streams/${streamId}/slack-messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Error fetching Slack messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch Slack messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [streamId, stats, toast]);

  useEffect(() => {
    if (streamId) {
      fetchMessages();
    }
  }, [streamId, fetchMessages]);

  const removeMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/streams/${streamId}/slack-messages/${messageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        setStats(prev => ({
          ...prev,
          total_messages: prev.total_messages - 1,
        }));
        toast({
          title: 'Success',
          description: 'Slack message removed from stream',
        });
      } else {
        throw new Error('Failed to remove message');
      }
    } catch (error) {
      console.error('Error removing Slack message:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove Slack message',
        variant: 'destructive',
      });
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Slack Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Slack Messages
            </CardTitle>
            <CardDescription>
              {stats.total_messages > 0 ? (
                <>
                  {stats.total_messages} message{stats.total_messages !== 1 ? 's' : ''} from {stats.unique_channels} channel{stats.unique_channels !== 1 ? 's' : ''}
                </>
              ) : (
                'No Slack messages linked to this stream'
              )}
            </CardDescription>
          </div>
          {stats.total_messages > 0 && (
            <div className="flex gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Hash className="h-3 w-3" />
                {stats.unique_channels}
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {stats.total_messages}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      
      {messages.length > 0 ? (
        <CardContent className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(message.slack_user_display_name || message.slack_user_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {message.slack_user_display_name || message.slack_user_name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        #{message.slack_channel_name}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(message.message_timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {message.message_text}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(message.permalink, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMessage(message.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              {message.attachments && message.attachments.length > 0 && (
                <div className="ml-11">
                  <div className="text-xs text-muted-foreground mb-1">
                    {message.attachments.length} attachment{message.attachments.length !== 1 ? 's' : ''}
                  </div>
                </div>
              )}
              
              {message.reactions && message.reactions.length > 0 && (
                <div className="ml-11 flex flex-wrap gap-1">
                  {message.reactions.map((reaction, index: number) => {
                    const typedReaction = reaction as { name: string; count: number };
                    return (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {typedReaction.name} {typedReaction.count}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      ) : (
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">
              No Slack messages have been linked to this stream yet.
            </p>
            <p className="text-xs mt-1">
              Use the &quot;Pin to Currently&quot; action in Slack to link messages to this stream.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
