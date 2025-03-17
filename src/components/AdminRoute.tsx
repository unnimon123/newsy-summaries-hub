
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminRoute() {
  const { isAdmin, loading, initialLoadDone, user } = useAuth();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  
  // Additional timer to prevent infinite loading
  useEffect(() => {
    console.log("AdminRoute mounted with path:", location.pathname);
    
    // Set a maximum verification time to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log("Admin verification timeout reached, forcing completion");
      setIsVerifying(false);
    }, 1000); // Reduced timeout for faster fallback
    
    // If auth is already loaded, we don't need to wait
    if (initialLoadDone) {
      console.log("Auth already loaded, proceeding immediately");
      setIsVerifying(false);
      clearTimeout(timeoutId);
    }
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [initialLoadDone, location.pathname]);
  
  useEffect(() => {
    if (initialLoadDone) {
      console.log("Auth loading complete, setting verification to false");
      setIsVerifying(false);
    }
  }, [initialLoadDone]);
  
  // Debug info
  console.log("AdminRoute check:", { 
    isAdmin, 
    loading, 
    initialLoadDone,
    isVerifying,
    hasUser: !!user, 
    path: location.pathname 
  });

  // Show loader only during initial verification
  if ((isVerifying && !initialLoadDone) || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-sm text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // First check if user is logged in at all
  if (!user) {
    console.log("User not logged in, redirecting to login");
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Then check if they're an admin
  if (!isAdmin) {
    console.log("User is not an admin, redirecting to home");
    return <Navigate to="/" replace />;
  }

  console.log("User is admin, rendering admin content");
  return <Outlet />;
}
