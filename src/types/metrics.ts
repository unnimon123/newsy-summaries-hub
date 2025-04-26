// Define simplified metrics types to avoid deep nesting
export interface DeliveryStats {
  total: number;
  failed: number;
  successful: number;
  retried: number;
  failureRate: number;
  tokenRefreshRate: number;
  syncFailureRate: number;
}

export interface TokenHealth {
  active: number;
  expired: number;
  refreshPending: number;
}

export interface PlatformBreakdown {
  ios: number;
  android: number;
}

export interface Alert {
  type: string;
  count: number;
  lastOccurred: Date;
}

export type MetricsData = {
  deliveryStats: DeliveryStats;
  tokenHealth: TokenHealth;
  platformBreakdown: PlatformBreakdown;
  alerts: Alert[];
};
