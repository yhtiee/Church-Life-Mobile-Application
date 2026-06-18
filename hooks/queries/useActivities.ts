import { useQuery } from '@tanstack/react-query';
import { ActivityService, Activity } from '@/lib/supabase/services/activity';
import { QUERY_KEYS } from '@/constants/query-keys';

const activityService = new ActivityService();

/**
 * Hook to fetch user's own activities
 * Respects RLS - users see only their own activities
 */
export function useActivitiesQuery(limit: number = 50, offset: number = 0) {
  return useQuery({
    queryKey: [QUERY_KEYS.ACTIVITIES, limit, offset],
    queryFn: async () => {
      const { data, error } = await activityService.getActivities(limit, offset);
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch all activities (admin only)
 * Respects RLS - only admins see all activities
 */
export function useAllActivitiesQuery(limit: number = 50, offset: number = 0) {
  return useQuery({
    queryKey: [QUERY_KEYS.ALL_ACTIVITIES, limit, offset],
    queryFn: async () => {
      const { data, error } = await activityService.getAllActivities(limit, offset);
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}
