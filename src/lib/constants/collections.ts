// Firestore collection names (no magic strings)

export const COLLECTIONS = {
  USERS: "users",
  GROUPS: "groups",
  ALBUMS: "albums",
  PHOTOS: "photos",
} as const;

export const SUBCOLLECTIONS = {
  MEMBERS: "members",
} as const;
