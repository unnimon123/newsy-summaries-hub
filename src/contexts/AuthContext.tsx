import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  notification_preferences: {
    push: boolean;
    email: boolean;
  } | null;
};

type UserRole = {
  role: 'admin' | 'user';
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  userRole: UserRole | null;
  signUp: (email: string, password: string, redirectUrl?: string) => Promise<void>;
  signIn: (email: string, password: string, redirectUrl?: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Check if we're in a mobile environment
const isMobileApp = () => {
  // This is a basic check - in a real app, you might use something like react-native-device-info
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  return /android|iphone|ipad|ipod/i.test(userAgent.toLowerCase());
};

// Get app-specific redirect URL
const getRedirectUrl = (providedUrl?: string) => {
  if (providedUrl) return providedUrl;
  
  if (isMobileApp()) {
    // For mobile deep linking, use a custom URL scheme
    // Replace with your actual app scheme
    return 'newsy-app://auth/callback';
  }
  
  // Web fallback
  return window.location.origin + '/auth/callback';
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (location.pathname === '/auth/callback') {
        const { hash, search } = window.location;
        if (hash || search) {
          // Process the auth callback
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error during auth callback:', error);
            toast.error('Authentication failed');
            navigate('/auth/login');
            return;
          }
          
          if (data.session) {
            toast.success('Authentication successful');
            navigate('/');
          }
        }
      }
    };
    
    handleAuthCallback();
  }, [location.pathname, navigate]);

  useEffect(() => {
    // Set up the initial session and subscribe to auth changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
        fetchUserRole(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
          await fetchUserRole(session.user.id);
        } else {
          setProfile(null);
          setUserRole(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      // Transform the notification_preferences from Json to our expected type
      const transformedProfile: Profile = {
        id: data.id,
        username: data.username,
        avatar_url: data.avatar_url,
        notification_preferences: data.notification_preferences ? {
          push: typeof data.notification_preferences === 'object' && 
                data.notification_preferences !== null && 
                'push' in data.notification_preferences 
                ? Boolean(data.notification_preferences.push) 
                : true,
          email: typeof data.notification_preferences === 'object' && 
                 data.notification_preferences !== null && 
                 'email' in data.notification_preferences 
                 ? Boolean(data.notification_preferences.email) 
                 : false
        } : null
      };

      setProfile(transformedProfile);
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
    }
  }

  async function fetchUserRole(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }

      setUserRole(data as UserRole);
    } catch (error) {
      console.error('Unexpected error fetching role:', error);
    }
  }

  async function signUp(email: string, password: string, redirectUrl?: string) {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getRedirectUrl(redirectUrl)
        }
      });

      if (error) throw error;
      
      toast.success("Signup successful! Please check your email for verification.");
      navigate('/auth/login');
    } catch (error: any) {
      toast.error(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string, redirectUrl?: string) {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success("Login successful!");
      navigate('/');
    } catch (error: any) {
      toast.error(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      navigate('/auth/login');
    } catch (error: any) {
      toast.error(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        userRole,
        signUp,
        signIn,
        signOut,
        loading,
        isAdmin: userRole?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
