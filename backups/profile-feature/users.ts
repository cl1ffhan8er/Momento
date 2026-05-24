import { COLLECTIONS } from "@/src/lib/constants/collections";
import { db } from "@/src/lib/firestore";
import { uploadFile } from "@/src/services/firebase/storage";
import { UserDoc } from "@/src/types";
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";

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

export const getUserByUsername = async (username: string): Promise<UserDoc | null> => {
  const usersCollection = collection(db, COLLECTIONS.USERS);
  const q = query(usersCollection, where("username", "==", username));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  return querySnapshot.docs[0].data() as UserDoc;
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
 * Check if username exists (excluding a specific user)
 */
export const usernameExists = async (
  username: string,
  excludeUid?: string
): Promise<boolean> => {
  const usersCollection = collection(db, COLLECTIONS.USERS);
  const q = query(usersCollection, where("username", "==", username));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) return false;

  if (excludeUid) {
    return querySnapshot.docs.some((doc) => doc.id !== excludeUid);
  }

  return true;
};

/**
 * Upload user avatar to Firebase Storage
 */
export const uploadAvatar = async (
  uri: string,
  uid: string
): Promise<string> => {
  return uploadFile(uri, `avatars/${uid}`);
};
