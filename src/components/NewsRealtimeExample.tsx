
import React, { useState } from 'react';
import { useNewsRealtime } from '@/hooks/useNewsRealtime';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

type NewsItemProps = {
  id: string;
  title: string;
  summary: string;
  image_path: string | null;
  created_at: string;
};

const NewsItem = ({ title, summary, image_path, created_at }: NewsItemProps) => {
  return (
    <Card className="mb-4 overflow-hidden">
      {image_path && (
        <div className="w-full h-48 overflow-hidden">
          <img 
            src={image_path} 
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{summary}</p>
        <p className="text-xs text-gray-500">{new Date(created_at).toLocaleDateString()}</p>
      </div>
    </Card>
  );
};

const NewsItemSkeleton = () => (
  <Card className="mb-4 overflow-hidden">
    <Skeleton className="w-full h-48" />
    <div className="p-4">
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-3 w-1/4" />
    </div>
  </Card>
);

export default function NewsRealtimeExample() {
  const { news, loading, error } = useNewsRealtime();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // The hook will automatically refresh when re-mounted
    // This is a placeholder for additional refresh logic if needed
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (loading && !refreshing) {
    return (
      <div className="flex flex-col space-y-4 p-4">
        <NewsItemSkeleton />
        <NewsItemSkeleton />
        <NewsItemSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md">
        <p className="text-center">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold p-4 bg-white">Latest News</h2>
      <Separator />
      
      {refreshing && (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      <div className="p-4">
        {news && news.length > 0 ? (
          <div>
            {news.map((item) => (
              <NewsItem key={item.id} {...item} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 p-8">No news articles available</p>
        )}
      </div>
      
      <Button 
        onClick={handleRefresh}
        className="mx-auto block mb-4"
      >
        Refresh
      </Button>
    </div>
  );
}
