import { getAuthInstance } from "@/src/lib/auth";
import { db } from "@/src/lib/firestore";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
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

  async createUserProfile(uid: string, username: string) {
    await setDoc(doc(db, "users", uid), { username });
  }

  async getUserProfile(uid: string) {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? snap.data() : null;
  }
}
