
import { supabase } from "@/integrations/supabase/client";
import { Profile, UserRole } from "@/types/auth";

/**
 * Fetch user profile from Supabase
 */
export async function fetchUserProfile(userId: string): Promise<Profile | null> {
  try {
    console.log(`Fetching profile for user: ${userId}`);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.warn('No profile found for user:', userId);
        return null;
      }
      console.error('Error fetching user profile:', error);
      return null;
    }

    console.log('Profile fetched successfully:', data?.id);

    // Transform the notification_preferences from Json to our expected type
    const transformedProfile: Profile = {
      id: data.id,
      username: data.username,
      avatar_url: data.avatar_url,
      notification_preferences: data.notification_preferences ? {
        push: typeof data.notification_preferences === 'object' && 
              data.notification_preferences !== null && 
              'push' in data.notification_preferences 
              ? Boolean(data.notification_preferences.push) 
              : true,
        email: typeof data.notification_preferences === 'object' && 
               data.notification_preferences !== null && 
               'email' in data.notification_preferences 
               ? Boolean(data.notification_preferences.email) 
               : false
      } : null
    };

    return transformedProfile;
  } catch (error) {
    console.error('Unexpected error fetching profile:', error);
    return null;
  }
}

/**
 * Fetch user role from Supabase
 */
export async function fetchUserRole(userId: string): Promise<UserRole | null> {
  try {
    console.log(`Fetching role for user: ${userId}`);
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.warn('No role found for user:', userId);
        return { role: 'user' }; // Default to regular user if no role found
      }
      console.error('Error fetching user role:', error);
      return null;
    }

    console.log('Role fetched successfully:', data?.role);
    console.log('Full role data:', data);
    return data as UserRole;
  } catch (error) {
    console.error('Unexpected error fetching role:', error);
    return null;
  }
}
