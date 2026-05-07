import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../lib/firestore";

const generateJoinCode = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

export const createGroup = async (name: string, userId: string) => {
  const userGroups = await getUserGroups(userId);
  if (userGroups.length >= 10)
    throw new Error("You can't be in more than 10 groups.");

  const joinCode = generateJoinCode();

  const groupRef = await addDoc(collection(db, "groups"), {
    name,
    coverPhotoUrl: null,
    joinCode,
    ownerId: userId,
    memberIds: [userId],
    memberCount: 1,
    createdAt: serverTimestamp(),
  });

  await addDoc(collection(db, "groups", groupRef.id, "members"), {
    userId,
    role: "owner",
    joinedAt: serverTimestamp(),
    nickname: null,
    avatarUrl: null,
  });

  return groupRef.id;
};

export const joinGroup = async (joinCode: string, userId: string) => {
  const userGroups = await getUserGroups(userId);
  if (userGroups.length >= 10)
    throw new Error("You can't be in more than 10 groups.");

  const q = query(
    collection(db, "groups"),
    where("joinCode", "==", joinCode.toUpperCase()),
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) throw new Error("Invalid join code.");

  const groupDoc = snapshot.docs[0];
  const group = groupDoc.data();

  if (group.memberIds.includes(userId))
    throw new Error("You're already in this group.");
  if (group.memberCount >= 10) throw new Error("This group is full.");

  await runTransaction(db, async (tx) => {
    tx.update(groupDoc.ref, {
      memberIds: arrayUnion(userId),
      memberCount: group.memberCount + 1,
    });

    const memberRef = doc(collection(db, "groups", groupDoc.id, "members"));
    tx.set(memberRef, {
      userId,
      role: "member",
      joinedAt: serverTimestamp(),
      nickname: null,
      avatarUrl: null,
    });
  });

  return groupDoc.id;
};

export const leaveGroup = async (
  groupId: string,
  userId: string,
  newOwnerId?: string,
) => {
  const groupRef = doc(db, "groups", groupId);
  const groupSnap = await getDoc(groupRef);

  if (!groupSnap.exists()) throw new Error("Group not found.");

  const group = groupSnap.data();
  const isOwner = group.ownerId === userId;

  if (isOwner && !newOwnerId)
    throw new Error("Appoint a new owner before leaving.");
  if (isOwner && newOwnerId && !group.memberIds.includes(newOwnerId))
    throw new Error("New owner must be a group member.");

  await runTransaction(db, async (tx) => {
    tx.update(groupRef, {
      memberIds: arrayRemove(userId),
      memberCount: group.memberCount - 1,
      ...(isOwner && { ownerId: newOwnerId }),
    });

    if (isOwner && newOwnerId) {
      const membersSnap = await getDocs(
        query(
          collection(db, "groups", groupId, "members"),
          where("userId", "==", newOwnerId),
        ),
      );
      if (!membersSnap.empty) {
        tx.update(membersSnap.docs[0].ref, { role: "owner" });
      }
    }

    const leavingMemberSnap = await getDocs(
      query(
        collection(db, "groups", groupId, "members"),
        where("userId", "==", userId),
      ),
    );
    if (!leavingMemberSnap.empty) {
      tx.delete(leavingMemberSnap.docs[0].ref);
    }
  });
};

export const getUserGroups = async (userId: string) => {
  const q = query(
    collection(db, "groups"),
    where("memberIds", "array-contains", userId),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getGroupMembers = async (groupId: string) => {
  const snapshot = await getDocs(collection(db, "groups", groupId, "members"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getGroupByCode = async (joinCode: string) => {
  const q = query(
    collection(db, "groups"),
    where("joinCode", "==", joinCode.toUpperCase()),
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};
