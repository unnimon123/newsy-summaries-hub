
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Hook for handling authentication callbacks
 */
export function useAuthCallback() {
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
}
