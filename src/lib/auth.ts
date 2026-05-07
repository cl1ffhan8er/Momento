import { initializeAuth, inMemoryPersistence } from "firebase/auth";
import { app } from "./config";

let _auth: any;

export const getAuthInstance = () => {
  if (!_auth) {
    _auth = initializeAuth(app, {
      persistence: inMemoryPersistence,
    });
  }
  return _auth;
};

export const auth = getAuthInstance();
