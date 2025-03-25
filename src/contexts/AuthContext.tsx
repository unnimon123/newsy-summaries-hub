import { createContext, useContext, memo } from "react";
import { Loader2 } from "lucide-react";
import { useAuthProvider } from "@/hooks/useAuthProvider";
import { AuthContextType } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Loading spinner component
const LoadingSpinner = memo(() => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <div className="flex flex-col items-center gap-1">
        <p className="text-sm font-medium">Initializing application...</p>
        <p className="text-xs text-muted-foreground">Please wait while we set things up</p>
      </div>
    </div>
  </div>
));
LoadingSpinner.displayName = 'LoadingSpinner';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthProvider();

  // Debug renderer with clearer state info
  console.log("AuthProvider state:", { 
    isAuthenticated: !!auth.session && !!auth.user,
    hasProfile: !!auth.profile,
    hasRole: !!auth.userRole,
    isInitializing: auth.loading && !auth.initialLoadDone,
    isAdmin: auth.isAdmin
  });

  // Only show loading during initial authentication and not during subsequent operations
  if (!auth.initialLoadDone) {
    return <LoadingSpinner />;
  }

  // Provide stable auth context
  return (
    <AuthContext.Provider
      value={{
        session: auth.session,
        user: auth.user,
        profile: auth.profile,
        userRole: auth.userRole,
        signUp: auth.signUp,
        signIn: auth.signIn,
        signOut: auth.signOut,
        loading: auth.loading,
        isAdmin: auth.isAdmin,
        initialLoadDone: auth.initialLoadDone
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
