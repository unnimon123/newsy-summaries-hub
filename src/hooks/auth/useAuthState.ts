
import { useState, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Profile, UserRole } from "@/types/auth";
import { fetchUserProfile, fetchUserRole } from "@/services/profileService";

/**
 * Hook for managing auth state
 */
export function useAuthState() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Initialize auth and subscribe to changes
  useEffect(() => {
    console.log("Auth state initialization starting");
    let mounted = true;

    // Safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      if (mounted && !initialLoadDone) {
        console.log("Safety timeout triggered: forcing initialLoadDone to true");
        setLoading(false);
        setInitialLoadDone(true);
      }
    }, 3000);

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
      console.log("Auth state cleanup");
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    user,
    profile,
    userRole,
    loading,
    initialLoadDone,
    isAdmin: userRole?.role === 'admin',
    setProfile, // Export setter for when profile is updated
    setUserRole, // Export setter for when role is updated
    setSession, // Export setter for manual session updates
    setUser, // Export setter for manual user updates
    setLoading, // Export setter for manual loading state changes
  };
}
