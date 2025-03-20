import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PushNotificationData {
  title: string;
  body: string;
  userId?: string;
  audience?: string;
  data?: Record<string, string>;
  linkToArticle?: string;
  scheduleLater?: boolean;
  scheduledTime?: string;
}

/**
 * Sends a push notification through the Supabase edge function
 */
export async function sendPushNotification(data: PushNotificationData): Promise<{ success: boolean; notificationId?: string }> {
  try {
    // If scheduling for later, store in database only
    if (data.scheduleLater && data.scheduledTime) {
      const { error } = await supabase
        .from('notifications')
        .insert({
          title: data.title,
          body: data.body,
          user_id: data.userId || null,
          audience: data.audience || 'all',
          link_to_article: data.linkToArticle || null,
          scheduled_for: data.scheduledTime,
          type: 'mobile',
        });

      if (error) throw error;
      return { success: true };
    }

    // Otherwise send immediate notification via edge function
    const { data: responseData, error } = await supabase.functions.invoke('send-push-notification', {
      body: {
        title: data.title,
        body: data.body,
        userId: data.userId,
        audience: data.audience,
        data: data.data,
        linkToArticle: data.linkToArticle,
      },
    });

    if (error) throw error;
    return { 
      success: true,
      notificationId: responseData?.notificationId 
    };
  } catch (error) {
    console.error("Error sending push notification:", error);
    toast.error("Failed to send push notification");
    throw error;
  }
}

/**
 * Retrieve user notifications
 */
export async function getUserNotifications(limit: number = 20, offset: number = 0) {
  try {
    const { data, error, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    
    return { 
      notifications: data, 
      count: count || 0 
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .rpc('mark_notification_read', { notification_id: notificationId });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}

/**
 * Update FCM token for push notifications
 */
export async function updateFcmToken(fcmToken: string | null): Promise<void> {
  try {
    const { data: profile, error: profileError } = await supabase.auth.getUser();
    
    if (profileError) throw profileError;
    if (!profile.user) throw new Error("User not authenticated");
    
    const { error } = await supabase
      .from('profiles')
      .update({
        notification_preferences: supabase.rpc('jsonb_deep_set', {
          json: supabase.rpc('jsonb_get_or_create', {
            json: supabase.rpc('get_profile_notification_preferences', {
              profile_id: profile.user.id
            })
          }),
          path: ['fcm_token'],
          value: fcmToken
        })
      })
      .eq('id', profile.user.id);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating FCM token:", error);
    throw error;
  }
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  preferences: { push_enabled?: boolean; subscriptions?: string[] }
): Promise<void> {
  try {
    const { data: profile, error: profileError } = await supabase.auth.getUser();
    
    if (profileError) throw profileError;
    if (!profile.user) throw new Error("User not authenticated");
    
    // Get current preferences
    const { data: currentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('notification_preferences')
      .eq('id', profile.user.id)
      .single();
      
    if (fetchError) throw fetchError;
    
    const currentPreferences = currentProfile.notification_preferences || {};
    const updatedPreferences = {
      ...currentPreferences,
      ...(preferences.push_enabled !== undefined ? { push_enabled: preferences.push_enabled } : {}),
      ...(preferences.subscriptions ? { subscriptions: preferences.subscriptions } : {})
    };
    
    const { error } = await supabase
      .from('profiles')
      .update({
        notification_preferences: updatedPreferences
      })
      .eq('id', profile.user.id);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    throw error;
  }
}
