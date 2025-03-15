import { useState } from "react";
import { PlusCircle, Search, Loader2 } from "lucide-react";
import MainLayout from "@/components/MainLayout";
import NewsForm, { NewsArticle } from "@/components/NewsForm";
import NewsCard from "@/components/NewsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Define the news status type to match Supabase's enum
type NewsStatus = "draft" | "published" | "all";

const NewsManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<NewsStatus>("all");
  const queryClient = useQueryClient();

  // Fetch categories from Supabase
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      console.log('Fetching categories from Supabase...');
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
      
      console.log('Fetched categories:', data?.length || 0);
      return data;
    },
  });

  // Fetch news articles from Supabase
  const { data: newsData, isLoading: newsLoading } = useQuery({
    queryKey: ['news', statusFilter],
    queryFn: async () => {
      console.log(`Fetching news with status filter: ${statusFilter}`);
      let query = supabase
        .from('news')
        .select(`
          id, 
          title, 
          summary, 
          image_path, 
          source_url, 
          category_id, 
          status, 
          created_at, 
          view_count
        `)
        .order('created_at', { ascending: false });
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching news:', error);
        throw error;
      }
      
      console.log('Fetched news articles:', data?.length || 0);
      
      // Transform to match our NewsArticle interface
      return data.map(item => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        imageUrl: item.image_path || "",
        sourceUrl: item.source_url || "",
        category: item.category_id || "",
        timestamp: item.created_at,
        viewCount: item.view_count
      }));
    },
  });

  // Create article mutation
  const createArticleMutation = useMutation({
    mutationFn: async (article: NewsArticle) => {
      console.log('Creating new article:', article);
      // Map our form data to the database schema
      const { data, error } = await supabase
        .from('news')
        .insert({
          title: article.title,
          summary: article.summary,
          image_path: article.imageUrl,
          source_url: article.sourceUrl,
          category_id: article.category,
          status: 'draft',
          created_by: (await supabase.auth.getUser()).data.user?.id
        });
      
      if (error) {
        console.error('Error creating article:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      console.log('Article created successfully');
      queryClient.invalidateQueries({ queryKey: ['news'] });
      setShowForm(false);
      toast.success('Article created successfully!');
    },
    onError: (error) => {
      console.error('Error in createArticleMutation:', error);
      toast.error(`Failed to create article: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Update article mutation
  const updateArticleMutation = useMutation({
    mutationFn: async (article: NewsArticle) => {
      if (!article.id) return;
      
      // Map our form data to the database schema
      const { error } = await supabase
        .from('news')
        .update({
          title: article.title,
          summary: article.summary,
          image_path: article.imageUrl,
          source_url: article.sourceUrl,
          category_id: article.category,
        })
        .eq('id', article.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      setEditingArticle(null);
    },
  });

  // Delete article mutation
  const deleteArticleMutation = useMutation({
    mutationFn: async (id: string) => {
      // Get the image path first
      const { data: article } = await supabase
        .from('news')
        .select('image_path')
        .eq('id', id)
        .single();
      
      // Delete the article
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // If there's an image stored in Supabase, delete it
      if (article?.image_path && article.image_path.includes('news-images')) {
        try {
          // Extract the path after the bucket name in the URL
          const urlParts = article.image_path.split('news-images/');
          if (urlParts.length > 1) {
            const filePath = urlParts[1];
            await supabase.storage.from('news-images').remove([filePath]);
          }
        } catch (err) {
          console.error('Failed to delete image from storage:', err);
          // Continue anyway as the article is already deleted
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });

  const handleCreateArticle = (article: NewsArticle) => {
    console.log('Handling article creation:', article);
    createArticleMutation.mutate(article);
  };

  const handleUpdateArticle = (article: NewsArticle) => {
    updateArticleMutation.mutate(article);
  };

  const handleDeleteArticle = async (id: string) => {
    return deleteArticleMutation.mutateAsync(id);
  };

  // Apply filters to the articles
  const filteredArticles = newsData?.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || article.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  }) || [];

  // Construct categories array for the filter dropdown
  const categories = [
    { value: "all", label: "All Categories" },
    ...(categoriesData?.map(cat => ({
      value: cat.id,
      label: cat.name
    })) || []),
  ];

  const isLoading = newsLoading || categoriesLoading;
  const isFormSubmitting = createArticleMutation.isPending;

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold tracking-tight">News Management</h1>
          <p className="text-muted-foreground">
            Create, edit and manage news articles for your mobile application.
          </p>
        </div>

        <Tabs defaultValue="all" onValueChange={(value) => setStatusFilter(value as NewsStatus)}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList>
              <TabsTrigger value="all">All Articles</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
            </TabsList>
            <Button onClick={() => setShowForm(true)} disabled={showForm}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Article
            </Button>
          </div>

          <TabsContent value="all" className="mt-4">
            {showForm && (
              <div className="mb-6">
                <NewsForm
                  onSubmit={handleCreateArticle}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            )}

            {editingArticle && (
              <div className="mb-6">
                <NewsForm
                  article={editingArticle}
                  onSubmit={handleUpdateArticle}
                  onCancel={() => setEditingArticle(null)}
                />
              </div>
            )}

            <div className="flex flex-col gap-4 mb-6 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search articles..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <h3 className="mt-2 text-lg font-semibold">No articles found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery || categoryFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Get started by creating a new article."}
                </p>
                {!showForm && (
                  <Button
                    onClick={() => setShowForm(true)}
                    variant="outline"
                    className="mt-4"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Article
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredArticles.map((article) => (
                  <NewsCard
                    key={article.id}
                    article={article}
                    onEdit={setEditingArticle}
                    onDelete={handleDeleteArticle}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="draft">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <h3 className="mt-2 text-lg font-semibold">No draft articles</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Draft articles will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredArticles.map((article) => (
                  <NewsCard
                    key={article.id}
                    article={article}
                    onEdit={setEditingArticle}
                    onDelete={handleDeleteArticle}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="published">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <h3 className="mt-2 text-lg font-semibold">No published articles</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Published articles will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredArticles.map((article) => (
                  <NewsCard
                    key={article.id}
                    article={article}
                    onEdit={setEditingArticle}
                    onDelete={handleDeleteArticle}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default NewsManagement;
