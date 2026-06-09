import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationService } from '@/lib/supabase/services/notification';
import { QUERY_KEYS } from '@/constants/query-keys';

const notificationService = new NotificationService();

export function useMarkNotificationReadMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await notificationService.markAsRead(notificationId);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications(userId) });
    },
  });
}

export function useMarkAllNotificationsReadMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await notificationService.markAllAsRead(userId);
      if (res.error) throw res.error;
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications(userId) });
    },
  });
}

export function useDeleteNotificationMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await notificationService.deleteNotification(notificationId);
      if (res.error) throw res.error;
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications(userId) });
    },
  });
}
