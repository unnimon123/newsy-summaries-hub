
// Configuration for environment variables in React Native
// For a production app, you would use a library like react-native-dotenv or react-native-config

export const ENV = {
  SUPABASE_URL: "https://zsnofjypqabqzbfmhvnx.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpzbm9manlwcWFicXpiZm1odm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5Mzg3NjUsImV4cCI6MjA1NzUxNDc2NX0.bxuCEEEbzdy7WuyA6g73MIbhANsjhl6aGEJ4Dx5iAOA",
};

// For a React Native app, you might want to use AsyncStorage to store auth state
// Example usage:
// import AsyncStorage from '@react-native-async-storage/async-storage';
// 
// export const setAuthSession = async (session) => {
//   await AsyncStorage.setItem('supabase-session', JSON.stringify(session));
// };
//
// export const getAuthSession = async () => {
//   const sessionStr = await AsyncStorage.getItem('supabase-session');
//   return sessionStr ? JSON.parse(sessionStr) : null;
// };
