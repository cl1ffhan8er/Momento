import { Colors } from "@/constants/theme";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
import { useProfile } from "@/src/hooks/useProfile";

export default function EditProfileScreen() {
  const router = useRouter();

  const { user } = useCurrentUser();
  const { profile, loading, updateProfile, updateAvatarImage } = useProfile(user?.uid ?? null);

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username ?? "");
      setBio(profile.bio ?? "");
    }
  }, [profile]);

  const handlePickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Allow photo access to choose a profile picture.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!username.trim()) {
      Alert.alert("Username is required");
      return;
    }

    try {
      setSaving(true);

      if (avatarUri) {
        await updateAvatarImage(avatarUri);
      }

      await updateProfile({
        username: username.trim(),
        bio: bio.trim(),
      });

      router.back();
    } catch (error: any) {
      Alert.alert(
        "Unable to save profile",
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
        <View className="mb-10">
          <Text className="font-koulen text-4xl font-bold text-textPrimary">
            Edit Profile
          </Text>

          <Text className="font-koulen mt-3 text-base text-textMuted">
            Update your photo, name, and bio.
          </Text>
        </View>

        <View className="rounded-3xl bg-card p-6 shadow-lg">
          <View className="items-center mb-6">
            <TouchableOpacity onPress={handlePickAvatar} activeOpacity={0.8}>
              <View className="h-24 w-24 overflow-hidden rounded-full bg-surface">
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                ) : profile?.avatarURL ? (
                  <Image
                    source={{ uri: profile.avatarURL }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="h-full w-full items-center justify-center bg-card">
                    <Text className="text-3xl font-bold text-textPrimary">
                      {username?.[0]?.toUpperCase() ?? "U"}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <Text className="mt-3 text-sm font-semibold text-textMuted">
              Tap to change photo
            </Text>
          </View>

          <Text className="mb-3 text-sm font-semibold uppercase tracking-widest text-textMuted">
            Username
          </Text>

          <TextInput
            placeholder="Enter your username"
            placeholderTextColor={Colors.light.textMuted}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            className="rounded-2xl border border-secondary bg-surface px-5 py-4 text-base text-textPrimary"
          />

          <View className="mt-5">
            <Text className="mb-3 text-sm font-semibold uppercase tracking-widest text-textMuted">
              Bio
            </Text>

            <TextInput
              placeholder="Tell us about yourself"
              placeholderTextColor={Colors.light.textMuted}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="rounded-2xl border border-secondary bg-surface px-5 py-4 text-base text-textPrimary"
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={saving}
            activeOpacity={0.8}
            className="mt-6 items-center rounded-2xl bg-primary py-4"
          >
            <Text className="text-base font-bold text-white">
              {saving ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>

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
