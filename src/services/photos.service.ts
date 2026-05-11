import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { db } from "../lib/firestore";
import { storage } from "../lib/storage";

const MAX_PHOTOS_PER_ALBUM = 50;
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

export interface Photo {
  id: string;
  url: string;
  fileName: string;
  title?: string | null;
  caption?: string | null;
  uploadedBy: string;
  uploadedAt: any;
  size: number;
}

export interface UploadPhotoInput {
  file: Blob;
  fileName: string;
  title?: string;
  caption?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const photosCol = (groupId: string, albumId: string) =>
  collection(db, "groups", groupId, "albums", albumId, "photos");

const photoDoc = (groupId: string, albumId: string, photoId: string) =>
  doc(db, "groups", groupId, "albums", albumId, "photos", photoId);

const storageRef = (
  groupId: string,
  albumId: string,
  photoId: string,
  fileName: string,
) => ref(storage, `groups/${groupId}/albums/${albumId}/${photoId}/${fileName}`);

const validateFile = (file: Blob, fileName: string) => {
  if (file.size > MAX_FILE_SIZE_BYTES)
    throw new Error(`"${fileName}" exceeds the 2 MB size limit.`);
};

// ─── Upload ──────────────────────────────────────────────────────────────────

export const uploadPhoto = async (
  groupId: string,
  albumId: string,
  userId: string,
  { file, fileName, title, caption }: UploadPhotoInput,
): Promise<string> => {
  validateFile(file, fileName);

  const existing = await getDocs(photosCol(groupId, albumId));
  if (existing.size >= MAX_PHOTOS_PER_ALBUM)
    throw new Error("This album has reached the 50-photo limit.");

  const photoRef = doc(photosCol(groupId, albumId));
  const fileRef = storageRef(groupId, albumId, photoRef.id, fileName);

  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);

  await writeBatch(db)
    .set(photoRef, {
      url,
      fileName,
      title: title ?? null,
      caption: caption ?? null,
      uploadedBy: userId,
      uploadedAt: serverTimestamp(),
      size: file.size,
    })
    .commit();

  return photoRef.id;
};

export const uploadPhotoBatch = async (
  groupId: string,
  albumId: string,
  userId: string,
  photos: UploadPhotoInput[],
): Promise<string[]> => {
  const existing = await getDocs(photosCol(groupId, albumId));
  const spotsLeft = MAX_PHOTOS_PER_ALBUM - existing.size;

  if (spotsLeft <= 0)
    throw new Error("This album has reached the 50-photo limit.");
  if (photos.length > spotsLeft)
    throw new Error(
      `Only ${spotsLeft} spot(s) left in this album. You tried to upload ${photos.length}.`,
    );

  photos.forEach(({ file, fileName }) => validateFile(file, fileName));

  const ids = await Promise.all(
    photos.map((photo) => uploadPhoto(groupId, albumId, userId, photo)),
  );

  return ids;
};

// ─── Read ────────────────────────────────────────────────────────────────────

export const getAlbumPhotos = async (
  groupId: string,
  albumId: string,
): Promise<Photo[]> => {
  const q = query(
    photosCol(groupId, albumId),
    orderBy("uploadedAt", "desc"),
    limit(MAX_PHOTOS_PER_ALBUM),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Photo);
};

export const getPhoto = async (
  groupId: string,
  albumId: string,
  photoId: string,
): Promise<Photo | null> => {
  const snap = await getDoc(photoDoc(groupId, albumId, photoId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Photo;
};

export const getPhotoDownloadUrl = async (
  groupId: string,
  albumId: string,
  photoId: string,
): Promise<string> => {
  const photo = await getPhoto(groupId, albumId, photoId);
  if (!photo) throw new Error("Photo not found.");
  return photo.url;
};

// ─── Edit ────────────────────────────────────────────────────────────────────

export const updatePhotoMetadata = async (
  groupId: string,
  albumId: string,
  photoId: string,
  userId: string,
  updates: { title?: string | null; caption?: string | null },
): Promise<void> => {
  const photo = await getPhoto(groupId, albumId, photoId);
  if (!photo) throw new Error("Photo not found.");
  if (photo.uploadedBy !== userId)
    throw new Error("You can only edit photos you uploaded.");

  await updateDoc(photoDoc(groupId, albumId, photoId), {
    ...updates,
  });
};

// ─── Delete ──────────────────────────────────────────────────────────────────

export const deletePhoto = async (
  groupId: string,
  albumId: string,
  photoId: string,
  userId: string,
): Promise<void> => {
  const photo = await getPhoto(groupId, albumId, photoId);
  if (!photo) throw new Error("Photo not found.");
  if (photo.uploadedBy !== userId)
    throw new Error("You can only delete photos you uploaded.");

  const fileRef = storageRef(groupId, albumId, photoId, photo.fileName);
  await deleteObject(fileRef);
  await deleteDoc(photoDoc(groupId, albumId, photoId));
};

export const deletePhotoBatch = async (
  groupId: string,
  albumId: string,
  photoIds: string[],
  userId: string,
): Promise<void> => {
  const photos = await Promise.all(
    photoIds.map((id) => getPhoto(groupId, albumId, id)),
  );

  const unauthorized = photos.find((p) => p && p.uploadedBy !== userId);
  if (unauthorized) throw new Error("You can only delete photos you uploaded.");

  await Promise.all(
    photos
      .filter((p): p is Photo => p !== null)
      .map(async (photo) => {
        const fileRef = storageRef(groupId, albumId, photo.id, photo.fileName);
        await deleteObject(fileRef);
        await deleteDoc(photoDoc(groupId, albumId, photo.id));
      }),
  );
};
