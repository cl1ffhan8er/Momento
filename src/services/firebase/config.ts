import { getApp, getApps, initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
  appId: process.env.EXPO_PUBLIC_APP_ID,
};

// IMPORTANT: prevent duplicate init (Expo Router safe)
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

console.log("🔥 Firebase INIT");