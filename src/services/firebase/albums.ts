import { COLLECTIONS } from "@/src/lib/constants/collections";
import { db } from "@/src/lib/firestore";
import { AlbumDoc } from "@/src/types";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    updateDoc,
    where,
    writeBatch
} from "firebase/firestore";

/**
 * Create a new album
 */
export const createAlbum = async (
  groupId: string,
  title: string,
  createdBy: string,
  coverPhotoUrl?: string
): Promise<string> => {
  const albumId = doc(collection(db, COLLECTIONS.ALBUMS)).id;

  const albumData: AlbumDoc = {
    albumId,
    groupID: groupId,
    title,
    coverPhotoUrl: coverPhotoUrl || null,
    createdBy,
    createdAt: Date.now(),
    photoCount: 0,
  };

  await setDoc(doc(db, COLLECTIONS.ALBUMS, albumId), albumData);
  return albumId;
};

/**
 * Get album by ID
 */
export const getAlbum = async (albumId: string): Promise<AlbumDoc | null> => {
  const albumRef = doc(db, COLLECTIONS.ALBUMS, albumId);
  const albumSnapshot = await getDoc(albumRef);
  return albumSnapshot.exists() ? (albumSnapshot.data() as AlbumDoc) : null;
};

/**
 * Get all albums in a group
 */
export const getGroupAlbums = async (groupId: string): Promise<AlbumDoc[]> => {
  const q = query(
    collection(db, COLLECTIONS.ALBUMS),
    where("groupID", "==", groupId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data() as AlbumDoc);
};

/**
 * Update album metadata
 */
export const updateAlbum = async (
  albumId: string,
  updates: Partial<Pick<AlbumDoc, "title" | "coverPhotoUrl">>
): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.ALBUMS, albumId), updates);
};

/**
 * Delete album and all associated photos
 */
export const deleteAlbum = async (albumId: string): Promise<void> => {
  const batch = writeBatch(db);

  // Delete album document
  batch.delete(doc(db, COLLECTIONS.ALBUMS, albumId));

  // Delete all photos in the album
  const photosCollection = collection(db, COLLECTIONS.PHOTOS);
  const q = query(photosCollection, where("albumId", "==", albumId));
  const photosSnapshot = await getDocs(q);

  photosSnapshot.docs.forEach((photoDoc) => {
    batch.delete(photoDoc.ref);
  });

  await batch.commit();
};

/**
 * Increment photo count in album
 */
export const incrementPhotoCount = async (albumId: string): Promise<void> => {
  const albumRef = doc(db, COLLECTIONS.ALBUMS, albumId);
  const albumSnapshot = await getDoc(albumRef);

  if (albumSnapshot.exists()) {
    const albumData = albumSnapshot.data() as AlbumDoc;
    await updateDoc(albumRef, {
      photoCount: albumData.photoCount + 1,
    });
  }
};

/**
 * Decrement photo count in album
 */
export const decrementPhotoCount = async (albumId: string): Promise<void> => {
  const albumRef = doc(db, COLLECTIONS.ALBUMS, albumId);
  const albumSnapshot = await getDoc(albumRef);

  if (albumSnapshot.exists()) {
    const albumData = albumSnapshot.data() as AlbumDoc;
    await updateDoc(albumRef, {
      photoCount: Math.max(0, albumData.photoCount - 1),
    });
  }
};
