import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useCurrentUser } from "@/src/hooks/useCurrentUser";
import { useGroups } from "@/src/hooks/useGroups";

export default function JoinGroupScreen() {
  const router = useRouter();

  const { user } = useCurrentUser();
  const { joinGroup } = useGroups(user?.uid ?? null);

  const [joinCode, setJoinCode] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!joinCode.trim()) {
      Alert.alert("Join code is required");
      return;
    }

    try {
      setSaving(true);

      const groupId = await joinGroup(
        joinCode.trim().toUpperCase()
      );

      router.replace(`/home/${groupId}`);
    } catch (error: any) {
      Alert.alert(
        "Unable to join group",
        error.message ?? "Try again later"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-black"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="flex-1 justify-center px-6">
        {/* Header */}
        <View className="mb-10">
          <Text className="text-4xl font-bold text-white">
            Join Group
          </Text>

          <Text className="mt-3 text-base text-neutral-400">
            Enter a group invite code to join
            shared albums and memories.
          </Text>
        </View>

        {/* Card */}
        <View className="rounded-3xl bg-neutral-900 p-6">
          {/* Label */}
          <Text className="mb-3 text-sm font-semibold uppercase tracking-widest text-neutral-400">
            Join Code
          </Text>

          {/* Input */}
          <TextInput
            value={joinCode}
            onChangeText={setJoinCode}
            placeholder="XXXXXX"
            placeholderTextColor="#737373"
            autoCapitalize="characters"
            autoCorrect={false}
            className="rounded-2xl border border-neutral-800 bg-neutral-950 px-5 py-4 text-center text-2xl font-bold tracking-[8px] text-white"
          />

          {/* Join Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={saving}
            activeOpacity={0.8}
            className="mt-6 items-center rounded-2xl bg-white py-4"
          >
            <Text className="text-base font-bold text-black">
              {saving ? "Joining..." : "Join Group"}
            </Text>
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="mt-4 items-center"
          >
            <Text className="text-sm text-neutral-400">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}