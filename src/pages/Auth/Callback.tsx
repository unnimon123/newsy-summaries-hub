
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
          navigate("/auth/login");
          return;
        }

        if (data.session) {
          // We have a session, redirect to the app
          console.log("Session found, redirecting");
          toast.success("Authentication successful");
          
          if (isMobileDeepLink) {
            // This would be handled by the mobile app's deep link handler
            console.log("Mobile auth successful via deep link");
            // Mobile apps typically handle this redirection internally
            // This code executes in the web context of the auth callback
          } else {
            // Regular web flow
            navigate("/");
          }
        } else {
          // No session found, redirect to login
          console.log("No session found, redirecting to login");
          navigate("/auth/login");
        }
      } catch (error) {
        console.error("Unexpected error during auth callback:", error);
        toast.error("Authentication failed");
        navigate("/auth/login");
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
