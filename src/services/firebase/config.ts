import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  appId: "YOUR_APP_ID",
};

export const app = initializeApp(firebaseConfig);