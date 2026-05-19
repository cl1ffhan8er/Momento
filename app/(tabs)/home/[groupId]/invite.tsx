import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

import { addMemberToGroupByUsername } from "@/src/services/firebase/groups";

export default function InviteScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInvite = async () => {
    if (!groupId) {
      setError("Invalid group");
      return;
    }

    const trimmed = username.trim().replace(/^@/, "");
    if (!trimmed) {
      setError("Enter a username");
      return;
    }

    try {
      setError(null);
      setLoading(true);
      await addMemberToGroupByUsername(groupId, trimmed);
      Alert.alert("Member added", `${trimmed} has been added to the group.`);
      router.back();
    } catch (e: any) {
      setError(e.message ?? "Unable to add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-black px-5 pt-16">
      <View className="mb-8 flex-row items-center justify-between">
        <Text className="text-3xl font-bold text-white">Invite Member</Text>
        <Pressable onPress={() => router.back()}>
          <Text className="text-base text-white">Cancel</Text>
        </Pressable>
      </View>

      <Text className="text-neutral-400">
        Add someone by their username. Enter the username exactly as it appears.
      </Text>

      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="@username"
        placeholderTextColor="#737373"
        className="mt-6 rounded-2xl bg-neutral-900 px-5 py-4 text-white"
      />

      {error ? (
        <Text className="mt-3 text-sm text-red-500">{error}</Text>
      ) : null}

      <Pressable
        onPress={handleInvite}
        disabled={loading}
        className="mt-6 items-center rounded-2xl bg-white py-4"
      >
        <Text className="font-bold text-black">
          {loading ? "Adding..." : "Add Member"}
        </Text>
      </Pressable>
    </View>
  );
}
