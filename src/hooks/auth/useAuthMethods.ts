
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getRedirectUrl } from "@/utils/environmentUtils";

/**
 * Hook for authentication methods (sign up, sign in, sign out)
 */
export function useAuthMethods() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      console.log("Attempting to sign out user...");

      // Remove FCM token when signing out
      try {
        const { data: user } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('profiles')
            .update({
              notification_preferences: supabase.rpc('jsonb_deep_set', {
                json: supabase.rpc('jsonb_get_or_create', {
                  json: supabase.rpc('get_profile_notification_preferences', {
                    profile_id: user.user?.id
                  })
                }),
                path: ['fcm_token'],
                value: null
              })
            })
            .eq('id', user.user?.id);
        }
      } catch (e) {
        console.error("Failed to clear FCM token:", e);
      }

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Sign out error:", error);
        throw error;
      }

      console.log("Sign out successful, redirecting to login page");
      toast.success("Signed out successfully");
      
      // Clear any session data from local storage
      localStorage.removeItem('supabase.auth.token');
      
      // Force redirect after signout - with a slight delay to ensure Supabase auth state updates
      setTimeout(() => {
        navigate('/auth/login', { replace: true });
      }, 100);
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error(error.error_description || error.message);

      // Even if there's an error, attempt to redirect
      navigate('/auth/login', { replace: true });
    } finally {
      setLoading(false);
    }
  }

  return {
    signUp,
    signIn,
    signOut,
    loading
  };
}
