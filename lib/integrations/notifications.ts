import { createClient } from '@/lib/supabase/server';
import { getSlackIntegration, createStreamUpdateMessage } from './slack';

export interface StreamUpdate {
  id: string;
  title: string;
  description?: string;
  status?: string;
  organization_id: string;
  updated_by?: string;
}

export interface TaskUpdate {
  id: string;
  title: string;
  stream_id: string;
  stream_title: string;
  status: string;
  organization_id: string;
  updated_by?: string;
}

export class NotificationService {
  /**
   * Send stream update notification to Slack
   */
  static async sendStreamUpdate(
    stream: StreamUpdate, 
    updateType: 'created' | 'updated' | 'completed' | 'task_added' | 'task_completed'
  ) {
    try {
      const supabase = await createClient();
      
      // Get all active Slack integrations for this organization
      const { data: integrations, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('organization_id', stream.organization_id)
        .eq('provider', 'slack')
        .eq('is_active', true);

      if (error || !integrations || integrations.length === 0) {
        return; // No Slack integrations found
      }

      // Send notification to each integration
      for (const integration of integrations) {
        try {
          const slackIntegration = await getSlackIntegration(
            integration.user_id, 
            stream.organization_id
          );

          if (!slackIntegration) {
            continue;
          }

          // Check if notifications are enabled
          const metadata = integration.metadata as Record<string, unknown>;
          const notificationsEnabled = metadata?.notifications_enabled;
          if (!notificationsEnabled) {
            continue;
          }

          // Get the default channel
          const defaultChannel = metadata?.default_channel as string;
          if (!defaultChannel) {
            continue;
          }

          // Create the message
          const message = createStreamUpdateMessage(stream, updateType);
          message.channel = defaultChannel;

          // Send the message
          await slackIntegration.sendMessage(message);

        } catch (error) {
          console.error(`Error sending Slack notification for integration ${integration.id}:`, error);
        }
      }

    } catch (error) {
      console.error('Error in sendStreamUpdate:', error);
    }
  }

  /**
   * Send task update notification to Slack
   */
  static async sendTaskUpdate(
    task: TaskUpdate,
    updateType: 'created' | 'updated' | 'completed' | 'assigned'
  ) {
    try {
      const supabase = await createClient();
      
      // Get all active Slack integrations for this organization
      const { data: integrations, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('organization_id', task.organization_id)
        .eq('provider', 'slack')
        .eq('is_active', true);

      if (error || !integrations || integrations.length === 0) {
        return; // No Slack integrations found
      }

      // Send notification to each integration
      for (const integration of integrations) {
        try {
          const slackIntegration = await getSlackIntegration(
            integration.user_id, 
            task.organization_id
          );

          if (!slackIntegration) {
            continue;
          }

          // Check if notifications are enabled
          const metadata = integration.metadata as Record<string, unknown>;
          const notificationsEnabled = metadata?.notifications_enabled;
          if (!notificationsEnabled) {
            continue;
          }

          // Get the default channel
          const defaultChannel = metadata?.default_channel as string;
          if (!defaultChannel) {
            continue;
          }

          // Create the task message
          const emoji = {
            created: '📋',
            updated: '📝',
            completed: '✅',
            assigned: '👤',
          };

          const action = {
            created: 'created',
            updated: 'updated',
            completed: 'completed',
            assigned: 'assigned',
          };

          const blocks = [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: `${emoji[updateType]} Task ${action[updateType]}`,
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*${task.title}*\nIn stream: *${task.stream_title}*`,
              },
            },
            {
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: `Task ID: ${task.id}`,
                },
              ],
            },
          ];

          const message = {
            channel: defaultChannel,
            text: `${emoji[updateType]} Task "${task.title}" was ${action[updateType]}`,
            blocks,
          };

          // Send the message
          await slackIntegration.sendMessage(message);

        } catch (error) {
          console.error(`Error sending Slack notification for integration ${integration.id}:`, error);
        }
      }

    } catch (error) {
      console.error('Error in sendTaskUpdate:', error);
    }
  }

  /**
   * Send a custom message to Slack
   */
  static async sendCustomMessage(
    organizationId: string,
    channel: string,
    title: string,
    text: string,
    fields?: Array<{title: string, value: string, short?: boolean}>
  ) {
    try {
      const supabase = await createClient();
      
      // Get the first active Slack integration for this organization
      const { data: integration, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('provider', 'slack')
        .eq('is_active', true)
        .limit(1)
        .single();

      if (error || !integration) {
        throw new Error('No active Slack integration found');
      }

      const slackIntegration = await getSlackIntegration(
        integration.user_id, 
        organizationId
      );

      if (!slackIntegration) {
        throw new Error('Slack integration not available');
      }

      // Send the rich message
      await slackIntegration.sendRichMessage(channel, title, text, fields);

    } catch (error) {
      console.error('Error in sendCustomMessage:', error);
      throw error;
    }
  }
}
