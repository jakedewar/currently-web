import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DashboardData } from '@/lib/data/dashboard';

export function useDashboardUpdates(initialData: Pick<DashboardData, 'workItems' | 'teamActivity' | 'activityUsers'>) {
  const [workItems, setWorkItems] = useState(initialData.workItems);
  const [teamActivity, setTeamActivity] = useState(initialData.teamActivity);
  const [activityUsers, setActivityUsers] = useState(initialData.activityUsers);

  useEffect(() => {
    const supabase = createClient();

    // Subscribe to work items changes
    const workItemsSubscription = supabase
      .channel('work-items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'work_items'
        },
        async (payload) => {
          // Fetch updated work items
          const { data: updatedWorkItems } = await supabase
            .from('work_items')
            .select(`
              id,
              title,
              description,
              type,
              status,
              tool,
              created_at,
              updated_at,
              streams (
                name
              )
            `)
            .order('updated_at', { ascending: false })
            .limit(8);

          if (updatedWorkItems) {
            setWorkItems(updatedWorkItems);
          }
        }
      )
      .subscribe();

    // Subscribe to team activity changes
    const activitySubscription = supabase
      .channel('activity-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_activity'
        },
        async (payload) => {
          // Fetch updated activity
          const { data: updatedActivity } = await supabase
            .from('user_activity')
            .select(`
              id,
              activity_type,
              description,
              tool,
              created_at,
              user_id,
              streams (
                name
              ),
              work_items (
                title
              )
            `)
            .order('created_at', { ascending: false })
            .limit(6);

          if (updatedActivity) {
            setTeamActivity(updatedActivity);

            // Update user details if needed
            const userIds = updatedActivity.map(activity => activity.user_id).filter(Boolean);
            const { data: updatedUsers } = await supabase
              .from('users')
              .select('id, full_name')
              .in('id', userIds);

            if (updatedUsers) {
              const newUserMap = new Map(updatedUsers.map(user => [user.id, user]));
              setActivityUsers(newUserMap);
            }
          }
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      workItemsSubscription.unsubscribe();
      activitySubscription.unsubscribe();
    };
  }, []);

  return {
    workItems,
    teamActivity,
    activityUsers
  };
}
