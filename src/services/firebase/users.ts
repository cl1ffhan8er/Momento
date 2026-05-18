import { COLLECTIONS } from "@/src/lib/constants/collections";
import { db } from "@/src/lib/firestore";
import { UserDoc } from "@/src/types";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

/**
 * Create a new user document
 */
export const createUserDocument = async (
  uid: string,
  email: string,
  username: string
): Promise<void> => {
  const userData: UserDoc = {
    uid,
    username,
    email,
    createdAt: Date.now(),
  };

  await setDoc(doc(db, COLLECTIONS.USERS, uid), userData);
};

/**
 * Get user by UID
 */
export const getUser = async (uid: string): Promise<UserDoc | null> => {
  const userRef = doc(db, COLLECTIONS.USERS, uid);
  const userSnapshot = await getDoc(userRef);
  return userSnapshot.exists() ? (userSnapshot.data() as UserDoc) : null;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  uid: string,
  updates: Partial<Pick<UserDoc, "username" | "avatarURL" | "bio">>
): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), updates);
};

/**
 * Check if username exists
 */
export const usernameExists = async (username: string): Promise<boolean> => {
  // TODO: Implement a search for usernames. For now, this is a stub.
  // In production, use a secondary index or a separate collection for usernames.
  return false;
};
