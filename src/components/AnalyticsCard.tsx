
import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: number;
  description?: string;
  className?: string;
}

const AnalyticsCard = ({
  title,
  value,
  icon,
  change,
  description,
  className,
}: AnalyticsCardProps) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <div className="h-8 w-8 rounded-md bg-primary/10 p-1.5 text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(change !== undefined || description) && (
          <p className="mt-2 flex items-center text-xs text-gray-500">
            {change !== undefined && (
              <>
                {change > 0 ? (
                  <ArrowUpIcon className="mr-1 h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDownIcon className="mr-1 h-3 w-3 text-red-500" />
                )}
                <span
                  className={cn(
                    "font-medium",
                    change > 0 ? "text-green-500" : "text-red-500"
                  )}
                >
                  {Math.abs(change)}%
                </span>
                <span className="ml-1">from last period</span>
              </>
            )}
            {description && <span>{description}</span>}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalyticsCard;
