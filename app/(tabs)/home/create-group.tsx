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

export default function CreateGroupScreen() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const { createNewGroup } = useGroups(user?.uid ?? null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Group name is required");
      return;
    }

    try {
      setSaving(true);
      const groupId = await createNewGroup(name.trim());
      router.replace(`/home/${groupId}`);
    } catch (error: any) {
      Alert.alert("Unable to create group", error.message ?? "Try again later");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <ThemedText type="title" style={styles.title}>
            Create Group
          </ThemedText>
          <ThemedText style={styles.label}>Group name</ThemedText>
          <Input
            placeholder="Enter a name"
            value={name}
            onChangeText={setName}
          />

          <Button
            title={saving ? "Creating..." : "Create group"}
            onPress={handleSubmit}
            accessibilityLabel="Create group"
            style={styles.button}
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
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    color: "#111827",
    backgroundColor: "#f8fafc",
  },
  button: {
    marginTop: 12,
  },
});
