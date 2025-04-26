import { Database } from './types';

export type Tables = Database['public']['Tables'];

export type NotificationRow = Tables['notifications']['Row'];
export type NotificationInsert = Tables['notifications']['Insert'];
export type NotificationUpdate = Tables['notifications']['Update'];

export type ProfileRow = Tables['profiles']['Row'];
export type ProfileInsert = Tables['profiles']['Insert'];
export type ProfileUpdate = Tables['profiles']['Update'];

export interface QueryResult<T> {
  data: T[] | null;
  error: Error | null;
}

export interface SingleQueryResult<T> {
  data: T | null;
  error: Error | null;
  count?: number | null;
}

export interface NotificationStats {
  status: NotificationRow['status'];
  created_at: string;
  retry_count: number;
}

export interface ProfileStats {
  notification_preferences: ProfileRow['notification_preferences'];
  updated_at: string;
}
