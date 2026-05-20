import { Colors } from "@/constants/theme";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, Pressable, Text, TextInput, View } from "react-native";

import { useCurrentUser } from "@/src/hooks/useCurrentUser";
import { createAlbum, updateAlbum } from "@/src/services/firebase/albums";
import { createPhoto, uploadPhotoFile } from "@/src/services/firebase/photos";

export default function CreateAlbumScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { user } = useCurrentUser();

  const [title, setTitle] = useState("");
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePickCover = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Allow photo access to choose a cover image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setCoverUri(result.assets[0].uri);
    }
  };

  const handleCreate = async () => {
    if (!groupId || !user) {
      setError("Unable to create album");
      return;
    }

    const trimmed = title.trim();
    if (!trimmed) {
      setError("Enter an album title");
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const albumId = await createAlbum(groupId, trimmed, user.uid);
      let coverPhotoUrl: string | undefined;

      if (coverUri) {
        coverPhotoUrl = await uploadPhotoFile(coverUri, albumId);
        await updateAlbum(albumId, { coverPhotoUrl });
        await createPhoto(albumId, groupId, user.uid, coverPhotoUrl, `${trimmed} cover`, "Cover image");
      }

      Alert.alert("Album created", `Your album "${trimmed}" was created.`);
      router.back();
    } catch (e: any) {
      setError(e.message ?? "Unable to create album");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background px-5 pt-16">
      <View className="mb-8 flex-row items-center justify-between">
        <Text className="font-koulen text-3xl font-bold text-textPrimary">Create Album</Text>
        <Pressable onPress={() => router.back()}>
          <Text className="text-base text-textPrimary">Cancel</Text>
        </Pressable>
      </View>

      <Text className="text-textMuted">
        Give your new album a title and choose a cover image for the gallery tile.
      </Text>

      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Album title"
        placeholderTextColor={Colors.light.textMuted}
        className="mt-6 rounded-2xl border border-secondary bg-surface px-5 py-4 text-textPrimary"
      />

      <Pressable
        onPress={handlePickCover}
        className="mt-4 rounded-2xl border border-secondary bg-surface px-5 py-4"
      >
        <Text className="text-base font-semibold text-textPrimary">
          {coverUri ? "Change cover photo" : "Choose cover photo"}
        </Text>
      </Pressable>

      {coverUri ? (
        <View className="mt-4 overflow-hidden rounded-3xl bg-card shadow-lg">
          <Image
            source={{ uri: coverUri }}
            className="h-52 w-full"
            resizeMode="cover"
          />
        </View>
      ) : null}

      {error ? (
        <Text className="mt-3 text-sm text-textPrimary">{error}</Text>
      ) : null}

      <Pressable
        onPress={handleCreate}
        disabled={loading}
        className="mt-6 items-center rounded-2xl bg-primary py-4"
      >
        <Text className="font-bold text-white">
          {loading ? "Creating..." : "Create Album"}
        </Text>
      </Pressable>
    </View>
  );
}
