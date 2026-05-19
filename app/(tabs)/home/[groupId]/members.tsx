import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";

import { useCurrentUser } from "@/src/hooks/useCurrentUser";
import { useGroupDetail } from "@/src/hooks/useGroupDetail";
import { updateGroupMemberNickname } from "@/src/services/firebase/groups";

export default function MembersScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { user } = useCurrentUser();
  const { members, refresh } = useGroupDetail(groupId ?? null);

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = (member: { userId: string; nickname?: string | null }) => {
    setEditingUserId(member.userId);
    setNickname(member.nickname ?? "");
    setError(null);
  };

  const handleSave = async () => {
    if (!groupId || !editingUserId) return;

    try {
      setSaving(true);
      setError(null);
      await updateGroupMemberNickname(groupId, editingUserId, nickname.trim());
      setEditingUserId(null);
      setNickname("");
      await refresh();
    } catch (e: any) {
      setError(e.message ?? "Unable to update nickname");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-black px-5 pt-16">
      <View className="mb-8 flex-row items-center justify-between">
        <Text className="text-3xl font-bold text-white">Members</Text>

        <Pressable onPress={() => router.back()}>
          <Text className="text-base text-white">Done</Text>
        </Pressable>
      </View>

      {editingUserId ? (
        <View className="mb-6 rounded-3xl bg-neutral-900 p-4">
          <Text className="text-sm text-neutral-400">Edit nickname for {editingUserId}</Text>
          <TextInput
            value={nickname}
            onChangeText={setNickname}
            placeholder="Nickname"
            placeholderTextColor="#737373"
            className="mt-3 rounded-2xl bg-black px-4 py-3 text-white"
          />
          {error ? <Text className="mt-2 text-sm text-red-500">{error}</Text> : null}
          <View className="mt-4 flex-row justify-between">
            <Pressable
              onPress={() => setEditingUserId(null)}
              className="rounded-2xl bg-neutral-800 px-4 py-3"
            >
              <Text className="text-white">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              disabled={saving}
              className="rounded-2xl bg-white px-4 py-3"
            >
              <Text className="font-bold text-black">{saving ? "Saving..." : "Save"}</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <FlatList
        data={members}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => (
          <View className="mb-4 flex-row items-center rounded-3xl bg-neutral-900 p-4">
            <View className="mr-4 h-14 w-14 items-center justify-center rounded-full bg-neutral-800">
              <Text className="text-lg font-bold text-white">{(item.nickname ?? item.userId)[0]}</Text>
            </View>

            <View className="flex-1">
              <Text className="text-base font-bold text-white">{item.nickname ?? "Unnamed"}</Text>
              <Text className="mt-1 text-sm text-neutral-400">{item.role}</Text>
            </View>

            <Pressable
              onPress={() => handleEdit(item)}
              className="rounded-full bg-neutral-800 px-4 py-3"
            >
              <Text className="text-white">✎</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}
