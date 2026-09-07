import { supabase } from '../lib/supabase';
import { AppError } from '../middleware/error.middleware';

export class NotificationService {
  async findByUser(userId: string, limit: number = 20) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false })
      .limit(limit);

    if (error) throw new AppError('Failed to fetch notifications', 500);
    return data;
  }

  async markAsRead(id: string, userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ isRead: true })
      .eq('id', id)
      .eq('userId', userId)
      .select();

    if (error) throw new AppError('Failed to mark notification as read', 500);
    return data;
  }

  async markAllAsRead(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ isRead: true })
      .eq('userId', userId)
      .eq('isRead', false)
      .select();

    if (error) throw new AppError('Failed to mark all notifications as read', 500);
    return data;
  }

  async getUnreadCount(userId: string) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('userId', userId)
      .eq('isRead', false);

    if (error) throw new AppError('Failed to fetch unread count', 500);
    return count || 0;
  }
}

export const notificationService = new NotificationService();
