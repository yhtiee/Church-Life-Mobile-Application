import { useQuery } from '@tanstack/react-query';
import { NotificationService } from '@/lib/supabase/services/notification';
import { QUERY_KEYS } from '@/constants/query-keys';

const notificationService = new NotificationService();

export function useNotificationsQuery(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.notifications(userId),
    queryFn: async () => {
      const res = await notificationService.fetchNotifications(userId);
      if (res.error) throw res.error;
      return res.data || [];
    },
    enabled: !!userId,
  });
}
