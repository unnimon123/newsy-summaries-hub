
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Profile, UserRole } from "@/types/auth";
import { fetchUserProfile, fetchUserRole } from "@/services/profileService";
import { getRedirectUrl } from "@/utils/environmentUtils";

/**
 * Hook for providing auth functionality and state
 */
export function useAuthProvider() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle auth callback
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

  // Initialize auth and subscribe to changes
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const userProfile = await fetchUserProfile(session.user.id);
          if (userProfile) setProfile(userProfile);
          
          const userRoleData = await fetchUserRole(session.user.id);
          if (userRoleData) setUserRole(userRoleData);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
        setInitialLoadDone(true);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const userProfile = await fetchUserProfile(session.user.id);
          if (userProfile) setProfile(userProfile);
          
          const userRoleData = await fetchUserRole(session.user.id);
          if (userRoleData) setUserRole(userRoleData);
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

  // Authentication methods
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

  async function signIn(email: string, password: string) {
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

  return {
    session,
    user,
    profile,
    userRole,
    signUp,
    signIn,
    signOut,
    loading,
    initialLoadDone,
    isAdmin: userRole?.role === 'admin',
  };
}
