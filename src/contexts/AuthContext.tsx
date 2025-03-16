
import { createContext, useContext } from "react";
import { Loader2 } from "lucide-react";
import { useAuthProvider } from "@/hooks/useAuthProvider";
import { AuthContextType } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthProvider();

  // Debug renderer to validate auth state
  console.log("AuthProvider rendering with state:", { 
    hasUser: !!auth.user, 
    isInitialLoadDone: auth.initialLoadDone,
    isLoading: auth.loading 
  });

  // Only render children after initial auth check
  if (!auth.initialLoadDone && auth.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-2" />
          <p className="text-sm text-muted-foreground">Initializing application...</p>
        </div>
      </div>
    );
  }

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
        initialLoadDone: auth.initialLoadDone,
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
