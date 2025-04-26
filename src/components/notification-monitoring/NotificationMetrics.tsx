import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Clock, Smartphone } from 'lucide-react';
import { NotificationMetrics as NotificationMetricsType } from '@/types/notification';
import { notificationMetricsService } from '@/services/notificationMetricsService';
import { toast } from 'sonner';

// Import from shadcn charts when available
// For now we'll use a simple div to show the stats

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard = ({ title, value, description, icon, trend }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
      {trend && (
        <div className={`text-xs mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {trend.isPositive ? '↑' : '↓'} {trend.value}%
        </div>
      )}
    </CardContent>
  </Card>
);

interface DeliveryRateChartProps {
  data: { date: string; rate: number }[];
}

const DeliveryRateChart = ({ data }: DeliveryRateChartProps) => (
  <div className="h-[200px] w-full">
    {/* Replace this with an actual chart component */}
    <div className="text-center text-sm text-muted-foreground">
      Chart showing delivery rate over time will be displayed here
    </div>
  </div>
);

export const NotificationMetrics = () => {
  const [metrics, setMetrics] = useState<NotificationMetricsType | null>(null);
  const [deliveryRateData, setDeliveryRateData] = useState<{ date: string; rate: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [metricsData, rateData] = await Promise.all([
          notificationMetricsService.getDeliveryMetrics(),
          notificationMetricsService.getDeliveryRateOverTime(30)
        ]);

        setMetrics(metricsData);
        setDeliveryRateData(rateData);
      } catch (error) {
        console.error('Error fetching metrics:', error);
        toast.error('Failed to load notification metrics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
    
    // Refresh metrics every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading metrics...</div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Failed to load metrics. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  const { deliveryStats, tokenHealth, platformBreakdown } = metrics;
  const deliveryRate = deliveryStats.total > 0
    ? ((deliveryStats.successful / deliveryStats.total) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Delivery Rate"
          value={`${deliveryRate}%`}
          description={`${deliveryStats.successful} of ${deliveryStats.total} notifications delivered`}
          icon={<CheckCircle2 className="h-4 w-4 text-green-600" />}
        />
        
        <StatCard
          title="Active Devices"
          value={tokenHealth.active}
          description={`${platformBreakdown.ios} iOS, ${platformBreakdown.android} Android`}
          icon={<Smartphone className="h-4 w-4 text-blue-600" />}
        />
        
        <StatCard
          title="Failed Deliveries"
          value={deliveryStats.failed}
          description={`${deliveryStats.retried} notifications retried`}
          icon={<AlertCircle className="h-4 w-4 text-red-600" />}
        />
        
        <StatCard
          title="Token Refresh Rate"
          value={`${(deliveryStats.tokenRefreshRate * 100).toFixed(1)}%`}
          description={`${tokenHealth.refreshPending} tokens pending refresh`}
          icon={<Clock className="h-4 w-4 text-yellow-600" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Rate Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <DeliveryRateChart data={deliveryRateData} />
        </CardContent>
      </Card>

      {metrics.alerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {metrics.alerts.map((alert, index) => (
                <li key={index} className="flex items-center text-sm text-red-600">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  {alert.type}: {alert.count} occurrences
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
