{
  "name": "edushorts",
  "version": "1.0.0",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "clean:windows": "cleanup.bat",
    "clean:unix": "./cleanup.sh",
    "clean": "npm run clean:windows || npm run clean:unix",
    "reset": "npm run clean && npm install",
    "build": "expo build:android",
    "rebuild": "npm run reset && npm run build",
    "start:fresh": "npm run reset && npm start -- --clear"
  },
  "dependencies": {
    "@expo/vector-icons": "^14.0.4",
    "@react-native-async-storage/async-storage": "^2.1.2",
    "@react-navigation/bottom-tabs": "^6.5.11",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/native-stack": "^6.9.17",
    "@react-navigation/stack": "^6.4.1",
    "@supabase/supabase-js": "^2.39.3",
    "date-fns": "^4.1.0",
    "expo": "~52.0.0",
    "expo-status-bar": "~2.0.1",
    "react": "^18.3.1",
    "react-native": "^0.76.7",
    "react-native-gesture-handler": "~2.20.2",
    "react-native-reanimated": "^3.6.1",
    "react-native-safe-area-context": "^4.12.0",
    "react-native-screens": "~4.4.0",
    "sonner-native": "^0.17.0"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@babel/plugin-transform-class-properties": "^7.23.3",
    "@babel/plugin-transform-private-methods": "^7.23.3",
    "@babel/plugin-transform-runtime": "^7.23.3",
    "@babel/preset-env": "^7.20.0",
    "@babel/runtime": "^7.20.0",
    "@types/react": "~18.3.12",
    "@typescript-eslint/eslint-plugin": "^6.21.0",
    "@typescript-eslint/parser": "^6.21.0",
    "babel-plugin-transform-remove-console": "^6.9.4",
    "babel-preset-expo": "~12.0.0",
    "metro-react-native-babel-preset": "^0.77.0",
    "typescript": "^5.1.3"
  },
  "private": true,
  "resolutions": {
    "@babel/core": "^7.20.0",
    "babel-preset-expo": "^10.0.0"
  }
}

