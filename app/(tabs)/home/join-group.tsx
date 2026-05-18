import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
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
      const groupId = await joinGroup(joinCode.trim().toUpperCase());
      router.replace(`/home/${groupId}`);
    } catch (error: any) {
      Alert.alert("Unable to join group", error.message ?? "Try again later");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <ThemedText type="title" style={styles.title}>
            Join Group
          </ThemedText>
          <ThemedText style={styles.label}>Enter join code</ThemedText>
          <Input
            value={joinCode}
            onChangeText={setJoinCode}
            placeholder="XXXXXX"
            autoCapitalize="characters"
          />
          <Button
            title={saving ? "Joining..." : "Join group"}
            onPress={handleSubmit}
            accessibilityLabel="Join group by code"
          />
        </Card>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: "600",
  },
});
