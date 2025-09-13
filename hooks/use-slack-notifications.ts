import { useCallback } from 'react';
import { useOrganization } from '@/components/organization-provider';

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

export function useSlackNotifications() {
  const { currentOrganization } = useOrganization();

  const sendStreamNotification = useCallback(async (
    stream: StreamUpdate,
    updateType: 'created' | 'updated' | 'completed' | 'task_added' | 'task_completed'
  ) => {
    if (!currentOrganization) return;

    try {
      const response = await fetch('/api/integrations/slack/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'stream_update',
          stream: {
            ...stream,
            organization_id: currentOrganization.id,
          },
          updateType,
        }),
      });

      if (!response.ok) {
        console.error('Failed to send Slack notification:', await response.text());
      }
    } catch (error) {
      console.error('Error sending Slack notification:', error);
    }
  }, [currentOrganization]);

  const sendTaskNotification = useCallback(async (
    task: TaskUpdate,
    updateType: 'created' | 'updated' | 'completed' | 'assigned'
  ) => {
    if (!currentOrganization) return;

    try {
      const response = await fetch('/api/integrations/slack/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'task_update',
          task: {
            ...task,
            organization_id: currentOrganization.id,
          },
          updateType,
        }),
      });

      if (!response.ok) {
        console.error('Failed to send Slack notification:', await response.text());
      }
    } catch (error) {
      console.error('Error sending Slack notification:', error);
    }
  }, [currentOrganization]);

  return {
    sendStreamNotification,
    sendTaskNotification,
  };
}
