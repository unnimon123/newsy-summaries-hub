import { supabase } from '@/integrations/supabase/client';
import { NotificationMetrics, NotificationErrorTypes } from '@/types/notification';

export class NotificationMetricsService {
  /**
   * Get notification delivery metrics
   */
  async getDeliveryMetrics(): Promise<NotificationMetrics> {
    try {
      // Get total notifications
      const { count: totalCount, error: totalError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // Get successful notifications
      const { count: successCount, error: successError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .in('status', ['sent', 'delivered', 'read']);

      if (successError) throw successError;

      // Get failed notifications
      const { count: failedCount, error: failedError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'failed');

      if (failedError) throw failedError;

      // Get retried notifications
      const { data: retriedData, error: retriedError } = await supabase
        .from('notifications')
        .select('retry_count')
        .gt('retry_count', 0);

      if (retriedError) throw retriedError;

      // Get platform breakdown
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('notification_preferences');

      if (profilesError) throw profilesError;

      // Calculate platform breakdown
      let iosCount = 0;
      let androidCount = 0;

      profilesData?.forEach(profile => {
        const prefs = profile.notification_preferences as any;
        if (prefs?.expo_push_token && prefs?.platform) {
          if (prefs.platform === 'ios') {
            iosCount++;
          } else if (prefs.platform === 'android') {
            androidCount++;
          }
        }
      });

      // Calculate metrics
      const total = totalCount || 0;
      const successful = successCount || 0;
      const failed = failedCount || 0;
      const retried = retriedData?.length || 0;
      const failureRate = total > 0 ? failed / total : 0;
      
      // Create alerts based on thresholds
      const alerts = [];
      
      if (failureRate > 0.1) {
        alerts.push({
          type: NotificationErrorTypes.DELIVERY_FAILURE,
          count: failed,
          lastOccurred: new Date()
        });
      }

      return {
        deliveryStats: {
          failureRate,
          tokenRefreshRate: 0.02, // Placeholder - would be calculated from actual token refresh data
          syncFailureRate: 0.01, // Placeholder - would be calculated from actual sync failure data
          total,
          successful,
          failed,
          retried
        },
        tokenHealth: {
          active: iosCount + androidCount,
          expired: 0, // Placeholder - would be calculated from actual token data
          refreshPending: 0 // Placeholder - would be calculated from actual token data
        },
        platformBreakdown: {
          ios: iosCount,
          android: androidCount
        },
        alerts
      };
    } catch (error) {
      console.error('Error fetching notification metrics:', error);
      throw error;
    }
  }

  /**
   * Get notification delivery rate over time
   * This would typically return data for a chart
   */
  async getDeliveryRateOverTime(days: number = 30): Promise<{ date: string; rate: number }[]> {
    try {
      // This is a simplified implementation
      // In a real app, you would query the database for notifications grouped by date
      // and calculate the delivery rate for each day
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('created_at, status')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Group by date and calculate delivery rate
      const dateMap = new Map<string, { total: number; delivered: number }>();
      
      data?.forEach(notification => {
        const date = notification.created_at.split('T')[0];
        const isDelivered = ['sent', 'delivered', 'read'].includes(notification.status);
        
        if (!dateMap.has(date)) {
          dateMap.set(date, { total: 0, delivered: 0 });
        }
        
        const stats = dateMap.get(date)!;
        stats.total++;
        if (isDelivered) {
          stats.delivered++;
        }
      });
      
      // Convert to array and calculate rates
      return Array.from(dateMap.entries()).map(([date, stats]) => ({
        date,
        rate: stats.total > 0 ? stats.delivered / stats.total : 0
      }));
    } catch (error) {
      console.error('Error fetching delivery rate over time:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const notificationMetricsService = new NotificationMetricsService();
