import {
  getUser,
  updateUserProfile,
  uploadAvatar,
  usernameExists,
} from "@/src/services/firebase/users";
import type { UserDoc } from "@/src/types";
import { useCallback, useEffect, useState } from "react";

export function useProfile(uid: string | null) {
  const [profile, setProfile] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!uid) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getUser(uid);
      setProfile(result);
    } catch (e: any) {
      setError(e.message ?? "Unable to load profile");
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const updateProfile = useCallback(
    async (updates: { username?: string; bio?: string }) => {
      if (!uid) throw new Error("Not authenticated");

      if (updates.username) {
        const exists = await usernameExists(updates.username, uid);
        if (exists) {
          throw new Error("Username is already taken");
        }
      }

      await updateUserProfile(uid, updates);
      await loadProfile();
    },
    [uid, loadProfile],
  );

  const updateAvatarImage = useCallback(
    async (uri: string) => {
      if (!uid) throw new Error("Not authenticated");

      const avatarURL = await uploadAvatar(uri, uid);
      await updateUserProfile(uid, { avatarURL });
      await loadProfile();
    },
    [uid, loadProfile],
  );

  return {
    profile,
    loading,
    error,
    refresh: loadProfile,
    updateProfile,
    updateAvatarImage,
  };
}
