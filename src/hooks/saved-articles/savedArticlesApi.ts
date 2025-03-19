
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type SavedArticle = Database['public']['Tables']['saved_articles']['Row'];
type NewsArticle = Database['public']['Tables']['news']['Row'];

export type SavedArticleWithDetails = SavedArticle & {
  article: NewsArticle | null;
};

// Fetch saved articles with article details
export async function fetchSavedArticles(userId: string) {
  try {
    console.log('Fetching saved articles for user:', userId);
    
    const { data, error } = await supabase
      .from('saved_articles')
      .select(`
        *,
        article:news(*)
      `)
      .eq('user_id', userId)
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
    
    return { data: articlesWithDetails, error: null };
  } catch (err) {
    console.error('Error in fetchSavedArticles:', err);
    return { 
      data: [], 
      error: err instanceof Error ? err.message : 'An unknown error occurred' 
    };
  }
}

// Save an article
export async function saveArticle(userId: string, articleId: string) {
  if (!userId) {
    toast.error('You must be logged in to save articles');
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('saved_articles')
      .insert({
        user_id: userId,
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
    return true;
  } catch (err) {
    console.error('Error in saveArticle:', err);
    toast.error('An error occurred while saving the article');
    return false;
  }
}

// Unsave an article
export async function unsaveArticle(userId: string, articleId: string) {
  if (!userId) {
    toast.error('You must be logged in to manage saved articles');
    return false;
  }

  try {
    const { error } = await supabase
      .from('saved_articles')
      .delete()
      .match({ 
        user_id: userId,
        article_id: articleId 
      });

    if (error) {
      console.error('Error unsaving article:', error);
      toast.error('Failed to remove article from saved list');
      return false;
    }

    toast.success('Article removed from saved list');
    return true;
  } catch (err) {
    console.error('Error in unsaveArticle:', err);
    toast.error('An error occurred while removing the article');
    return false;
  }
}

// Mark article as read/unread
export async function toggleReadStatus(userId: string, savedArticleId: string, isRead: boolean) {
  if (!userId) {
    toast.error('You must be logged in to update article status');
    return false;
  }

  try {
    const { error } = await supabase
      .from('saved_articles')
      .update({ is_read: isRead })
      .eq('id', savedArticleId)
      .eq('user_id', userId);

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
}
