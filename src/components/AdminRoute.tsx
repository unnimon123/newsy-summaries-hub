
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * A route component that only allows admin users to access it
 * Redirects to login if not authenticated, or home if authenticated but not admin
 */
export default function AdminRoute() {
  const { isAdmin, loading, initialLoadDone, user, userRole } = useAuth();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);

  // Debug info
  console.log("AdminRoute check:", {
    isAdmin,
    loading,
    initialLoadDone,
    hasUser: !!user,
    userRole: userRole?.role,
    path: location.pathname
  });

  // Handle auth verification with safety timeout
  useEffect(() => {
    console.log("AdminRoute mounted with path:", location.pathname);
    
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

  // Show loader only during initial auth loading
  if (loading && !initialLoadDone) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-sm text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // If not logged in, redirect to login page
  if (!user) {
    console.log("User not logged in, redirecting to login");
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // If logged in but not admin, show unauthorized page
  if (isReady && !isAdmin) {
    console.log("User is not an admin, redirecting to unauthorized page");
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <ShieldAlert className="w-12 h-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground text-center mb-6">
          You don't have permission to access this area.
          {userRole ? ` Your role is: ${userRole.role}` : ' No role assigned.'}
        </p>
        <a href="/" className="text-primary hover:underline">
          Return to Dashboard
        </a>
      </div>
    );
  }

  // User is admin, render admin content
  console.log("User is admin, rendering admin content");
  return <Outlet />;
}
