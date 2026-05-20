import { Colors } from "@/constants/theme";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { useGroupDetail } from "@/src/hooks/useGroupDetail";
import { updateGroup, updateGroupMemberNickname, uploadGroupCoverPhoto } from "@/src/services/firebase/groups";

export default function MembersScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { members, refresh, group } = useGroupDetail(groupId ?? null);

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"members" | "photo">("members");
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [coverSaving, setCoverSaving] = useState(false);

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

  const handlePickCoverPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Allow photo access to change the group cover photo.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setCoverUri(result.assets[0].uri);
      setError(null);
    }
  };

  const handleSaveCoverPhoto = async () => {
    if (!groupId || !coverUri) {
      setError("Choose a cover photo before saving.");
      return;
    }

    try {
      setCoverSaving(true);
      setError(null);
      const coverPhotoURL = await uploadGroupCoverPhoto(coverUri, groupId);
      await updateGroup(groupId, { coverPhotoURL });
      setCoverUri(null);
      await refresh();
    } catch (e: any) {
      setError(e.message ?? "Unable to update group photo");
    } finally {
      setCoverSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-background px-5 pt-16">
      <View className="mb-8 flex-row items-center justify-between">
        <Text className="font-koulen text-3xl font-bold text-textPrimary">Members</Text>

        <Pressable onPress={() => router.back()}>
          <Text className="text-base text-textPrimary">Done</Text>
        </Pressable>
      </View>

      <View className="mb-6 flex-row rounded-full bg-surface p-1">
        <Pressable
          onPress={() => setActiveTab("members")}
          className={`flex-1 rounded-full px-4 py-3 ${
            activeTab === "members"
              ? "bg-card"
              : "bg-transparent"
          }`}
        >
          <Text className={`text-center font-semibold ${activeTab === "members" ? "text-textPrimary" : "text-textMuted"}`}>
            Members
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("photo")}
          className={`flex-1 rounded-full px-4 py-3 ${
            activeTab === "photo"
              ? "bg-card"
              : "bg-transparent"
          }`}
        >
          <Text className={`text-center font-semibold ${activeTab === "photo" ? "text-textPrimary" : "text-textMuted"}`}>
            Group Photo
          </Text>
        </Pressable>
      </View>

      {activeTab === "members" ? (
        <>
          {editingUserId ? (
            <View className="mb-6 rounded-3xl bg-card p-4 shadow-lg">
              <Text className="text-sm text-textMuted">Edit nickname for {editingUserId}</Text>
              <TextInput
                value={nickname}
                onChangeText={setNickname}
                placeholder="Nickname"
                placeholderTextColor={Colors.light.textMuted}
                className="mt-3 rounded-2xl border border-secondary bg-surface px-4 py-3 text-textPrimary"
              />
              {error ? <Text className="mt-2 text-sm text-textPrimary">{error}</Text> : null}
              <View className="mt-4 flex-row justify-between">
                <Pressable
                  onPress={() => setEditingUserId(null)}
                  className="rounded-2xl bg-surface px-4 py-3"
                >
                  <Text className="text-textPrimary">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleSave}
                  disabled={saving}
                  className="rounded-2xl bg-primary px-4 py-3"
                >
                  <Text className="font-bold text-white">{saving ? "Saving..." : "Save"}</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          <FlatList
            data={members}
            keyExtractor={(item) => item.userId}
            renderItem={({ item }) => (
              <View className="mb-4 flex-row items-center rounded-3xl bg-card p-4 shadow-lg">
                <View className="mr-4 h-14 w-14 items-center justify-center rounded-full bg-surface">
                  <Text className="text-lg font-bold text-textPrimary">{(item.nickname ?? item.userId)[0]}</Text>
                </View>

                <View className="flex-1">
                  <Text className="text-base font-bold text-textPrimary">{item.nickname ?? "Unnamed"}</Text>
                  <Text className="mt-1 text-sm text-textMuted">{item.role}</Text>
                </View>

                <Pressable
                  onPress={() => handleEdit(item)}
                  className="rounded-full bg-surface px-4 py-3"
                >
                  <Text className="text-textPrimary">✎</Text>
                </Pressable>
              </View>
            )}
          />
        </>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          className="space-y-6"
        >
          <View className="rounded-3xl bg-card p-4 shadow-lg">
            <Text className="text-sm text-textMuted">Current cover photo</Text>
            {group?.coverPhotoURL ? (
              <Image
                source={{ uri: group.coverPhotoURL }}
                className="mt-4 h-48 w-full rounded-3xl"
                resizeMode="cover"
              />
            ) : (
              <View className="mt-4 h-48 items-center justify-center rounded-3xl bg-surface">
                <Text className="text-textMuted">No cover photo set</Text>
              </View>
            )}
          </View>

          <View className="rounded-3xl bg-card p-4 shadow-lg">
            <Text className="text-sm text-textMuted">Choose a new group cover</Text>
            <Pressable
              onPress={handlePickCoverPhoto}
              className="mt-4 rounded-3xl border border-secondary bg-surface px-4 py-4 items-center"
            >
              <Text className="text-textPrimary">
                {coverUri ? "Change selected photo" : "Select cover photo"}
              </Text>
            </Pressable>
            {coverUri ? (
              <Image
                source={{ uri: coverUri }}
                className="mt-4 h-48 w-full rounded-3xl"
                resizeMode="cover"
              />
            ) : null}
          </View>

          {error ? <Text className="text-sm text-textPrimary">{error}</Text> : null}

          <View className="flex-row justify-between">
            <Pressable
              onPress={() => setCoverUri(null)}
              className="flex-1 rounded-2xl bg-surface px-4 py-4 mr-3 items-center"
            >
              <Text className="text-textPrimary">Clear</Text>
            </Pressable>
            <Pressable
              onPress={handleSaveCoverPhoto}
              disabled={coverSaving}
              className="flex-1 rounded-2xl bg-primary px-4 py-4 items-center"
            >
              <Text className="font-bold text-white">{coverSaving ? "Saving..." : "Save"}</Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
