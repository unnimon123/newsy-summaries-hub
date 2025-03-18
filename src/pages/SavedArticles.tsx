
import { useState } from 'react';
import { useSavedArticles } from '@/hooks/useSavedArticles';
import NewsCard from '@/components/NewsCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Loader2, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NewsArticle } from '@/components/NewsForm';

export default function SavedArticlesPage() {
  const { savedArticles, loading, toggleReadStatus, refresh } = useSavedArticles();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle filtering by read status
  const filteredArticles = savedArticles.filter(item => {
    if (activeTab === 'read') return item.is_read;
    if (activeTab === 'unread') return !item.is_read;
    return true; // 'all' tab
  }).filter(item => 
    item.article && (
      item.article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.article.summary.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleToggleRead = async (articleId: string, savedId: string, currentStatus: boolean) => {
    await toggleReadStatus(savedId, !currentStatus);
  };

  const renderSavedNewsCard = (savedItem: any) => {
    if (!savedItem.article) return null;
    
    // Convert to the format expected by NewsCard
    const article: NewsArticle = {
      id: savedItem.article.id,
      title: savedItem.article.title,
      summary: savedItem.article.summary,
      content: savedItem.article.content,
      category: savedItem.article.category_id,
      imageUrl: savedItem.article.image_path,
      sourceUrl: savedItem.article.source_url,
      sourceName: savedItem.article.source_name,
      timestamp: savedItem.article.created_at,
      status: savedItem.article.status,
    };

    return (
      <div key={savedItem.id} className="relative">
        <div className={`${savedItem.is_read ? 'opacity-70' : ''}`}>
          <NewsCard 
            article={article}
            onEdit={() => {}} // Not needed for saved articles view
            onDelete={() => {}} // Not needed for saved articles view
            viewOnly={true}
          />
        </div>
        <div className="absolute top-2 right-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleToggleRead(
              savedItem.article_id, 
              savedItem.id, 
              savedItem.is_read
            )}
          >
            {savedItem.is_read ? 'Mark as Unread' : 'Mark as Read'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Saved Articles</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <Separator className="my-4" />
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Input
            placeholder="Search saved articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        </div>
        
        <Tabs 
          defaultValue="all" 
          className="w-full md:w-auto"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="read">Read</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Loading saved articles...</p>
          </div>
        </div>
      ) : filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArticles.map(item => renderSavedNewsCard(item))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-medium mb-2">No saved articles found</h3>
          <p className="text-gray-500">
            {searchQuery 
              ? "No articles match your search criteria" 
              : activeTab !== 'all' 
                ? `You don't have any ${activeTab} articles`
                : "Bookmark articles you want to read later!"
            }
          </p>
        </div>
      )}
    </div>
  );
}
