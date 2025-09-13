import { WebClient, Block, KnownBlock } from '@slack/web-api';
import { createClient } from '@/lib/supabase/server';

export interface SlackChannel {
  id: string;
  name: string;
  is_private: boolean;
  is_member: boolean;
  num_members?: number;
}

export interface SlackMessage {
  channel: string;
  text: string;
  blocks?: (Block | KnownBlock)[];
  attachments?: SlackAttachment[];
}

export interface SlackAttachment {
  [key: string]: unknown;
}

export interface IntegrationData {
  id: string;
  user_id: string;
  organization_id: string;
  provider: string;
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
  metadata?: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class SlackIntegration {
  private client: WebClient;
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
    this.client = new WebClient(accessToken);
  }

  /**
   * Get all channels the bot has access to
   */
  async getChannels(): Promise<SlackChannel[]> {
    try {
      const result = await this.client.conversations.list({
        types: 'public_channel,private_channel',
        exclude_archived: true,
        limit: 1000,
      });

      if (!result.ok) {
        throw new Error(`Slack API error: ${result.error}`);
      }

      return (result.channels || []).map(channel => ({
        id: channel.id!,
        name: channel.name!,
        is_private: channel.is_private || false,
        is_member: channel.is_member || false,
        num_members: channel.num_members,
      }));
    } catch (error) {
      console.error('Error fetching Slack channels:', error);
      throw error;
    }
  }

  /**
   * Send a message to a Slack channel
   */
  async sendMessage(message: SlackMessage): Promise<boolean> {
    try {
      const result = await this.client.chat.postMessage({
        channel: message.channel,
        text: message.text,
        blocks: message.blocks,
        attachments: message.attachments,
      });

      if (!result.ok) {
        throw new Error(`Slack API error: ${result.error}`);
      }

      return true;
    } catch (error) {
      console.error('Error sending Slack message:', error);
      throw error;
    }
  }

  /**
   * Send a rich message with blocks to a Slack channel
   */
  async sendRichMessage(channel: string, title: string, text: string, fields?: Array<{title: string, value: string, short?: boolean}>): Promise<boolean> {
    const blocks: (Block | KnownBlock)[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: title,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: text,
        },
      },
    ];

    if (fields && fields.length > 0) {
      const sectionBlock: KnownBlock = {
        type: 'section',
        fields: fields.map(field => ({
          type: 'mrkdwn',
          text: `*${field.title}*\n${field.value}`,
        })),
      };
      blocks.push(sectionBlock);
    }

    return this.sendMessage({
      channel,
      text: title, // Fallback text
      blocks,
    });
  }

  /**
   * Get team information
   */
  async getTeamInfo(): Promise<Record<string, unknown>> {
    try {
      const result = await this.client.team.info();
      
      if (!result.ok) {
        throw new Error(`Slack API error: ${result.error}`);
      }

      return (result.team as Record<string, unknown>) || {};
    } catch (error) {
      console.error('Error fetching Slack team info:', error);
      throw error;
    }
  }

  /**
   * Test the connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.client.auth.test();
      return result.ok || false;
    } catch (error) {
      console.error('Error testing Slack connection:', error);
      return false;
    }
  }
}

/**
 * Get Slack integration for a user and organization
 */
export async function getSlackIntegration(userId: string, organizationId: string): Promise<SlackIntegration | null> {
  try {
    const supabase = await createClient();
    
    // Type assertion for integrations table since it's not in the generated types
    const { data: integration, error } = await (supabase as unknown as {
      from: (table: string) => {
        select: (fields: string) => {
          eq: (field: string, value: string) => {
            eq: (field: string, value: string) => {
              eq: (field: string, value: string) => {
                eq: (field: string, value: boolean) => {
                  single: () => Promise<{ data: IntegrationData | null; error: unknown }>;
                };
              };
            };
          };
        };
      };
    })
      .from('integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .eq('provider', 'slack')
      .eq('is_active', true)
      .single();

    if (error || !integration) {
      return null;
    }

    // Check if token is expired and refresh if needed
    if (integration?.expires_at && new Date(integration.expires_at) <= new Date()) {
      // TODO: Implement token refresh logic
      console.warn('Slack token expired, refresh needed');
      return null;
    }

    return new SlackIntegration(integration?.access_token || '');
  } catch (error) {
    console.error('Error getting Slack integration:', error);
    return null;
  }
}

/**
 * Create a Slack message for stream updates
 */
export function createStreamUpdateMessage(stream: { id: string; title: string; description?: string }, updateType: 'created' | 'updated' | 'completed' | 'task_added' | 'task_completed'): SlackMessage {
  const emoji = {
    created: '🆕',
    updated: '📝',
    completed: '✅',
    task_added: '📋',
    task_completed: '✔️',
  };

  const action = {
    created: 'created',
    updated: 'updated',
    completed: 'completed',
    task_added: 'added a task to',
    task_completed: 'completed a task in',
  };

  const blocks: (Block | KnownBlock)[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `${emoji[updateType]} Stream ${action[updateType]}`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${stream.title}*\n${stream.description || 'No description'}`,
      },
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `Stream ID: ${stream.id}`,
        },
      ],
    },
  ];

  return {
    channel: '', // Will be set when sending
    text: `${emoji[updateType]} Stream "${stream.title}" was ${action[updateType]}`,
    blocks,
  };
}
