interface BaseRecord {
  id: string;
  created_at: string;
}

export interface NotificationRecord extends BaseRecord {
  title: string;
  body: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  type: string;
  retry_count: number;
  target_audience: string;
  link_to_article: string;
  scheduled_for?: string;
  sent_at?: string;
}

export interface ProfilePreferences {
  push: boolean;
  email: boolean;
  expo_push_token: string | null;
}

export interface ProfileRecord extends BaseRecord {
  notification_preferences: ProfilePreferences;
  updated_at: string;
}

// Simplified query result types
export type QueryResult<T> = {
  data: T[] | null;
  error: Error | null;
};

export type SingleQueryResult<T> = {
  data: T | null;
  error: Error | null;
};

export type Count = { count: number };
export type CountQueryResult = SingleQueryResult<Count>;

// Common query result types
export type NotificationQueryResult = QueryResult<Pick<NotificationRecord, 'status' | 'created_at' | 'retry_count'>>;
export type ProfileQueryResult = QueryResult<Pick<ProfileRecord, 'notification_preferences' | 'updated_at'>>;
export type FailureQueryResult = QueryResult<Pick<NotificationRecord, 'created_at'>>;
