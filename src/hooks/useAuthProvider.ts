import { useState, useEffect, useRef } from "react";
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
interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  userRole: UserRole | null;
  loading: boolean;
  initialLoadDone: boolean;
}

export function useAuthProvider() {
  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    user: null,
    profile: null,
    userRole: null,
    loading: true,
    initialLoadDone: false
  });
  
  const navigate = useNavigate();
  const location = useLocation();

  // Cache management
  const dataCache = useRef<{
    profile?: Profile;
    userRole?: UserRole;
    lastFetch: number;
  }>({ lastFetch: 0 });
  
  // Strict initialization control
  const hasInitialized = useRef(false);
  const initializeAttempts = useRef(0);
  const isInitializing = useRef(false);
  const lastEventTimestamp = useRef(0);

  // Batch update auth state
  const updateAuthState = (updates: Partial<AuthState>) => {
    setAuthState(current => ({
      ...current,
      ...updates
    }));
  };

  // Handle auth state change with deduplication
  const handleAuthStateChange = async (newSession: Session | null, event?: string) => {
    // Deduplicate events within 100ms window
    const now = Date.now();
    if (now - lastEventTimestamp.current < 100) {
      console.log("Skipping duplicate auth event");
      return;
    }
    lastEventTimestamp.current = now;

    console.log("Auth state handler:", { event, email: newSession?.user?.email });

    // For INITIAL_SESSION, just update basic state
    if (event === 'INITIAL_SESSION') {
      updateAuthState({
        session: newSession,
        user: newSession?.user ?? null
      });
      return;
    }

    // Handle sign out
    if (event === 'SIGNED_OUT') {
      await clearAuthState();
      return;
    }

    // Update basic auth state
    updateAuthState({
      session: newSession,
      user: newSession?.user ?? null
    });

    // Fetch additional data if we have a user
    if (newSession?.user) {
      try {
        // Check cache first
        const cacheAge = Date.now() - dataCache.current.lastFetch;
        if (cacheAge < 5000 && dataCache.current.profile && dataCache.current.userRole) {
          console.log("Using cached profile and role data");
          updateAuthState({
            profile: dataCache.current.profile,
            userRole: dataCache.current.userRole
          });
          return;
        }

        const [userProfile, userRoleData] = await Promise.all([
          fetchUserProfile(newSession.user.id),
          fetchUserRole(newSession.user.id)
        ]);

        // Update cache and state together
        dataCache.current = {
          profile: userProfile || undefined,
          userRole: userRoleData || undefined,
          lastFetch: Date.now()
        };

        if (userProfile) {
          console.log("Profile loaded:", userProfile.id);
        }

        if (userRoleData) {
          console.log("Role loaded:", userRoleData.role);
          localStorage.setItem('userRole', userRoleData.role);
        }

        updateAuthState({
          profile: userProfile,
          userRole: userRoleData
        });
      } catch (error) {
        console.error("Error loading user data:", error);
        // Continue with available data
      }
    }
  };

  // Clear all auth state and storage
  const clearAuthState = async () => {
    updateAuthState({
      session: null,
      user: null,
      profile: null,
      userRole: null
    });
    
    // Reset cache
    dataCache.current = { lastFetch: 0 };
    
    // Clear all auth-related localStorage
    localStorage.removeItem('userRole');
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('supabase.auth.refreshToken');
    
    // Reset Supabase auth state by signing out
    if (authState.session) {
      await supabase.auth.signOut();
    }
  };

  // Initialize auth once
  useEffect(() => {
    let mounted = true;
    let initializeTimeout: NodeJS.Timeout;

    // Only initialize once
    if (hasInitialized.current) {
      console.log("Auth already initialized, skipping");
      return;
    }

    console.log("Starting auth initialization");
    hasInitialized.current = true;

    const initialize = async () => {
      if (isInitializing.current) {
        console.log("Initialization already in progress");
        return;
      }
      isInitializing.current = true;

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session fetch error:", error);
          if (error.message.includes('Invalid Refresh Token') || 
              error.message.includes('Token expired') ||
              error.status === 401) {
            await clearAuthState();
            navigate('/auth/login', { replace: true });
          }
          throw error;
        }

        if (mounted) {
          if (session?.user) {
            await handleAuthStateChange(session);
          } else {
            await clearAuthState();
            if (!location.pathname.startsWith('/auth/')) {
              navigate('/auth/login', { replace: true });
            }
          }
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        
        if (initializeAttempts.current < 2) {
          initializeAttempts.current++;
          const backoffDelay = Math.pow(2, initializeAttempts.current) * 1000;
          console.log(`Retrying initialization in ${backoffDelay}ms (${initializeAttempts.current}/2)`);
          initializeTimeout = setTimeout(initialize, backoffDelay);
          return;
        } else {
          await clearAuthState();
          navigate('/auth/login', { replace: true });
        }
      } finally {
        if (mounted) {
          // Only mark initialization as complete after all data is loaded
          const isFullyLoaded = authState.user ? (!!authState.profile && !!authState.userRole) : true;
          if (isFullyLoaded) {
            updateAuthState({
              loading: false,
              initialLoadDone: true
            });
          } else {
            updateAuthState({
              loading: false
            });
          }
          isInitializing.current = false;
        }
      }
    };

    // Set up auth subscription first with debounced handler
    let authStateTimeout: NodeJS.Timeout;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        // Clear any pending state change
        clearTimeout(authStateTimeout);
        
        console.log("Auth event:", event);
        
        // Debounce state changes to prevent rapid updates
        authStateTimeout = setTimeout(async () => {
          // Handle sign out event immediately
          if (event === 'SIGNED_OUT') {
            await clearAuthState();
            if (!location.pathname.startsWith('/auth/')) {
              navigate('/auth/login', { replace: true });
            }
            return;
          }
          
          await handleAuthStateChange(session, event);
          
          // After handling auth state change, check if we can mark initialization as complete
          const isFullyLoaded = authState.user ? (!!authState.profile && !!authState.userRole) : true;
          if (isFullyLoaded && !authState.initialLoadDone) {
            updateAuthState({
              initialLoadDone: true
            });
          }
        }, 100);
      }
    );

    // Then initialize
    initialize();

    return () => {
      console.log("Auth cleanup");
      mounted = false;
      clearTimeout(authStateTimeout);
      clearTimeout(initializeTimeout);
      subscription?.unsubscribe();
      
      // Reset initialization flags when component unmounts
      hasInitialized.current = false;
      isInitializing.current = false;
      initializeAttempts.current = 0;
      dataCache.current = { lastFetch: 0 };
    };
  }, []);

  // Authentication methods
  const signUp = async (email: string, password: string, redirectUrl?: string) => {
    try {
      updateAuthState({ loading: true });
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
      throw error;
    } finally {
      updateAuthState({ loading: false });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      updateAuthState({ loading: true });
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      toast.success("Login successful!");
      navigate('/');
    } catch (error: any) {
      toast.error(error.error_description || error.message);
      throw error;
    } finally {
      updateAuthState({ loading: false });
    }
  };

  const signOut = async () => {
    try {
      updateAuthState({ loading: true });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      await clearAuthState();
      toast.success("Signed out successfully");
      navigate('/auth/login', { replace: true });
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error(error.error_description || error.message);
      
      // Force clean state on error
      await clearAuthState();
      navigate('/auth/login', { replace: true });
    } finally {
      updateAuthState({ loading: false });
    }
  };

    // Detailed debug info for troubleshooting
    console.log("Auth state:", {
      hasUser: !!authState.user,
      hasSession: !!authState.session,
      hasProfile: !!authState.profile,
      hasRole: !!authState.userRole,
      isAdmin: authState.userRole?.role === 'admin',
      loading: authState.loading,
      initialLoadDone: authState.initialLoadDone,
      isInitializing: isInitializing.current,
      hasInitialized: hasInitialized.current
    });

  return {
    session: authState.session,
    user: authState.user,
    profile: authState.profile,
    userRole: authState.userRole,
    signUp,
    signIn,
    signOut,
    loading: authState.loading && !authState.initialLoadDone,
    initialLoadDone: authState.initialLoadDone,
    isAdmin: Boolean(authState.userRole?.role === 'admin'),
  };
}
