
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { SavedArticleWithDetails } from './savedArticlesApi';
import { toast } from 'sonner';

type SubscriptionHandler = {
  onInsert: (article: SavedArticleWithDetails) => void;
  onUpdate: (article: SavedArticleWithDetails) => void;
  onDelete: (id: string) => void;
};

export function useRealtimeSubscription(
  userId: string | undefined,
  handlers: SubscriptionHandler
) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!userId) {
      console.log('No userId provided for realtime subscription');
      return;
    }
      
    console.log('Setting up realtime subscription for saved articles');
    
    const setupChannel = () => {
      channelRef.current = supabase
        .channel(`saved-articles-changes-${userId}`)
        .on('postgres_changes', 
          {
            event: 'INSERT',
            schema: 'public',
            table: 'saved_articles',
            filter: `user_id=eq.${userId}`,
          },
          async (payload) => {
            console.log('INSERT event received for saved article:', payload);
            
            try {
              // Fetch the complete article details for the newly saved article
              const { data: articleData, error } = await supabase
                .from('news')
                .select('*')
                .eq('id', payload.new.article_id)
                .single();
                
              if (error) throw error;
              
              const newSavedArticle = {
                ...payload.new as any,
                article: articleData
              };
              
              handlers.onInsert(newSavedArticle);
              toast.success('Article saved successfully');
            } catch (error) {
              console.error('Error processing INSERT event:', error);
              toast.error('Failed to process saved article');
            }
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
            try {
              handlers.onUpdate(payload.new as any);
            } catch (error) {
              console.error('Error processing UPDATE event:', error);
            }
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
            try {
              handlers.onDelete(payload.old.id);
              toast.success('Article removed from saved list');
            } catch (error) {
              console.error('Error processing DELETE event:', error);
            }
          }
        )
        .subscribe((status) => {
          console.log('Realtime subscription status for saved articles:', status);
          if (status !== 'SUBSCRIBED') {
            console.error('Failed to subscribe to realtime updates for saved articles:', status);
          }
        });
    };

    setupChannel();

    // Cleanup function
    return () => {
      console.log('Cleaning up realtime subscription for saved articles');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, handlers]);
}
