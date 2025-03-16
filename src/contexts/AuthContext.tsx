
import { createContext, useContext } from "react";
import { Loader2 } from "lucide-react";
import { useAuthProvider } from "@/hooks/useAuthProvider";
import { AuthContextType } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthProvider();

  // Only render children after initial auth check
  if (!auth.initialLoadDone) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
