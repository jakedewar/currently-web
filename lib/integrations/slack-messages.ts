import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import type { Database, Json } from '@/lib/supabase/types';

export interface SlackMessageData {
  id: string;
  project_id: string;
  organization_id: string;
  slack_message_id: string;
  slack_channel_id: string;
  slack_channel_name: string;
  slack_user_id: string;
  slack_user_name: string;
  slack_user_display_name?: string;
  message_text: string;
  message_timestamp: string;
  thread_ts?: string;
  permalink: string;
  attachments: Record<string, unknown>[];
  reactions: Record<string, unknown>[];
  metadata: Record<string, unknown>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SlackMessageInput {
  project_id: string;
  organization_id: string;
  slack_message_id: string;
  slack_channel_id: string;
  slack_channel_name: string;
  slack_user_id: string;
  slack_user_name: string;
  slack_user_display_name?: string;
  message_text: string;
  message_timestamp: string;
  thread_ts?: string;
  permalink: string;
  attachments?: Record<string, unknown>[];
  reactions?: Record<string, unknown>[];
  metadata?: Record<string, unknown>;
}

export class SlackMessageService {
  /**
   * Create a service role client for server-side operations
   */
  private static createServiceRoleClient() {
    return createServiceClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }

  /**
   * Add a Slack message to a project
   */
  static async addMessageToProject(
    userId: string,
    messageData: SlackMessageInput
  ): Promise<SlackMessageData | null> {
    try {
      // Use service role client to bypass RLS for server-side operations
      const supabase = this.createServiceRoleClient();
      
      const insertData = {
        project_id: messageData.project_id,
        organization_id: messageData.organization_id,
        slack_message_id: messageData.slack_message_id,
        slack_channel_id: messageData.slack_channel_id,
        slack_channel_name: messageData.slack_channel_name,
        slack_user_id: messageData.slack_user_id,
        slack_user_name: messageData.slack_user_name,
        slack_user_display_name: messageData.slack_user_display_name,
        message_text: messageData.message_text,
        message_timestamp: messageData.message_timestamp,
        thread_ts: messageData.thread_ts,
        permalink: messageData.permalink,
        attachments: messageData.attachments as Json,
        reactions: messageData.reactions as Json,
        metadata: messageData.metadata as Json,
        created_by: userId,
      };

      const { data: message, error } = await supabase
        .from('slack_messages')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error adding Slack message to stream:', error);
        return null;
      }

      return message as SlackMessageData;
    } catch (error) {
      console.error('Error in addMessageToProject:', error);
      return null;
    }
  }

  /**
   * Get all Slack messages for a project
   */
  static async getProjectMessages(projectId: string): Promise<SlackMessageData[]> {
    try {
      const supabase = await createClient();
      
      const { data: messages, error } = await supabase
        .from('slack_messages')
        .select('*')
        .eq('project_id', projectId)
        .order('message_timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching project Slack messages:', error);
        return [];
      }

      return (messages as SlackMessageData[]) || [];
    } catch (error) {
      console.error('Error in getProjectMessages:', error);
      return [];
    }
  }

  /**
   * Get Slack messages for multiple streams in an organization
   */
  static async getOrganizationMessages(organizationId: string, limit = 50): Promise<SlackMessageData[]> {
    try {
      const supabase = await createClient();
      
      const { data: messages, error } = await supabase
        .from('slack_messages')
        .select(`
          *,
          projects!inner(name, id)
        `)
        .eq('organization_id', organizationId)
        .order('message_timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching organization Slack messages:', error);
        return [];
      }

      return (messages as SlackMessageData[]) || [];
    } catch (error) {
      console.error('Error in getOrganizationMessages:', error);
      return [];
    }
  }

  /**
   * Remove a Slack message from a project
   */
  static async removeMessageFromProject(
    userId: string,
    messageId: string
  ): Promise<boolean> {
    try {
      const supabase = await createClient();
      
      const { error } = await supabase
        .from('slack_messages')
        .delete()
        .eq('id', messageId)
        .eq('created_by', userId);

      if (error) {
        console.error('Error removing Slack message from project:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in removeMessageFromProject:', error);
      return false;
    }
  }

  /**
   * Check if a Slack message is already linked to any project
   */
  static async isMessageLinked(slackMessageId: string): Promise<boolean> {
    try {
      // Use service role client to bypass RLS for server-side operations
      const supabase = this.createServiceRoleClient();
      
      const { data, error } = await supabase
        .from('slack_messages')
        .select('id')
        .eq('slack_message_id', slackMessageId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking if message is linked:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in isMessageLinked:', error);
      return false;
    }
  }

  /**
   * Get message statistics for a stream
   */
  static async getStreamMessageStats(streamId: string): Promise<{
    total_messages: number;
    unique_channels: number;
    unique_users: number;
    latest_message: string | null;
  }> {
    try {
      const supabase = await createClient();
      
      const { data: stats, error } = await supabase
        .from('slack_messages')
        .select('slack_channel_id, slack_user_id, message_timestamp')
        .eq('stream_id', streamId);

      if (error) {
        console.error('Error fetching stream message stats:', error);
        return {
          total_messages: 0,
          unique_channels: 0,
          unique_users: 0,
          latest_message: null,
        };
      }

      const uniqueChannels = new Set(stats.map(s => s.slack_channel_id)).size;
      const uniqueUsers = new Set(stats.map(s => s.slack_user_id)).size;
      const latestMessage = stats.length > 0 
        ? stats.sort((a, b) => new Date(b.message_timestamp).getTime() - new Date(a.message_timestamp).getTime())[0].message_timestamp
        : null;

      return {
        total_messages: stats.length,
        unique_channels: uniqueChannels,
        unique_users: uniqueUsers,
        latest_message: latestMessage,
      };
    } catch (error) {
      console.error('Error in getStreamMessageStats:', error);
      return {
        total_messages: 0,
        unique_channels: 0,
        unique_users: 0,
        latest_message: null,
      };
    }
  }
}
