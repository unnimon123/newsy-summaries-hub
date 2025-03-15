
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type NewsItem = Database['public']['Tables']['news']['Row'];

export function useNewsRealtime(initialNews: NewsItem[] = []) {
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial news data
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        console.log('Fetching news articles from Supabase...');
        
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching news:', error);
          throw error;
        }

        console.log('Fetched news articles:', data?.length || 0);
        
        if (data) {
          setNews(data);
        }
      } catch (err) {
        console.error('Error in fetchNews:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    let channel: RealtimeChannel;

    const setupRealtime = () => {
      console.log('Setting up realtime subscription for news table');
      
      channel = supabase
        .channel('news-changes')
        .on('postgres_changes', 
          {
            event: 'INSERT',
            schema: 'public',
            table: 'news',
            filter: 'status=eq.published',
          },
          (payload) => {
            console.log('INSERT event received:', payload);
            const newArticle = payload.new as NewsItem;
            setNews(prevNews => [newArticle, ...prevNews]);
          }
        )
        .on('postgres_changes', 
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'news',
          },
          (payload) => {
            console.log('UPDATE event received:', payload);
            const updatedArticle = payload.new as NewsItem;
            
            // If article status changed to draft, remove it
            if (updatedArticle.status === 'draft') {
              setNews(prevNews => prevNews.filter(article => article.id !== updatedArticle.id));
            } else {
              // Otherwise update it in the list
              setNews(prevNews => 
                prevNews.map(article => 
                  article.id === updatedArticle.id ? updatedArticle : article
                )
              );
            }
          }
        )
        .on('postgres_changes', 
          {
            event: 'DELETE',
            schema: 'public',
            table: 'news',
          },
          (payload) => {
            console.log('DELETE event received:', payload);
            const deletedId = payload.old.id;
            setNews(prevNews => prevNews.filter(article => article.id !== deletedId));
          }
        )
        .subscribe((status) => {
          console.log('Realtime subscription status:', status);
          if (status !== 'SUBSCRIBED') {
            console.error('Failed to subscribe to realtime updates:', status);
          }
        });
    };

    setupRealtime();

    // Cleanup function
    return () => {
      console.log('Cleaning up realtime subscription');
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  return { news, loading, error };
}
