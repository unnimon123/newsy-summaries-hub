
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
    }, 3000);
    
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
    if (!loading && initialLoadDone) {
      console.log("Auth loading complete, setting verification to false");
      setIsVerifying(false);
    }
  }, [loading, initialLoadDone]);
  
  // Debug info
  console.log("AdminRoute check:", { 
    isAdmin, 
    loading, 
    initialLoadDone,
    isVerifying,
    hasUser: !!user, 
    path: location.pathname 
  });

  // Show loader while verifying and during initial load
  if ((loading || isVerifying) && !initialLoadDone) {
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
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Then check if they're an admin
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
}
