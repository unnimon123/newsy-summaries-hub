
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Add additional debugging
  console.log("ProtectedRoute state:", { user, loading, path: location.pathname });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/auth/login" replace />;
}
