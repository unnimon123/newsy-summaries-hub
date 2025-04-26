import { Json } from '@/integrations/supabase/types';

export enum NotificationErrorTypes {
  DELIVERY_FAILURE = 'DELIVERY_FAILURE',
  TOKEN_REFRESH_FAILURE = 'TOKEN_REFRESH_FAILURE',
  SYNC_FAILURE = 'SYNC_FAILURE',
  INVALID_DEEP_LINK = 'INVALID_DEEP_LINK',
  PERMISSION_DENIED = 'PERMISSION_DENIED'
}

export interface NotificationMetrics {
  deliveryStats: {
    failureRate: number;
    tokenRefreshRate: number;
    syncFailureRate: number;
    total: number;
    successful: number;
    failed: number;
    retried: number;
  };
  tokenHealth: {
    active: number;
    expired: number;
    refreshPending: number;
  };
  platformBreakdown: {
    ios: number;
    android: number;
  };
  alerts: {
    type: NotificationErrorTypes;
    count: number;
    lastOccurred: Date;
  }[];
}

export interface DeliveryStatus {
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  timestamp: Date;
  notificationId: string;
}

export interface ExpoToken {
  token: string;
  platform: 'ios' | 'android';
  deviceId: string;
  notification_preferences: Json; // Use Json type here
}

export const NOTIFICATION_THRESHOLDS = {
  DELIVERY_FAILURE_RATE: 0.10, // 10%
  TOKEN_REFRESH_FAILURE_RATE: 0.05, // 5%
  SYNC_FAILURE_RATE: 0.10, // 10%
  MAX_RETRY_ATTEMPTS: 3
};
