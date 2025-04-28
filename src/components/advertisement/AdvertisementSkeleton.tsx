import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

export const AdvertisementRowSkeleton = () => (
  <TableRow>
    <TableCell>
      <Skeleton className="h-4 w-[200px]" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-[100px]" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-6 w-[40px]" />
    </TableCell>
    <TableCell className="text-right">
      <Skeleton className="h-8 w-[60px] ml-auto" />
    </TableCell>
  </TableRow>
);

export const AdvertisementListSkeleton = () => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <Skeleton className="h-6 w-[180px]" />
      <Skeleton className="h-9 w-[100px]" />
    </div>
    <div className="border rounded-md">
      {Array.from({ length: 5 }).map((_, index) => (
        <AdvertisementRowSkeleton key={index} />
      ))}
    </div>
  </div>
);
