export interface NotificationRecord {
  id: string;
  title: string;
  body: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  type: 'push' | 'web' | 'token_refresh' | 'sync';
  target_audience: string;
  link_to_article: string | null;
  deep_link: string | null;
  scheduled_for: string | null;
  sent_at: string | null;
  created_at: string;
  created_by: string;
  retry_count: number;
}

export interface ProfileRecord {
  id: string;
  updated_at: string;
  username: string | null;
  notification_preferences: {
    push: boolean;
    email: boolean;
    expo_push_token: string | null;
  };
}

export interface Database {
  public: {
    Tables: {
      notifications: {
        Row: NotificationRecord;
      };
      profiles: {
        Row: ProfileRecord;
      };
    };
  };
}

export type DbCount = { count: number | null };
