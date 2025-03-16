
import { Session, User } from "@supabase/supabase-js";

/**
 * User profile type
 */
export type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  notification_preferences: {
    push: boolean;
    email: boolean;
  } | null;
};

/**
 * User role type
 */
export type UserRole = {
  role: 'admin' | 'user';
};

/**
 * Authentication context type
 */
export type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  userRole: UserRole | null;
  signUp: (email: string, password: string, redirectUrl?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
};
