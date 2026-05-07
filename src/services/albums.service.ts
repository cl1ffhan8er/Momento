import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../lib/firestore";

export const createAlbum = async (title: string, userId: string) => {
  return await addDoc(collection(db, "albums"), {
    title,
    ownerId: userId,
    createdAt: serverTimestamp(),
  });
};

export const getSharedAlbums = async (userId: string) => {
  const q = query(
    collection(db, "albumMembers"),
    where("userId", "==", userId),
  );

  const snapshot = await getDocs(q);

  const albumIds = snapshot.docs.map((doc) => doc.data().albumId);

  const albums: any[] = [];

  for (let id of albumIds) {
    const albumSnap = await getDocs(
      query(collection(db, "albums"), where("__name__", "==", id)),
    );

    albumSnap.forEach((doc) => {
      albums.push({ id: doc.id, ...doc.data() });
    });
  }

  return albums;
};

// find user by email
export const getUserByEmail = async (email: string) => {
  const q = query(collection(db, "users"), where("email", "==", email));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  return snapshot.docs[0].data();
};

// invite user
export const inviteToAlbum = async (
  albumId: string,
  email: string,
  role: string,
) => {
  const user = await getUserByEmail(email);

  if (!user) throw new Error("User not found");

  return await addDoc(collection(db, "albumMembers"), {
    albumId,
    userId: user.uid,
    role,
  });
};
