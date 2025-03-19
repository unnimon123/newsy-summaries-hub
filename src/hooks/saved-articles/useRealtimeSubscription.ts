
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { SavedArticleWithDetails } from './savedArticlesApi';

type SubscriptionHandler = {
  onInsert: (article: SavedArticleWithDetails) => void;
  onUpdate: (article: SavedArticleWithDetails) => void;
  onDelete: (id: string) => void;
};

export function useRealtimeSubscription(
  userId: string | undefined,
  handlers: SubscriptionHandler
) {
  useEffect(() => {
    let channel: RealtimeChannel;

    const setupRealtime = () => {
      if (!userId) return;
      
      console.log('Setting up realtime subscription for saved articles');
      
      channel = supabase
        .channel('saved-articles-changes')
        .on('postgres_changes', 
          {
            event: 'INSERT',
            schema: 'public',
            table: 'saved_articles',
            filter: `user_id=eq.${userId}`,
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
              ...payload.new as any,
              article: articleData
            };
            
            handlers.onInsert(newSavedArticle);
          }
        )
        .on('postgres_changes', 
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'saved_articles',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            console.log('UPDATE event received for saved article:', payload);
            handlers.onUpdate(payload.new as any);
          }
        )
        .on('postgres_changes', 
          {
            event: 'DELETE',
            schema: 'public',
            table: 'saved_articles',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            console.log('DELETE event received for saved article:', payload);
            handlers.onDelete(payload.old.id);
          }
        )
        .subscribe((status) => {
          console.log('Realtime subscription status for saved articles:', status);
          if (status !== 'SUBSCRIBED') {
            console.error('Failed to subscribe to realtime updates for saved articles:', status);
          }
        });
    };

    if (userId) {
      setupRealtime();
    }

    // Cleanup function
    return () => {
      console.log('Cleaning up realtime subscription for saved articles');
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId, handlers]);
}
