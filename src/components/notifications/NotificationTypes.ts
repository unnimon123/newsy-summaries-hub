
export interface NotificationData {
  title: string;
  body: string;
  targetAudience: string;
  notificationType: "web" | "mobile" | "both";
  linkToArticle?: string;
  scheduleLater: boolean;
  scheduledTime?: string;
}

export interface NotificationWithId extends Omit<NotificationData, 'targetAudience'> {
  id: string;
  targetAudience: string;
  audience?: string;
  sent_at?: string;
  scheduled_for?: string;
  type?: string;
}

export type NotificationAudience = 'all' | 'education' | 'visa' | 'scholarship' | 'course' | 'immigration' | 'individual';

export interface SupabaseNotification {
  id: string;
  title: string;
  body: string;
  target_audience: string;
  audience: NotificationAudience;
  type: string;
  link_to_article: string | null;
  sent_at: string | null;
  scheduled_for: string | null;
  created_at: string;
  created_by: string | null;
  is_read: boolean;
  user_id: string | null;
}
