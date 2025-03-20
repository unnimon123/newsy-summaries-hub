
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NotificationData, NotificationWithId, SupabaseNotification, NotificationAudience } from "./NotificationTypes";
import { sendPushNotification } from "@/services/pushNotificationService";

export function useNotifications() {
  const [sentNotifications, setSentNotifications] = useState<NotificationWithId[]>([]);
  const [scheduledNotifications, setScheduledNotifications] = useState<NotificationWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Map Supabase notification to our frontend model
  const mapSupabaseNotification = (data: SupabaseNotification): NotificationWithId => {
    return {
      id: data.id,
      title: data.title,
      body: data.body,
      targetAudience: data.target_audience || data.audience || 'all',
      audience: data.audience || data.target_audience,
      linkToArticle: data.link_to_article || undefined,
      scheduleLater: !!data.scheduled_for,
      scheduledTime: data.scheduled_for || undefined,
      sent_at: data.sent_at || undefined,
      scheduled_for: data.scheduled_for || undefined,
      notificationType: data.type as "web" | "mobile" | "both",
      type: data.type
    };
  };

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      // Fetch sent notifications
      const { data: sentData, error: sentError } = await supabase
        .from('notifications')
        .select('*')
        .not('sent_at', 'is', null)
        .order('sent_at', { ascending: false });

      if (sentError) throw sentError;
      
      // Fetch scheduled notifications
      const { data: scheduledData, error: scheduledError } = await supabase
        .from('notifications')
        .select('*')
        .is('sent_at', null)
        .not('scheduled_for', 'is', null)
        .order('scheduled_for', { ascending: true });

      if (scheduledError) throw scheduledError;

      setSentNotifications(sentData ? sentData.map(mapSupabaseNotification) : []);
      setScheduledNotifications(scheduledData ? scheduledData.map(mapSupabaseNotification) : []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendNotification = async (data: NotificationData) => {
    try {
      // For web-only or both platforms notifications, store in database directly
      if (data.notificationType === 'web' || data.notificationType === 'both') {
        const audienceValue = data.targetAudience as NotificationAudience;
        
        const notificationData = {
          title: data.title,
          body: data.body,
          target_audience: data.targetAudience,
          audience: audienceValue,
          link_to_article: data.linkToArticle || null,
          scheduled_for: data.scheduleLater ? data.scheduledTime : null,
          sent_at: data.scheduleLater ? null : new Date().toISOString(),
          type: data.notificationType === 'both' ? 'web' : data.notificationType,
        };

        const { error } = await supabase
          .from('notifications')
          .insert(notificationData);

        if (error) throw error;
      }
      
      // For mobile-only or both platforms notifications, use the edge function
      if (data.notificationType === 'mobile' || data.notificationType === 'both') {
        await sendPushNotification({
          title: data.title,
          body: data.body,
          audience: data.targetAudience,
          linkToArticle: data.linkToArticle,
          scheduleLater: data.scheduleLater,
          scheduledTime: data.scheduledTime,
        });
      }
      
      // Refresh notifications list
      await fetchNotifications();
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error sending notification:", error);
      return Promise.reject(error);
    }
  };

  const handleDeleteScheduled = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setScheduledNotifications(scheduledNotifications.filter(n => n.id !== id));
      toast.success("Scheduled notification cancelled");
    } catch (error) {
      console.error("Error deleting scheduled notification:", error);
      toast.error("Failed to cancel scheduled notification");
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Setup realtime subscription for notifications
    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications' 
      }, (payload) => {
        console.log('Realtime notification update:', payload);
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    sentNotifications,
    scheduledNotifications,
    isLoading,
    handleSendNotification,
    handleDeleteScheduled,
  };
}
