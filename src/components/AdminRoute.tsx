import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function AdminRoute() {
  const { isAdmin, loading, user } = useAuth();
  const location = useLocation();

  // Debug info
  console.log("AdminRoute check:", {
    isAdmin,
    loading,
    hasUser: !!user,
    path: location.pathname
  });

  // Show loader while checking auth/admin status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  // Check auth and admin status
  if (!user || !isAdmin) {
    console.log("Access denied:", { 
      authenticated: !!user, 
      isAdmin: !!isAdmin 
    });
    
    // If not logged in, redirect to login with return path
    if (!user) {
      return (
        <Navigate 
          to="/auth/login" 
          state={{ from: location.pathname }}
          replace 
        />
      );
    }
    
    // If logged in but not admin, redirect to home
    return <Navigate to="/" replace />;
  }

  // Allow access to admin routes
  console.log("Admin access granted");
  return <Outlet />;
}
