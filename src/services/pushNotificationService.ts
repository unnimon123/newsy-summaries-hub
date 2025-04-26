import { supabase } from '@/integrations/supabase/client';
import { Database, Json } from '@/integrations/supabase/types';

interface NotificationPayload {
  title: string;
  body: string;
  deep_link?: string;
  data?: Record<string, unknown>;
}

export class ExpoNotificationService {
  private accessToken: string;
  private projectId: string;
  private apiUrl = 'https://exp.host/--/api/v2/push/send';

  constructor() {
    // Set actual credentials
    this.accessToken = 'XLJvd8X0q8kQS74PuTs2k78FC0SIA6CSvwYi8Ock';
    this.projectId = 'cfa91622-46a9-49aa-86c3-177c0a05d850';
  }

  /**
   * Send push notification to multiple recipients
   */
  async sendNotification(tokens: string[], notification: NotificationPayload) {
    try {
      const messages = tokens.map(token => ({
        to: token,
        title: notification.title,
        body: notification.body,
        data: {
          ...notification.data,
          deep_link: notification.deep_link
        }
      }));

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify(messages),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Expo API error details:', errorData);
        throw new Error(`Expo push notification failed: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      console.log('Push notification sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }

  /**
   * Get all registered push tokens for a target audience
   */
  async getTargetTokens(targetAudience: string): Promise<string[]> {
    try {
      // First try to get tokens from the profiles table (old method)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, notification_preferences');

      console.log('Fetching tokens from profiles:', profiles?.length);
      const profileTokens = profiles
        ?.map(p => {
          const prefs = p.notification_preferences as any;
          // Try both token types
          const token = prefs?.expo_push_token || prefs?.fcm_token;
          if (token) {
            console.log('Found token in profile:', { userId: p.id, token });
          }
          return token;
        })
        .filter(Boolean) || [];

      // Then get tokens from notifications table (new method)
      const { data: notificationsWithTokens } = await supabase
        .from('notifications')
        .select('id, expo_push_token')
        .eq('type', 'push')
        .not('expo_push_token', 'is', null);

      console.log('Fetching tokens from notifications:', notificationsWithTokens?.length);
      const notificationTokens = notificationsWithTokens
        ?.map(n => {
          const token = n.expo_push_token;
          if (token) {
            console.log('Found token in notification:', { notificationId: n.id, token });
          }
          return token;
        })
        .filter(Boolean) || [];

      // Combine tokens from both sources
      const allTokens = [...profileTokens, ...notificationTokens];

      if (allTokens.length === 0) {
        console.log('No push tokens found in either profiles or notifications tables');
        return [];
      }

      const uniqueTokens = [...new Set(allTokens)];
      console.log(`Found ${uniqueTokens.length} unique tokens for audience: ${targetAudience}`);
      return uniqueTokens;
    } catch (error) {
      console.error('Error fetching push tokens:', error);
      throw error;
    }
  }

  /**
   * Store a new push token for a user
   */
  async storeUserPushToken(userId: string, token: string) {
    try {
      // First, check for any existing registrations with this token
      const { data: existingRegistrations } = await supabase
        .from('notifications')
        .select('id, created_at')
        .eq('expo_push_token', token)
        .limit(1);

      // If token exists and is not too old, skip registration
      if (existingRegistrations && existingRegistrations.length > 0) {
        console.log('Token already registered:', token);
        return;
      }

      // Get current profile preferences
      const { data: profile } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', userId)
        .single();

      // Merge with existing preferences
      const currentPrefs = profile?.notification_preferences || {};
      const updatedPrefs = {
        ...currentPrefs,
        push: true,
        email: currentPrefs.email || false,
        fcm_token: token,
        push_enabled: true,
        subscriptions: currentPrefs.subscriptions || ['all']
      };

      // Update profile with merged preferences
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          notification_preferences: updatedPrefs
        })
        .eq('id', userId);

      if (profileError) {
        console.error('Error updating profile preferences:', profileError);
      }

      // Also store in notifications table
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          title: 'Device Registration',
          body: 'Push notifications enabled',
          type: 'push',
          target_audience: 'all',
          created_by: userId,
          expo_push_token: token,
          sent_at: new Date().toISOString() // Mark as processed immediately
        });

      if (notificationError) throw notificationError;
      console.log('Successfully stored push token in both locations:', token);
    } catch (error) {
      console.error('Error storing push token:', error);
      throw error;
    }
  }

  /**
   * Create a notification in the database
   */
  async createNotification(notification: {
    title: string;
    body: string;
    type: string;
    target_audience: string;
    link_to_article: string;
    scheduled_for?: string | null;
    created_by: string;
    expo_push_token?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          title: notification.title,
          body: notification.body,
          type: notification.type,
          target_audience: notification.target_audience,
          link_to_article: notification.link_to_article,
          scheduled_for: notification.scheduled_for,
          created_by: notification.created_by,
          expo_push_token: notification.expo_push_token || null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Process scheduled notifications
   */
  async processPendingNotifications() {
    try {
      const now = new Date().toISOString();

      // Get unsent notifications scheduled for now or in the past
      const { data: pendingNotifications, error } = await supabase
        .from('notifications')
        .select('*')
        .is('sent_at', null)
        .lte('scheduled_for', now);

      if (error) throw error;
      if (!pendingNotifications || pendingNotifications.length === 0) return;

      // Process each notification
      for (const notification of pendingNotifications) {
        try {
          // Get tokens for the target audience
          const tokens = await this.getTargetTokens(notification.target_audience);

          if (tokens.length === 0) {
            console.log(`No tokens found for notification ${notification.id}`);
            continue;
          }

          // Send the notification
          await this.sendNotification(tokens, {
            title: notification.title,
            body: notification.body,
            deep_link: notification.link_to_article
          });

          // Update sent_at timestamp
          const { error: updateError } = await supabase
            .from('notifications')
            .update({ sent_at: new Date().toISOString() })
            .eq('id', notification.id);

          if (updateError) {
            console.error(`Failed to update sent_at for notification ${notification.id}:`, updateError);
          }
        } catch (error) {
          console.error(`Error processing notification ${notification.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error processing pending notifications:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const pushNotificationService = new ExpoNotificationService();
