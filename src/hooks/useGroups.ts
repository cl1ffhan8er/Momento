import { createGroup, getGroup, getUserGroups, joinGroupByCode } from "@/src/services/firebase/groups";
import type { GroupDoc } from "@/src/types";
import { useCallback, useEffect, useState } from "react";

export function useGroups(userId: string | null) {
  const [groups, setGroups] = useState<GroupDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGroups = useCallback(async () => {
    if (!userId) {
      setGroups([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getUserGroups(userId);
      setGroups(result);
    } catch (e: any) {
      setError(e.message ?? "Unable to load groups");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  const createNewGroup = useCallback(
    async (name: string, coverPhotoURL?: string) => {
      if (!userId) {
        throw new Error("Not authenticated");
      }
      return createGroup(userId, name, coverPhotoURL);
    },
    [userId]
  );

  const joinGroup = useCallback(
    async (joinCode: string) => {
      if (!userId) {
        throw new Error("Not authenticated");
      }
      return joinGroupByCode(userId, joinCode);
    },
    [userId]
  );

  return {
    groups,
    loading,
    error,
    refresh: loadGroups,
    createNewGroup,
    joinGroup,
    getGroup,
  };
}
