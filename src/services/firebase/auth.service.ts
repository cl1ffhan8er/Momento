import { getAuthInstance } from "@/src/lib/auth";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";

export class AuthService {
  signup(email: string, password: string) {
    return createUserWithEmailAndPassword(getAuthInstance(), email, password);
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(getAuthInstance(), email, password);
  }

  listenToAuthChanges(callback: any) {
    return onAuthStateChanged(getAuthInstance(), callback);
  }
}
