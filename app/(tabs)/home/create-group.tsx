import { Colors } from "@/constants/theme";
import { uploadFile } from "@/src/services/firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useCurrentUser } from "@/src/hooks/useCurrentUser";
import { useGroups } from "@/src/hooks/useGroups";

export default function CreateGroupScreen() {
  const router = useRouter();

  const { user } = useCurrentUser();
  const { createNewGroup } = useGroups(user?.uid ?? null);

  const [name, setName] = useState("");
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handlePickCoverPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Allow photo access to choose a cover image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setCoverUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Group name is required");
      return;
    }

    if (!coverUri) {
      Alert.alert("Cover photo required", "Please choose a cover photo for the group.");
      return;
    }

    try {
      setSaving(true);

      const coverPhotoURL = await uploadFile(coverUri, "groups/cover");
      const groupId = await createNewGroup(name.trim(), coverPhotoURL);

      router.replace(`/home/${groupId}`);
    } catch (error: any) {
      Alert.alert(
        "Unable to create group",
        error.message ?? "Try again later"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="flex-1 justify-center px-6">
        {/* Header */}
        <View className="mb-10">
          <Text className="font-koulen text-4xl font-bold text-textPrimary">
            Create Group
          </Text>

          <Text className="font-koulen mt-3 text-base text-textMuted">
            Create a shared space for memories,
            albums, and moments.
          </Text>
        </View>

        {/* Card */}
        <View className="rounded-3xl bg-card p-6 shadow-lg">
          {/* Label */}
          <Text className="mb-3 text-sm font-semibold uppercase tracking-widest text-textMuted">
            Group Name
          </Text>

          {/* Input */}
          <TextInput
            placeholder="Enter your group name"
            placeholderTextColor={Colors.light.textMuted}
            value={name}
            onChangeText={setName}
            className="rounded-2xl border border-secondary bg-surface px-5 py-4 text-base text-textPrimary"
          />

          <View className="mt-5">
            <Text className="mb-3 text-sm font-semibold uppercase tracking-widest text-textMuted">
              Group Cover Photo
            </Text>
            <TouchableOpacity
              onPress={handlePickCoverPhoto}
              activeOpacity={0.8}
              className="rounded-3xl border border-secondary bg-surface px-5 py-4 items-center justify-center"
            >
              <Text className="text-base text-textPrimary font-koulen">
                {coverUri ? "Change cover photo" : "Choose cover photo"}
              </Text>
            </TouchableOpacity>
            {coverUri ? (
              <Image
                source={{ uri: coverUri }}
                className="mt-4 h-40 w-full rounded-3xl"
                resizeMode="cover"
              />
            ) : null}
          </View>

          {/* Create Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={saving}
            activeOpacity={0.8}
            className="mt-6 items-center rounded-2xl bg-primary py-4"
          >
            <Text className="text-base font-bold text-white">
              {saving ? "Creating..." : "Create Group"}
            </Text>
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="mt-4 items-center"
          >
            <Text className="text-sm text-textMuted">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}