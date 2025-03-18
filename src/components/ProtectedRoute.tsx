
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * A route component that protects content requiring authentication
 * Redirects unauthenticated users to the login page
 */
export default function ProtectedRoute() {
  const { user, loading, initialLoadDone } = useAuth();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);
  
  // Handle auth verification with safety timeout
  useEffect(() => {
    console.log("ProtectedRoute mounted with path:", location.pathname);
    
    // Set ready state immediately if auth is already loaded
    if (initialLoadDone) {
      console.log("Auth already loaded, proceeding immediately");
      setIsReady(true);
      return;
    }
    
    // Safety timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log("Auth verification timeout reached, proceeding anyway");
      setIsReady(true);
    }, 2000);
    
    return () => clearTimeout(timeoutId);
  }, [initialLoadDone, location.pathname]);
  
  // Update ready state when auth loading completes
  useEffect(() => {
    if (initialLoadDone && !isReady) {
      console.log("Auth loading complete, setting ready state");
      setIsReady(true);
    }
  }, [initialLoadDone, isReady]);

  // Debug info
  console.log("ProtectedRoute state:", { 
    hasUser: !!user, 
    loading, 
    initialLoadDone,
    isReady,
    path: location.pathname 
  });

  // Show loader only during initial verification
  if (!isReady && loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-sm text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // After verification, either allow access or redirect
  return user ? <Outlet /> : <Navigate to="/auth/login" state={{ from: location }} replace />;
}
