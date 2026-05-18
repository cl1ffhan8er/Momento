import { COLLECTIONS, SUBCOLLECTIONS } from "@/src/lib/constants/collections";
import { db } from "@/src/lib/firestore";
import { GroupDoc, GroupMember } from "@/src/types";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    updateDoc,
    where,
    writeBatch
} from "firebase/firestore";

const generateJoinCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

/**
 * Create a new group
 */
export const createGroup = async (
  userId: string,
  name: string,
  coverPhotoURL?: string,
): Promise<string> => {
  const groupId = doc(collection(db, COLLECTIONS.GROUPS)).id;
  const joinCode = generateJoinCode();

  const groupData: GroupDoc = {
    groupId,
    name,
    coverPhotoURL: coverPhotoURL ?? null,
    joinCode,
    ownerID: userId,
    createdAt: Date.now(),
    memberCount: 1,
  };

  const batch = writeBatch(db);

  // Create group document
  batch.set(doc(db, COLLECTIONS.GROUPS, groupId), groupData);

  // Add creator as owner member
  const memberData: GroupMember = {
    userId,
    role: "owner",
    joinedAt: Date.now(),
  };
  batch.set(
    doc(
      db,
      COLLECTIONS.GROUPS,
      groupId,
      SUBCOLLECTIONS.MEMBERS,
      userId
    ),
    memberData
  );

  await batch.commit();
  return groupId;
};

/**
 * Get group by ID
 */
export const getGroup = async (groupId: string): Promise<GroupDoc | null> => {
  const groupRef = doc(db, COLLECTIONS.GROUPS, groupId);
  const groupSnapshot = await getDoc(groupRef);
  return groupSnapshot.exists() ? (groupSnapshot.data() as GroupDoc) : null;
};

/**
 * Get all groups for a user
 */
export const getUserGroups = async (userId: string): Promise<GroupDoc[]> => {
  const memberRef = collection(
    db,
    COLLECTIONS.GROUPS
  );
  
  // Query groups where user is a member via subcollection check
  const q = query(memberRef); // This is a basic fetch; filtering happens client-side for now
  const querySnapshot = await getDocs(q);
  
  const groups: GroupDoc[] = [];
  for (const groupDoc of querySnapshot.docs) {
    const groupData = groupDoc.data() as GroupDoc;
    const memberRef = doc(
      db,
      COLLECTIONS.GROUPS,
      groupData.groupId,
      SUBCOLLECTIONS.MEMBERS,
      userId
    );
    const memberSnapshot = await getDoc(memberRef);
    if (memberSnapshot.exists()) {
      groups.push(groupData);
    }
  }
  
  return groups;
};

/**
 * Join a group via join code
 */
export const joinGroupByCode = async (
  userId: string,
  joinCode: string
): Promise<string> => {
  const q = query(
    collection(db, COLLECTIONS.GROUPS),
    where("joinCode", "==", joinCode)
  );
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error("Invalid join code");
  }

  const groupDoc = querySnapshot.docs[0];
  const groupData = groupDoc.data() as GroupDoc;
  const groupId = groupData.groupId;

  // Check member count limit
  if (groupData.memberCount >= 10) {
    throw new Error("Group is full (max 10 members)");
  }

  // Check user group limit
  const userGroups = await getUserGroups(userId);
  if (userGroups.length >= 10) {
    throw new Error("You are in too many groups (max 10)");
  }

  // Add user as member
  const memberData: GroupMember = {
    userId,
    role: "member",
    joinedAt: Date.now(),
  };

  const batch = writeBatch(db);
  batch.set(
    doc(
      db,
      COLLECTIONS.GROUPS,
      groupId,
      SUBCOLLECTIONS.MEMBERS,
      userId
    ),
    memberData
  );

  // Increment member count
  batch.update(doc(db, COLLECTIONS.GROUPS, groupId), {
    memberCount: groupData.memberCount + 1,
  });

  await batch.commit();
  return groupId;
};

/**
 * Leave a group
 */
export const leaveGroup = async (
  userId: string,
  groupId: string
): Promise<void> => {
  const groupRef = doc(db, COLLECTIONS.GROUPS, groupId);
  const groupSnapshot = await getDoc(groupRef);

  if (!groupSnapshot.exists()) {
    throw new Error("Group not found");
  }

  const groupData = groupSnapshot.data() as GroupDoc;

  // If user is owner, they must appoint a new owner first
  if (groupData.ownerID === userId) {
    throw new Error(
      "Owner must appoint a new owner before leaving the group"
    );
  }

  const batch = writeBatch(db);

  // Remove user from members subcollection
  batch.delete(
    doc(
      db,
      COLLECTIONS.GROUPS,
      groupId,
      SUBCOLLECTIONS.MEMBERS,
      userId
    )
  );

  // Decrement member count
  batch.update(groupRef, {
    memberCount: Math.max(0, groupData.memberCount - 1),
  });

  await batch.commit();
};

/**
 * Transfer group ownership
 */
export const transferGroupOwnership = async (
  groupId: string,
  newOwnerId: string
): Promise<void> => {
  const batch = writeBatch(db);

  batch.update(doc(db, COLLECTIONS.GROUPS, groupId), {
    ownerID: newOwnerId,
  });

  // Update new owner member role
  batch.update(
    doc(
      db,
      COLLECTIONS.GROUPS,
      groupId,
      SUBCOLLECTIONS.MEMBERS,
      newOwnerId
    ),
    {
      role: "owner",
    }
  );

  await batch.commit();
};

/**
 * Delete a group (owner only)
 */
export const deleteGroup = async (groupId: string): Promise<void> => {
  const batch = writeBatch(db);

  // Delete group document
  batch.delete(doc(db, COLLECTIONS.GROUPS, groupId));

  // Delete all members
  const membersCollection = collection(
    db,
    COLLECTIONS.GROUPS,
    groupId,
    SUBCOLLECTIONS.MEMBERS
  );
  const membersSnapshot = await getDocs(membersCollection);
  membersSnapshot.docs.forEach((memberDoc) => {
    batch.delete(memberDoc.ref);
  });

  await batch.commit();
};

/**
 * Get all members of a group
 */
export const getGroupMembers = async (
  groupId: string
): Promise<(GroupMember & { userId: string })[]> => {
  const membersCollection = collection(
    db,
    COLLECTIONS.GROUPS,
    groupId,
    SUBCOLLECTIONS.MEMBERS
  );
  const membersSnapshot = await getDocs(membersCollection);

  return membersSnapshot.docs.map((doc) => ({
    ...(doc.data() as GroupMember),
    userId: doc.id,
  }));
};

/**
 * Update group metadata (name, cover photo)
 */
export const updateGroup = async (
  groupId: string,
  updates: Partial<Pick<GroupDoc, "name" | "coverPhotoURL">>
): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.GROUPS, groupId), updates);
};
