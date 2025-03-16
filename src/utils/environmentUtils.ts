
/**
 * Utility functions for environment detection and configuration
 */

/**
 * Check if we're in a mobile environment
 */
export const isMobileApp = (): boolean => {
  // This is a basic check - in a real app, you might use something like react-native-device-info
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  return /android|iphone|ipad|ipod/i.test(userAgent.toLowerCase());
};

/**
 * Get app-specific redirect URL
 */
export const getRedirectUrl = (providedUrl?: string): string => {
  if (providedUrl) return providedUrl;
  
  if (isMobileApp()) {
    // For mobile deep linking, use a custom URL scheme
    // Replace with your actual app scheme
    return 'newsy-app://auth/callback';
  }
  
  // Web fallback
  return window.location.origin + '/auth/callback';
};
