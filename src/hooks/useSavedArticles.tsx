
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type SavedArticle = Database['public']['Tables']['saved_articles']['Row'];
type NewsArticle = Database['public']['Tables']['news']['Row'];

export type SavedArticleWithDetails = SavedArticle & {
  article: NewsArticle | null;
};

export function useSavedArticles() {
  const [savedArticles, setSavedArticles] = useState<SavedArticleWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch saved articles with article details
  const fetchSavedArticles = async () => {
    if (!user) {
      setSavedArticles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching saved articles for user:', user.id);
      
      const { data, error } = await supabase
        .from('saved_articles')
        .select(`
          *,
          article:news(*)
        `)
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false });

      if (error) {
        console.error('Error fetching saved articles:', error);
        throw error;
      }

      console.log('Fetched saved articles:', data?.length || 0);
      
      // Transform data to include the article details
      const articlesWithDetails = data?.map(item => ({
        ...item,
        article: item.article as unknown as NewsArticle
      })) || [];
      
      setSavedArticles(articlesWithDetails);
    } catch (err) {
      console.error('Error in fetchSavedArticles:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Save an article
  const saveArticle = async (articleId: string) => {
    if (!user) {
      toast.error('You must be logged in to save articles');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('saved_articles')
        .insert({
          user_id: user.id,
          article_id: articleId,
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error saving article:', error);
        toast.error('Failed to save article');
        return false;
      }

      toast.success('Article saved successfully');
      
      // Local update not needed as we'll get real-time updates
      // But we could add for optimistic updates
      
      return true;
    } catch (err) {
      console.error('Error in saveArticle:', err);
      toast.error('An error occurred while saving the article');
      return false;
    }
  };

  // Unsave an article
  const unsaveArticle = async (articleId: string) => {
    if (!user) {
      toast.error('You must be logged in to manage saved articles');
      return false;
    }

    try {
      const { error } = await supabase
        .from('saved_articles')
        .delete()
        .match({ 
          user_id: user.id,
          article_id: articleId 
        });

      if (error) {
        console.error('Error unsaving article:', error);
        toast.error('Failed to remove article from saved list');
        return false;
      }

      toast.success('Article removed from saved list');
      
      // Local update not needed as we'll get real-time updates
      // But we could add for optimistic updates
      
      return true;
    } catch (err) {
      console.error('Error in unsaveArticle:', err);
      toast.error('An error occurred while removing the article');
      return false;
    }
  };

  // Mark article as read/unread
  const toggleReadStatus = async (savedArticleId: string, isRead: boolean) => {
    if (!user) {
      toast.error('You must be logged in to update article status');
      return false;
    }

    try {
      const { error } = await supabase
        .from('saved_articles')
        .update({ is_read: isRead })
        .eq('id', savedArticleId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating read status:', error);
        toast.error('Failed to update article status');
        return false;
      }

      toast.success(`Article marked as ${isRead ? 'read' : 'unread'}`);
      return true;
    } catch (err) {
      console.error('Error in toggleReadStatus:', err);
      toast.error('An error occurred while updating the article');
      return false;
    }
  };

  // Check if an article is saved
  const isArticleSaved = (articleId: string): boolean => {
    return savedArticles.some(item => item.article_id === articleId);
  };

  // Find saved article entry by article ID
  const getSavedArticleByArticleId = (articleId: string): SavedArticleWithDetails | undefined => {
    return savedArticles.find(item => item.article_id === articleId);
  };

  // Set up real-time subscription
  useEffect(() => {
    let channel: RealtimeChannel;

    const setupRealtime = () => {
      if (!user) return;
      
      console.log('Setting up realtime subscription for saved articles');
      
      channel = supabase
        .channel('saved-articles-changes')
        .on('postgres_changes', 
          {
            event: 'INSERT',
            schema: 'public',
            table: 'saved_articles',
            filter: `user_id=eq.${user.id}`,
          },
          async (payload) => {
            console.log('INSERT event received for saved article:', payload);
            
            // Fetch the complete article details for the newly saved article
            const { data: articleData } = await supabase
              .from('news')
              .select('*')
              .eq('id', payload.new.article_id)
              .single();
              
            const newSavedArticle = {
              ...payload.new as SavedArticle,
              article: articleData as NewsArticle
            };
            
            setSavedArticles(prev => [newSavedArticle, ...prev]);
          }
        )
        .on('postgres_changes', 
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'saved_articles',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('UPDATE event received for saved article:', payload);
            const updatedArticle = payload.new as SavedArticle;
            
            setSavedArticles(prev => 
              prev.map(article => 
                article.id === updatedArticle.id 
                  ? { ...article, ...updatedArticle } 
                  : article
              )
            );
          }
        )
        .on('postgres_changes', 
          {
            event: 'DELETE',
            schema: 'public',
            table: 'saved_articles',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('DELETE event received for saved article:', payload);
            const deletedId = payload.old.id;
            setSavedArticles(prev => prev.filter(article => article.id !== deletedId));
          }
        )
        .subscribe((status) => {
          console.log('Realtime subscription status for saved articles:', status);
          if (status !== 'SUBSCRIBED') {
            console.error('Failed to subscribe to realtime updates for saved articles:', status);
          }
        });
    };

    // Initial fetch
    if (user) {
      fetchSavedArticles();
      setupRealtime();
    } else {
      setSavedArticles([]);
      setLoading(false);
    }

    // Cleanup function
    return () => {
      console.log('Cleaning up realtime subscription for saved articles');
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user]);

  return {
    savedArticles,
    loading,
    error,
    saveArticle,
    unsaveArticle,
    toggleReadStatus,
    isArticleSaved,
    getSavedArticleByArticleId,
    refresh: fetchSavedArticles
  };
}
