
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2, ShieldAlert } from "lucide-react";

/**
 * A route component that only allows admin users to access it
 * Redirects to login if not authenticated, or home if authenticated but not admin
 */
export default function AdminRoute() {
  const { isAdmin, loading, initialLoadDone, user } = useAuth();
  const location = useLocation();

  // Debug info
  console.log("AdminRoute check:", {
    isAdmin,
    loading,
    initialLoadDone,
    hasUser: !!user,
    path: location.pathname
  });

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

  // If logged in but not admin, redirect to home page
  if (!isAdmin) {
    console.log("User is not an admin, redirecting to home");
    return <Navigate to="/" replace />;
  }

  // User is admin, render admin content
  console.log("User is admin, rendering admin content");
  return <Outlet />;
}
