import { getGroupAlbums } from "@/src/services/firebase/albums";
import { getGroup, getGroupMembers } from "@/src/services/firebase/groups";
import type { AlbumDoc, GroupDoc, GroupMember } from "@/src/types";
import { useCallback, useEffect, useState } from "react";

export function useGroupDetail(groupId: string | null) {
  const [group, setGroup] = useState<GroupDoc | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [albums, setAlbums] = useState<AlbumDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGroupDetail = useCallback(async () => {
    if (!groupId) {
      setError("Invalid group");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [groupResult, memberResult, albumResult] = await Promise.all([
        getGroup(groupId),
        getGroupMembers(groupId),
        getGroupAlbums(groupId),
      ]);

      if (!groupResult) {
        setError("Group not found");
        return;
      }

      setGroup(groupResult);
      setMembers(memberResult);
      setAlbums(albumResult);
    } catch (e: any) {
      setError(e.message ?? "Unable to load group details");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    void loadGroupDetail();
  }, [loadGroupDetail]);

  return {
    group,
    members,
    albums,
    loading,
    error,
    refresh: loadGroupDetail,
  };
}
