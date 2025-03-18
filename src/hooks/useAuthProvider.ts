
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
    console.log("Auth provider initialization starting");
    let mounted = true;

    // Safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      if (mounted && !initialLoadDone) {
        console.log("Safety timeout triggered: forcing initialLoadDone to true");
        setLoading(false);
        setInitialLoadDone(true);
      }
    }, 3000); // Reduced from 5000 to 3000 for faster fallback

    const initializeAuth = async () => {
      try {
        console.log("Getting session from Supabase");
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Session received:", session ? "Session exists" : "No session");

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            console.log("Fetching user profile and role");
            try {
              const userProfile = await fetchUserProfile(session.user.id);
              if (userProfile && mounted) {
                console.log("User profile fetched successfully");
                setProfile(userProfile);
              }

              const userRoleData = await fetchUserRole(session.user.id);
              if (userRoleData && mounted) {
                console.log("User role fetched successfully:", userRoleData.role);
                setUserRole(userRoleData);
              }
            } catch (profileError) {
              console.error("Error fetching profile or role:", profileError);
            } finally {
              if (mounted) {
                setLoading(false);
                setInitialLoadDone(true);
                clearTimeout(safetyTimeout);
              }
            }
          } else {
            console.log("No user in session, setting profile and role to null");
            setProfile(null);
            setUserRole(null);
            setLoading(false);
            setInitialLoadDone(true);
            clearTimeout(safetyTimeout);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
          setInitialLoadDone(true);
          clearTimeout(safetyTimeout);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, "User:", session?.user?.email);

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);

          if (event === 'SIGNED_OUT') {
            console.log("Signed out event detected, clearing auth state");
            setProfile(null);
            setUserRole(null);
            setInitialLoadDone(true);
            setLoading(false);
            clearTimeout(safetyTimeout);
          } else if (session?.user) {
            console.log("User authenticated, fetching profile data");
            try {
              const userProfile = await fetchUserProfile(session.user.id);
              if (userProfile && mounted) {
                setProfile(userProfile);
              }

              const userRoleData = await fetchUserRole(session.user.id);
              if (userRoleData && mounted) {
                setUserRole(userRoleData);
              }
            } catch (error) {
              console.error("Error fetching profile/role during auth change:", error);
            } finally {
              if (mounted) {
                setInitialLoadDone(true);
                setLoading(false);
                clearTimeout(safetyTimeout);
              }
            }
          } else {
            console.log("Auth changed but no user, setting loading to false");
            setLoading(false);
            setInitialLoadDone(true);
            clearTimeout(safetyTimeout);
          }
        }
      }
    );

    return () => {
      console.log("Auth provider cleanup");
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

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
      throw error; // Rethrow to be handled by caller
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      setLoading(true);
      console.log("Signing in with email:", email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log("Login process completed.");
      toast.success("Login successful!");
      navigate('/');
    } catch (error: any) {
      toast.error(error.error_description || error.message);
      console.error("Login failed:", error);
      throw error; // Rethrow to be handled by caller
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      // Clear local state after successful signout
      setProfile(null);
      setUserRole(null);
      setUser(null);
      setSession(null);

      toast.success("Signed out successfully");
      // Force redirect after signout
      navigate('/auth/login', { replace: true });
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error(error.error_description || error.message);

      // Even if there's an error, attempt to redirect
      navigate('/auth/login', { replace: true });
    } finally {
      setLoading(false);
    }
  }

  // Debug info
  console.log("Auth provider state:", {
    hasUser: !!user,
    hasSession: !!session,
    isAdmin: userRole?.role === 'admin',
    loading,
    initialLoadDone
  });

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
