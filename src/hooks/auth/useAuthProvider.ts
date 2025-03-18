
import { useAuthState } from "./useAuthState";
import { useAuthMethods } from "./useAuthMethods";
import { useAuthCallback } from "./useAuthCallback";

/**
 * Main hook for providing auth functionality and state
 */
export function useAuthProvider() {
  // Auth state (session, user, profile, etc.)
  const authState = useAuthState();
  
  // Auth methods (signUp, signIn, signOut)
  const authMethods = useAuthMethods();
  
  // Handle authentication callbacks
  useAuthCallback();

  // Debug info
  console.log("Auth provider state:", {
    hasUser: !!authState.user,
    hasSession: !!authState.session,
    isAdmin: authState.isAdmin,
    loading: authState.loading || authMethods.loading,
    initialLoadDone: authState.initialLoadDone
  });

  return {
    // User data
    session: authState.session,
    user: authState.user,
    profile: authState.profile,
    userRole: authState.userRole,
    
    // Auth methods
    signUp: authMethods.signUp,
    signIn: authMethods.signIn,
    signOut: authMethods.signOut,
    
    // Status flags
    loading: authState.loading || authMethods.loading,
    initialLoadDone: authState.initialLoadDone,
    isAdmin: authState.isAdmin,
  };
}
