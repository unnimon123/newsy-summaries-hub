import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const AdvertisementFormSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-7 w-[200px]" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Skeleton className="h-5 w-[100px] mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div>
          <Skeleton className="h-5 w-[120px] mb-2" />
          <Skeleton className="h-32 w-full rounded-md" />
        </div>

        <div>
          <Skeleton className="h-5 w-[80px] mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div>
          <Skeleton className="h-5 w-[100px] mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div>
          <Skeleton className="h-5 w-[140px] mb-2" />
          <Skeleton className="h-10 w-[120px]" />
        </div>

        <div className="flex items-center space-x-2">
          <Skeleton className="h-6 w-10" />
          <Skeleton className="h-5 w-[60px]" />
        </div>

        <div className="flex justify-between pt-4">
          <Skeleton className="h-10 w-[100px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
      </CardContent>
    </Card>
  );
};
