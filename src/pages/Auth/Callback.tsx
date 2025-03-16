
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("Auth callback handling initiated");
        
        // Check if we're in a mobile deep link scenario
        const isMobileDeepLink = window.location.href.includes("newsy-app://");
        console.log("Is mobile deep link:", isMobileDeepLink);
        
        // Check if we have a session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error during auth callback:", error);
          toast.error("Authentication failed");
          navigate("/auth/login", { replace: true });
          return;
        }

        if (data.session) {
          // We have a session, redirect to the app
          console.log("Session found, redirecting");
          toast.success("Authentication successful");
          
          if (isMobileDeepLink) {
            console.log("Mobile auth successful via deep link");
          } else {
            // Regular web flow with replace to prevent back button issues
            navigate("/", { replace: true });
          }
        } else {
          // No session found, redirect to login
          console.log("No session found, redirecting to login");
          navigate("/auth/login", { replace: true });
        }
      } catch (error) {
        console.error("Unexpected error during auth callback:", error);
        toast.error("Authentication failed");
        navigate("/auth/login", { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <h1 className="mt-4 text-xl font-semibold">Completing authentication...</h1>
      <p className="text-muted-foreground mt-2">Please wait while we log you in.</p>
    </div>
  );
}
