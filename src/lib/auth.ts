import { initializeAuth, inMemoryPersistence } from "firebase/auth";
import { app } from "./config";

export const auth = initializeAuth(app, {
  persistence: inMemoryPersistence,
});

export const getAuthInstance = () => auth;
