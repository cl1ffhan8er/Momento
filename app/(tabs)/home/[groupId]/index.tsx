import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { useCurrentUser } from "@/src/hooks/useCurrentUser";
import { useGroupDetail } from "@/src/hooks/useGroupDetail";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GroupDetailScreen() {
  const router = useRouter();

  const { groupId } =
    useLocalSearchParams<{ groupId: string }>();

  const { user } = useCurrentUser();

  const {
    group,
    members,
    albums,
    loading,
    error,
    refresh,
  } = useGroupDetail(groupId ?? null);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [sortNewest, setSortNewest] =
    useState(true);

  const filteredAlbums = useMemo(() => {
    const lower =
      searchQuery.toLowerCase();

    return albums
      .filter((album) =>
        album.title
          .toLowerCase()
          .includes(lower)
      )
      .sort((a, b) =>
        sortNewest
          ? b.createdAt - a.createdAt
          : a.createdAt - b.createdAt
      );
  }, [albums, searchQuery, sortNewest]);

  useEffect(() => {
    const routerAny = router as any;
    const unsubscribe = routerAny?.addListener?.("focus", () => {
      refresh();
    });

    return typeof unsubscribe === "function"
      ? unsubscribe
      : undefined;
  }, [router, refresh]);

  return (
    <SafeAreaView className="flex-1 bg-background px-5" edges={["top", "left", "right"]}>
      {/* HEADER */}
      <View className="mb-6 flex-row items-center">
        {/* BACK */}
        <Pressable
          onPress={() => router.back()}
          className="mr-4"
        >
          <Text className="text-primary text-5xl">‹</Text>
        </Pressable>

        {/* GROUP CARD */}
        <Pressable className="flex-1 flex-row items-center" onPress={() => router.push(`/home/${groupId}/members`)}>
          <View className="mr-3 h-14 w-14 overflow-hidden rounded-2xl bg-surface">
            {group?.coverPhotoURL ? (
              <Image
                source={{ uri: group.coverPhotoURL }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <View className="h-full w-full items-center justify-center bg-card">
                <Text className="text-xl font-bold text-textPrimary">
                  {group?.name?.[0] ?? "G"}
                </Text>
              </View>
            )}
          </View>

          <View className="flex-1">
            <Text className="text-xl font-koulen font-bold text-textPrimary">
              {group?.name ?? "Group"}
            </Text>

            <Text className="mt-1 text-sm text-textMuted">
              {group?.memberCount ?? 0} members
            </Text>
          </View>
        </Pressable>

        {/* INVITE */}
        <Pressable
          onPress={() =>
            router.push(`/home/${groupId}/invite`)
          }
          className="ml-3 h-12 w-12 items-center justify-center rounded-full bg-secondary"
        >
          <Text className="text-2xl font-bold text-white">
            +
          </Text>
        </Pressable>
      </View>

      <View className="mb-6 items-center">
        <Text className="font-koulen text-5xl leading-[72px] tracking-widest text-primary uppercase">
          YOUR ALBUMS
        </Text>
        <View className="mt-3 h-px w-full bg-secondary" />
      </View>

      {/* SEARCH + SORT */}
      <View className="mb-5 flex-row items-center">
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search albums"
          placeholderTextColor="#6B7280"
          className="flex-1 rounded-2xl border border-secondary bg-surface px-5 py-4 text-textPrimary"
        />

        <Pressable
          onPress={() =>
            setSortNewest(
              (value) => !value
            )
          }
          className="ml-3 rounded-2xl bg-card px-5 py-4 border border-secondary"
        >
          <Text className="font-semibold text-textPrimary">
            {sortNewest ? "Newest ⬇️" : "Oldest ⬆️"}
          </Text>
        </Pressable>
      </View>

      {/* CONTENT */}
      {loading ? (
        <ActivityIndicator />
      ) : error ? (
        <Text className="text-textPrimary">
          {error}
        </Text>
      ) : (
        <FlatList
          data={filteredAlbums}
          keyExtractor={(item) =>
            item.albumId
          }
          numColumns={2}
          showsVerticalScrollIndicator={
            false
          }
          columnWrapperStyle={{
            justifyContent:
              "space-between",
          }}
          contentContainerStyle={{
            paddingBottom: 120,
          }}
          ListEmptyComponent={() => (
            <View className="mt-10 items-center rounded-3xl bg-card p-8 shadow-lg">
              <Text className="text-lg font-bold text-textPrimary">
                No albums yet
              </Text>

              <Text className="mt-2 text-center text-textMuted">
                Create an album and start
                sharing memories.
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <Pressable
              className="mb-4 w-[48%]"
              onPress={() =>
                router.push(
                  `/home/${groupId}/albums/${item.albumId}`
                )
              }
            >
              <View className="overflow-hidden rounded-3xl bg-card shadow-lg">
                {/* COVER */}
                {item.coverPhotoUrl ? (
                  <Image
                    source={{ uri: item.coverPhotoUrl }}
                    className="h-40 w-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="h-40 items-center justify-center bg-surface">
                    <Text className="text-4xl font-bold text-textPrimary">
                      {item.title[0] ?? "A"}
                    </Text>
                  </View>
                )}

                {/* INFO */}
                <View className="p-4">
                  <Text className="text-base font-bold text-textPrimary">
                    {item.title}
                  </Text>

                  <Text className="mt-1 text-sm text-textMuted">
                    {item.photoCount} photos
                  </Text>
                </View>
              </View>
            </Pressable>
          )}
        />
      )}

      {/* CREATE ALBUM BUTTON */} {/* Floating Buttons */}
      <View className="absolute bottom-8 left-5 right-5 rounded-3xl p-3 shadow-lg">
        <Pressable
          onPress={() =>
            router.push(`/home/${groupId}/create-album`)
          }
          className="items-center rounded-3xl bg-primary py-5"
        >
          <Text className="text-base font-bold text-white">
            Create Album
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}