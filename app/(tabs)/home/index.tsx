import { Link, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useCurrentUser } from "@/src/hooks/useCurrentUser";
import { useGroups } from "@/src/hooks/useGroups";

export default function HomeScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useCurrentUser();
  const { groups, loading, error } = useGroups(user?.uid ?? null);

  const isLoading = authLoading || loading;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.title}>
          My Groups
        </ThemedText>

        <View style={styles.actions}>
          <Button
            title="Create group"
            onPress={() => router.push("/home/create-group")}
            accessibilityLabel="Create a new group"
          />
          <Button
            title="Join group"
            onPress={() => router.push("/home/join-group")}
            accessibilityLabel="Join an existing group"
            variant="secondary"
            style={styles.secondaryButton}
          />
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : error ? (
          <ThemedText style={styles.error}>{error}</ThemedText>
        ) : groups.length === 0 ? (
          <Card style={styles.emptyCard}>
            <ThemedText style={styles.emptyTitle}>No groups yet</ThemedText>
            <ThemedText>
              Create your first group or join a group with a join code.
            </ThemedText>
          </Card>
        ) : (
          groups.map((group) => (
            <Link
              key={group.groupId}
              href={`/home/${group.groupId}`}
              style={styles.link}
              accessibilityLabel={`Open group ${group.name}`}
            >
              <Card>
                <ThemedText type="subtitle">{group.name}</ThemedText>
                <ThemedText style={styles.groupMeta}>
                  {group.memberCount} member{group.memberCount === 1 ? "" : "s"}
                </ThemedText>
              </Card>
            </Link>
          ))
        )}
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
    marginBottom: 24,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#0a7ea4",
  },
  loader: {
    marginTop: 36,
  },
  error: {
    color: "#dc2626",
    marginTop: 12,
  },
  emptyCard: {
    paddingVertical: 28,
  },
  emptyTitle: {
    marginBottom: 8,
    fontWeight: "700",
  },
  groupMeta: {
    marginTop: 8,
    color: "#6b7280",
  },
  link: {
    textDecorationLine: "none",
  },
});
