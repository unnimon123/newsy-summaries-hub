
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function AdminRoute() {
  const { isAdmin, loading, user } = useAuth();
  const location = useLocation();

  // Add more detailed logging for debugging
  console.log("AdminRoute check:", { isAdmin, loading, hasUser: !!user, path: location.pathname });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // First check if user is logged in at all
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // Then check if they're an admin
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
}
