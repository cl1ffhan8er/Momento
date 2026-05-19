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
    <View className="flex-1 bg-black px-5 pt-16">
      {/* HEADER */}
      <View className="mb-6 flex-row items-center">
        {/* BACK */}
        <Pressable
          onPress={() => router.back()}
          className="mr-4"
        >
          <Text className="text-base text-white">
            Back
          </Text>
        </Pressable>

        {/* GROUP CARD */}
        <Pressable className="flex-1 flex-row items-center" onPress={() => router.push(`/home/${groupId}/members`)}>
          <View className="mr-3 h-14 w-14 items-center justify-center rounded-2xl bg-neutral-800">
            <Text className="text-xl font-bold text-white">
              {group?.name?.[0] ?? "G"}
            </Text>
          </View>

          <View className="flex-1">
            <Text className="text-xl font-bold text-white">
              {group?.name ?? "Group"}
            </Text>

            <Text className="mt-1 text-sm text-neutral-400">
              {group?.memberCount ?? 0} members
            </Text>
          </View>
        </Pressable>

        {/* INVITE */}
        <Pressable
          onPress={() =>
            router.push(`/home/${groupId}/invite`)
          }
          className="ml-3 h-12 w-12 items-center justify-center rounded-full bg-white"
        >
          <Text className="text-2xl font-bold text-black">
            +
          </Text>
        </Pressable>
      </View>

      <View className="mb-6 items-center">
        <Text className="text-5xl font-bold tracking-widest text-white uppercase">
          YOUR ALBUMS
        </Text>
        <View className="mt-3 h-px w-full bg-neutral-700" />
      </View>

      {/* SEARCH + SORT */}
      <View className="mb-5 flex-row items-center">
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search albums"
          placeholderTextColor="#737373"
          className="flex-1 rounded-2xl bg-neutral-900 px-5 py-4 text-white"
        />

        <Pressable
          onPress={() =>
            setSortNewest(
              (value) => !value
            )
          }
          className="ml-3 rounded-2xl bg-neutral-900 px-5 py-4"
        >
          <Text className="font-semibold text-white">
            {sortNewest
              ? "Newest"
              : "Oldest"}
          </Text>
        </Pressable>
      </View>

      {/* CONTENT */}
      {loading ? (
        <ActivityIndicator />
      ) : error ? (
        <Text className="text-red-500">
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
            <View className="mt-10 items-center rounded-3xl bg-neutral-900 p-8">
              <Text className="text-lg font-bold text-white">
                No albums yet
              </Text>

              <Text className="mt-2 text-center text-neutral-400">
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
              <View className="overflow-hidden rounded-3xl bg-neutral-900">
                {/* COVER */}
                {item.coverPhotoUrl ? (
                  <Image
                    source={{ uri: item.coverPhotoUrl }}
                    className="h-40 w-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="h-40 items-center justify-center bg-neutral-800">
                    <Text className="text-4xl font-bold text-white">
                      {item.title[0] ?? "A"}
                    </Text>
                  </View>
                )}

                {/* INFO */}
                <View className="p-4">
                  <Text className="text-base font-bold text-white">
                    {item.title}
                  </Text>

                  <Text className="mt-1 text-sm text-neutral-400">
                    {item.photoCount} photos
                  </Text>
                </View>
              </View>
            </Pressable>
          )}
        />
      )}

      {/* CREATE ALBUM BUTTON */}
      <Pressable
        onPress={() =>
          router.push(`/home/${groupId}/create-album`)
        }
        className="absolute bottom-8 left-5 right-5 items-center rounded-3xl bg-white py-5"
      >
        <Text className="text-base font-bold text-black">
          Create Album
        </Text>
      </Pressable>
    </View>
  );
}