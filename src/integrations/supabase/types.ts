export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      notifications: {
        Row: {
          id: string;
          created_at: string;
          created_by: string;
          title: string;
          body: string;
          status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
          type: string;
          retry_count: number;
          target_audience: string;
          link_to_article: string;
          scheduled_for: string | null;
          sent_at: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          created_by: string;
          title: string;
          body: string;
          status?: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
          type: string;
          retry_count?: number;
          target_audience: string;
          link_to_article: string;
          scheduled_for?: string | null;
          sent_at?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          created_by?: string;
          title?: string;
          body?: string;
          status?: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
          type?: string;
          retry_count?: number;
          target_audience?: string;
          link_to_article?: string;
          scheduled_for?: string | null;
          sent_at?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          username: string | null;
          notification_preferences: Json; // Use Json type here
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          username?: string | null;
          notification_preferences?: Json; // Use Json type here
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          username?: string | null;
          notification_preferences?: Json; // Use Json type here
        };
      };
    };
  };
}
