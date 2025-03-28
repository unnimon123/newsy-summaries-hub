
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NewsArticle } from "@/components/NewsForm";

// Define the news status type to match Supabase's enum
export type NewsStatus = "draft" | "published" | "all";

export const useNewsArticles = (statusFilter: NewsStatus) => {
  const queryClient = useQueryClient();

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
        status: item.status,
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
          status: article.status || 'draft',
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select();
      
      if (error) {
        console.error('Error creating article:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      console.log('Article created successfully');
      queryClient.invalidateQueries({ queryKey: ['news'] });
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
      if (!article.id) {
        throw new Error("Article ID is required for updates");
      }
      
      console.log('Updating article:', article);
      
      // Map our form data to the database schema
      const { error } = await supabase
        .from('news')
        .update({
          title: article.title,
          summary: article.summary,
          image_path: article.imageUrl,
          source_url: article.sourceUrl,
          category_id: article.category,
          status: article.status || 'draft',
        })
        .eq('id', article.id);
      
      if (error) {
        console.error('Error updating article:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('Article updated successfully');
      queryClient.invalidateQueries({ queryKey: ['news'] });
      toast.success('Article updated successfully');
    },
    onError: (error) => {
      console.error('Error in updateArticleMutation:', error);
      toast.error(`Failed to update article: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Delete article mutation
  const deleteArticleMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting article:', id);
      
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
      
      if (error) {
        console.error('Error deleting article:', error);
        throw error;
      }
      
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
      console.log('Article deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['news'] });
      toast.success('Article deleted successfully');
    },
    onError: (error) => {
      console.error('Error in deleteArticleMutation:', error);
      toast.error(`Failed to delete article: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  return {
    newsData,
    newsLoading,
    createArticleMutation,
    updateArticleMutation,
    deleteArticleMutation
  };
};
