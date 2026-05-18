// Firestore document types

export interface UserDoc {
  uid: string;
  username: string;
  email: string;
  avatarURL?: string;
  bio?: string;
  createdAt: number; // timestamp
}

export interface GroupMember {
  userId: string;
  role: "owner" | "member";
  joinedAt: number; // timestamp
  nickname?: string;
}

export interface GroupDoc {
  groupId: string;
  name: string;
  coverPhotoURL?: string | null;
  joinCode: string;
  ownerID: string;
  createdAt: number; // timestamp
  memberCount: number;
}

export interface AlbumDoc {
  albumId: string;
  groupID: string;
  title: string;
  coverPhotoUrl?: string | null; 
  createdBy: string;
  createdAt: number; // timestamp
  photoCount: number;
}

export interface PhotoDoc {
  photoId: string;
  albumId: string;
  groupId: string;
  uploadedBy: string;
  storageUrl: string | null;
  title?: string;
  caption?: string;
  uploadedAt: number; // timestamp
}
