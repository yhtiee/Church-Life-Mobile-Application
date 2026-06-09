import { supaBaseClient } from '../client';
import { DatabaseNotification } from '../entities/types';

export class NotificationService {
  /**
   * Fetches notifications for a user.
   */
  async fetchNotifications(userId: string) {
    try {
      const { data, error } = await supaBaseClient
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data as DatabaseNotification[], error: null };
    } catch (error: any) {
      console.error(`Error fetching notifications for user (${userId}):`, error.message || error);
      return { data: null, error };
    }
  }

  /**
   * Creates a notification for a user.
   */
  async createNotification(notification: Omit<DatabaseNotification, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supaBaseClient
        .from('notifications')
        .insert([notification])
        .select()
        .single();

      if (error) throw error;
      return { data: data as DatabaseNotification, error: null };
    } catch (error: any) {
      console.error('Error creating notification:', error.message || error);
      return { data: null, error };
    }
  }

  /**
   * Marks a notification as read (unread = false).
   */
  async markAsRead(notificationId: string) {
    try {
      const { data, error } = await supaBaseClient
        .from('notifications')
        .update({ unread: false })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) throw error;
      return { data: data as DatabaseNotification, error: null };
    } catch (error: any) {
      console.error(`Error marking notification as read (${notificationId}):`, error.message || error);
      return { data: null, error };
    }
  }

  /**
   * Marks all notifications of a user as read.
   */
  async markAllAsRead(userId: string) {
    try {
      const { error } = await supaBaseClient
        .from('notifications')
        .update({ unread: false })
        .eq('user_id', userId);

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error(`Error marking all notifications as read for user (${userId}):`, error.message || error);
      return { error };
    }
  }

  /**
   * Deletes a notification.
   */
  async deleteNotification(notificationId: string) {
    try {
      const { error } = await supaBaseClient
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error(`Error deleting notification (${notificationId}):`, error.message || error);
      return { error };
    }
  }
}

/**
 * A middleware helper to wrap async service functions and automatically
 * create a database notification on successful execution.
 */
export function notifyOnSuccess<TArgs extends any[], TResult>(
  actionFn: (...args: TArgs) => Promise<TResult>,
  getNotifDetails: (result: TResult, ...args: TArgs) => {
    title: string;
    body: string;
    type: 'giving' | 'announcement' | 'group' | 'system';
  }
) {
  return async (...args: TArgs): Promise<TResult> => {
    const result = await actionFn(...args);
    const resultObj = result as any;
    if (resultObj && resultObj.error) {
      return result; // Do not notify on error
    }

    try {
      const { data: { session } } = await supaBaseClient.auth.getSession();
      const userId = session?.user?.id;
      if (userId) {
        const details = getNotifDetails(result, ...args);
        const notificationService = new NotificationService();
        await notificationService.createNotification({
          user_id: userId,
          title: details.title,
          body: details.body,
          type: details.type,
          unread: true,
        });
      }
    } catch (error) {
      console.error('Failed to create notification via middleware:', error);
    }

    return result;
  };
}