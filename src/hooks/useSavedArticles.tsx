
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  fetchSavedArticles,
  saveArticle as saveArticleApi,
  unsaveArticle as unsaveArticleApi,
  toggleReadStatus as toggleReadStatusApi,
  type SavedArticleWithDetails
} from './saved-articles/savedArticlesApi';
import { useRealtimeSubscription } from './saved-articles/useRealtimeSubscription';
import { 
  isArticleSaved as checkArticleSaved,
  getSavedArticleByArticleId as getArticleById
} from './saved-articles/savedArticlesUtils';

export type { SavedArticleWithDetails } from './saved-articles/savedArticlesApi';

export function useSavedArticles() {
  const [savedArticles, setSavedArticles] = useState<SavedArticleWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch saved articles with article details
  const fetchUserSavedArticles = useCallback(async () => {
    if (!user) {
      setSavedArticles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error: fetchError } = await fetchSavedArticles(user.id);
    setSavedArticles(data);
    setError(fetchError);
    setLoading(false);
  }, [user]);

  // Hook into realtime updates
  const realtimeHandlers = {
    onInsert: (newArticle: SavedArticleWithDetails) => {
      setSavedArticles(prev => [newArticle, ...prev]);
    },
    onUpdate: (updatedArticle: SavedArticleWithDetails) => {
      setSavedArticles(prev => 
        prev.map(article => 
          article.id === updatedArticle.id 
            ? { ...article, ...updatedArticle } 
            : article
        )
      );
    },
    onDelete: (deletedId: string) => {
      setSavedArticles(prev => prev.filter(article => article.id !== deletedId));
    }
  };

  useRealtimeSubscription(user?.id, realtimeHandlers);

  // Save an article
  const saveArticle = async (articleId: string) => {
    return user ? saveArticleApi(user.id, articleId) : false;
  };

  // Unsave an article
  const unsaveArticle = async (articleId: string) => {
    return user ? unsaveArticleApi(user.id, articleId) : false;
  };

  // Mark article as read/unread
  const toggleReadStatus = async (savedArticleId: string, isRead: boolean) => {
    return user ? toggleReadStatusApi(user.id, savedArticleId, isRead) : false;
  };

  // Check if an article is saved
  const isArticleSaved = (articleId: string): boolean => {
    return checkArticleSaved(savedArticles, articleId);
  };

  // Find saved article entry by article ID
  const getSavedArticleByArticleId = (articleId: string): SavedArticleWithDetails | undefined => {
    return getArticleById(savedArticles, articleId);
  };

  // Initial fetch
  useEffect(() => {
    fetchUserSavedArticles();
  }, [fetchUserSavedArticles]);

  return {
    savedArticles,
    loading,
    error,
    saveArticle,
    unsaveArticle,
    toggleReadStatus,
    isArticleSaved,
    getSavedArticleByArticleId,
    refresh: fetchUserSavedArticles
  };
}
