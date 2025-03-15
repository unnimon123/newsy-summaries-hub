
import { createClient } from '@supabase/supabase-js';
import { ENV } from '@/config/env';
import type { Database } from './types';

// For React Native, you'll typically need to setup storage adapter
// This is a basic example without a storage adapter
// In a real app, you would use something like:
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { createClient } from '@supabase/supabase-js';
// import { setupURLPolyfill } from 'react-native-url-polyfill';

// setupURLPolyfill(); // Important for React Native

// Create a Supabase client optimized for React Native
export const supabase = createClient<Database>(
  ENV.SUPABASE_URL,
  ENV.SUPABASE_ANON_KEY,
  {
    auth: {
      // In a real app you would use AsyncStorage
      // storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
        realtimeTimeout: 30000
      }
    },
  }
);

// For debugging in development
console.log('Supabase client initialized for React Native');
