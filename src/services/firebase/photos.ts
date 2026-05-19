import { COLLECTIONS } from "@/src/lib/constants/collections";
import { db } from "@/src/lib/firestore";
import { storage } from "@/src/lib/storage";
import { PhotoDoc } from "@/src/types";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

/**
 * Upload a photo file to Firebase Storage and return the download URL.
 */
export const uploadPhotoFile = async (
  uri: string,
  albumId: string
): Promise<string> => {
  const filename = uri.split("/").pop() ?? `${Date.now()}.jpg`;
  const storageRef = ref(storage, `${COLLECTIONS.PHOTOS}/${albumId}/${Date.now()}_${filename}`);

  const response = await fetch(uri);
  const blob = await response.blob();
  await uploadBytes(storageRef, blob);

  return getDownloadURL(storageRef);
};

/**
 * Create a new photo record
 */
export const createPhoto = async (
  albumId: string,
  groupId: string,
  uploadedBy: string,
  storageUrl: string,
  title?: string,
  caption?: string
): Promise<string> => {
  const photoId = doc(collection(db, COLLECTIONS.PHOTOS)).id;

    const photoData: any = {
      photoId,
      albumId,
      groupId,
      uploadedBy,
      storageUrl: storageUrl ?? null,
      caption: caption ?? null,
      uploadedAt: Date.now(),
    };

    // Only include optional fields when provided to avoid passing `undefined` to Firestore
    if (typeof title === "string" && title.length > 0) {
      photoData.title = title;
    }

    await setDoc(doc(db, COLLECTIONS.PHOTOS, photoId), photoData);
  return photoId;
};

/**
 * Get photo by ID
 */
export const getPhoto = async (photoId: string): Promise<PhotoDoc | null> => {
  const photoRef = doc(db, COLLECTIONS.PHOTOS, photoId);
  const photoSnapshot = await getDoc(photoRef);
  return photoSnapshot.exists() ? (photoSnapshot.data() as PhotoDoc) : null;
};

/**
 * Get all photos in an album
 */
export const getAlbumPhotos = async (albumId: string): Promise<PhotoDoc[]> => {
  const q = query(
    collection(db, COLLECTIONS.PHOTOS),
    where("albumId", "==", albumId),
    orderBy("uploadedAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data() as PhotoDoc);
};

/**
 * Get all photos in a group
 */
export const getGroupPhotos = async (groupId: string): Promise<PhotoDoc[]> => {
  const q = query(
    collection(db, COLLECTIONS.PHOTOS),
    where("groupId", "==", groupId),
    orderBy("uploadedAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data() as PhotoDoc);
};

/**
 * Update photo metadata (only title and caption)
 */
export const updatePhoto = async (
  photoId: string,
  updates: Partial<Pick<PhotoDoc, "title" | "caption">>
): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.PHOTOS, photoId), updates);
};

/**
 * Delete a photo (only by uploader)
 */
export const deletePhoto = async (photoId: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTIONS.PHOTOS, photoId));
};

/**
 * Check if user is the uploader of a photo
 */
export const isPhotoUploader = async (
  photoId: string,
  userId: string
): Promise<boolean> => {
  const photo = await getPhoto(photoId);
  return photo?.uploadedBy === userId;
};

/**
 * Batch delete photos by IDs
 */
export const batchDeletePhotos = async (photoIds: string[]): Promise<void> => {
  for (const photoId of photoIds) {
    await deletePhoto(photoId);
  }
};
