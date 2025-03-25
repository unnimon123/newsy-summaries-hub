import { useQuery, useMutation, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';
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

  // Create article mutation with enhanced error handling
  const createArticleMutation = useMutation({
    mutationFn: async (article: NewsArticle): Promise<any> => {
      let isTimedOut = false;
      const timeoutId = setTimeout(() => {
        isTimedOut = true;
      }, 60000); // Increased to 60 seconds

      try {
        console.log('Creating new article:', article);
        
        const result = await Promise.race<PostgrestResponse<any>>([
          supabase
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
            .select(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Operation timed out')), 60000)
          )
        ]);

        clearTimeout(timeoutId);
        if (isTimedOut) throw new Error('Operation timed out');

        if (result && 'error' in result && result.error) {
          console.error('Error creating article:', result.error);
          throw result.error;
        }
        
        return 'data' in result ? result.data : null;
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('Create article error:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to create article');
      }
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

  // Update article mutation with enhanced error handling and retries
  const updateArticleMutation = useMutation({
    mutationFn: async (article: NewsArticle): Promise<void> => {
      let isTimedOut = false;
      const timeoutId = setTimeout(() => {
        isTimedOut = true;
      }, 60000); // Increased to 60 seconds

      try {
        if (!article.id) {
          throw new Error("Article ID is required for updates");
        }
        
        console.log('Updating article:', article);
        
        // Implement retry logic for updates
        const updateWithRetry = async (attempts = 0): Promise<void> => {
          try {
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

            if (error) throw error;
          } catch (error) {
            if (attempts < 2) {
              console.log(`Retrying update (${attempts + 1}/3)`);
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
              return updateWithRetry(attempts + 1);
            }
            throw error;
          }
        };

        await Promise.race([
          updateWithRetry(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Operation timed out')), 60000)
          )
        ]);

        clearTimeout(timeoutId);
        if (isTimedOut) throw new Error('Operation timed out');
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('Update article error:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to update article');
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

  // Delete article mutation with enhanced error handling
  const deleteArticleMutation = useMutation({
    mutationFn: async (id: string) => {
      let isTimedOut = false;
      const timeoutId = setTimeout(() => {
        isTimedOut = true;
      }, 60000); // Increased to 60 seconds

      try {
        console.log('Deleting article:', id);
        
        // Get the image path first
        const fetchResult = await Promise.race<PostgrestSingleResponse<{ image_path: string }>>([
          supabase
            .from('news')
            .select('image_path')
            .eq('id', id)
            .single(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Operation timed out')), 60000)
          )
        ]);
        
        if (isTimedOut) throw new Error('Operation timed out');
        
        if (fetchResult && 'error' in fetchResult && fetchResult.error) {
          throw fetchResult.error;
        }
        
        const article = fetchResult && 'data' in fetchResult ? fetchResult.data : null;
        
        // Delete the article with retry logic
        const deleteWithRetry = async (attempts = 0): Promise<void> => {
          try {
            const { error } = await supabase
              .from('news')
              .delete()
              .eq('id', id);
            
            if (error) throw error;
          } catch (error) {
            if (attempts < 2) {
              console.log(`Retrying delete (${attempts + 1}/3)`);
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
              return deleteWithRetry(attempts + 1);
            }
            throw error;
          }
        };

        await Promise.race([
          deleteWithRetry(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Operation timed out')), 60000)
          )
        ]);

        if (isTimedOut) throw new Error('Operation timed out');
        
        // If there's an image stored in Supabase, delete it
        if (article?.image_path && article.image_path.includes('news-images')) {
          try {
            const urlParts = article.image_path.split('news-images/');
            if (urlParts.length > 1) {
              const filePath = urlParts[1];
              await Promise.race([
                supabase.storage
                  .from('news-images')
                  .remove([filePath]),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Operation timed out')), 60000)
                )
              ]);
            }
          } catch (err) {
            console.error('Failed to delete image from storage:', err);
            // Continue anyway as the article is already deleted
          }
        }

        clearTimeout(timeoutId);
      } catch (error: any) {
        clearTimeout(timeoutId);
        console.error('Delete article error:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to delete article');
      }
    },
    onSuccess: (_, deletedId) => {
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
    isError: newsData === undefined && !newsLoading,
    newsData,
    newsLoading,
    createArticleMutation,
    updateArticleMutation,
    deleteArticleMutation
  };
};
