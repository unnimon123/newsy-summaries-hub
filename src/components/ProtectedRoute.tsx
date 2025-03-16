
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function ProtectedRoute() {
  const { user, loading, initialLoadDone } = useAuth();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  
  // Additional timer to prevent infinite loading
  useEffect(() => {
    console.log("ProtectedRoute mounted with path:", location.pathname);
    
    // Set a maximum verification time to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log("Auth verification timeout reached, forcing completion");
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
  console.log("ProtectedRoute state:", { 
    user: !!user, 
    loading, 
    initialLoadDone,
    isVerifying,
    path: location.pathname 
  });

  // Show loader while verifying and during initial load
  if ((loading || isVerifying) && !initialLoadDone) {
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
