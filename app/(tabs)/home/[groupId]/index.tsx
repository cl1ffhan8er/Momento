import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    View
} from "react-native";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useCurrentUser } from "@/src/hooks/useCurrentUser";
import { useGroupDetail } from "@/src/hooks/useGroupDetail";
import { createAlbum } from "@/src/services/firebase/albums";

export default function GroupDetailScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { user } = useCurrentUser();
  const { group, members, albums, loading, error, refresh } = useGroupDetail(groupId ?? null);
  const [memberViewOpen, setMemberViewOpen] = useState(false);
  const [memberTab, setMemberTab] = useState<"all" | "admins">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortNewest, setSortNewest] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newAlbumTitle, setNewAlbumTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const filteredAlbums = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    return albums
      .filter((album) => album.title.toLowerCase().includes(lowerQuery))
      .sort((a, b) => (sortNewest ? b.createdAt - a.createdAt : a.createdAt - b.createdAt));
  }, [albums, searchQuery, sortNewest]);

  const visibleMembers = useMemo(
    () =>
      members.filter((member) =>
        memberTab === "admins" ? member.role === "owner" : true
      ),
    [memberTab, members]
  );

  const handleCreateAlbum = async () => {
    if (!groupId || !user) {
      return;
    }

    if (!newAlbumTitle.trim()) {
      return;
    }

    try {
      setCreating(true);
      await createAlbum(groupId, newAlbumTitle.trim(), user.uid);
      await refresh();
      setNewAlbumTitle("");
      setCreateModalOpen(false);
    } catch (e: any) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.navButton}>
            <ThemedText>Back</ThemedText>
          </Pressable>
          <Pressable
            onPress={() => setMemberViewOpen((value) => !value)}
            style={styles.groupCard}
          >
            <View style={styles.avatarPlaceholder}>
              <ThemedText type="title">{group?.name?.[0] ?? "G"}</ThemedText>
            </View>
            <View style={styles.groupInfo}>
              <ThemedText type="title">{group?.name ?? "Group"}</ThemedText>
              <ThemedText style={styles.membersText}>
                Members • {group?.memberCount ?? 0}
              </ThemedText>
            </View>
          </Pressable>
          <Pressable style={styles.navButton} onPress={() => router.push("/home/join-group")}>
            <ThemedText>Add</ThemedText>
          </Pressable>
        </View>

        {memberViewOpen ? (
          <Card style={styles.membersCard}>
            <View style={styles.tabsRow}>
              <Pressable onPress={() => setMemberTab("all")} style={memberTab === "all" ? styles.activeTab : styles.tab}>
                <ThemedText>{"All"}</ThemedText>
              </Pressable>
              <Pressable onPress={() => setMemberTab("admins")} style={memberTab === "admins" ? styles.activeTab : styles.tab}>
                <ThemedText>{"Admins"}</ThemedText>
              </Pressable>
            </View>
            {visibleMembers.map((member) => (
              <View key={member.userId} style={styles.memberRow}>
                <ThemedText>{member.nickname ?? member.userId}</ThemedText>
                <ThemedText style={styles.roleText}>{member.role}</ThemedText>
              </View>
            ))}
          </Card>
        ) : null}

        <View style={styles.searchRow}>
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search albums"
            style={styles.searchInput}
          />
          <Button
            title={sortNewest ? "Newest" : "Oldest"}
            onPress={() => setSortNewest((value) => !value)}
            accessibilityLabel="Sort albums by date"
            variant="secondary"
            style={styles.sortButton}
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : error ? (
          <ThemedText style={styles.error}>{error}</ThemedText>
        ) : (
          <FlatList
            data={filteredAlbums}
            keyExtractor={(item) => item.albumId}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.albumList}
            renderItem={({ item }) => (
              <Pressable
                style={styles.albumCard}
                onPress={() => router.push(`/home/${groupId}/albums/${item.albumId}`)}
              >
                <Card>
                  <View style={styles.albumCoverPlaceholder}>
                    <ThemedText type="subtitle">{item.title[0] ?? "A"}</ThemedText>
                  </View>
                  <ThemedText style={styles.albumTitle}>{item.title}</ThemedText>
                  <ThemedText style={styles.albumMeta}>{item.photoCount} photos</ThemedText>
                </Card>
              </Pressable>
            )}
            ListEmptyComponent={() => (
              <Card style={styles.emptyCard}>
                <ThemedText type="subtitle">No albums yet</ThemedText>
                <ThemedText style={styles.emptyText}>
                  Create an album for the group to share photos.
                </ThemedText>
              </Card>
            )}
          />
        )}

        <Button
          title="Create an album"
          onPress={() => setCreateModalOpen(true)}
          accessibilityLabel="Create a new album"
          style={styles.createButton}
        />
      </ScrollView>

      <Modal visible={createModalOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <Card style={styles.modalCard}>
            <ThemedText type="title" style={styles.modalTitle}>
              New Album
            </ThemedText>
            <Input
              value={newAlbumTitle}
              onChangeText={setNewAlbumTitle}
              placeholder="Album title"
            />
            <Button
              title={creating ? "Creating..." : "Create album"}
              onPress={handleCreateAlbum}
              accessibilityLabel="Create album"
            />
            <Pressable onPress={() => setCreateModalOpen(false)} style={styles.modalCancel}>
              <ThemedText>Cancel</ThemedText>
            </Pressable>
          </Card>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  loader: {
    marginTop: 24,
  },
  error: {
    color: "#dc2626",
    marginTop: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  navButton: {
    padding: 12,
  },
  groupCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    marginHorizontal: 8,
    backgroundColor: "#f8fafc",
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  groupInfo: {
    flex: 1,
  },
  membersText: {
    marginTop: 6,
    color: "#6b7280",
  },
  membersCard: {
    marginBottom: 16,
    padding: 16,
  },
  tabsRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#e2e8f0",
    marginRight: 8,
  },
  activeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#0a7ea4",
    marginRight: 8,
  },
  memberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  roleText: {
    color: "#5b21b6",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginRight: 10,
  },
  sortButton: {
    minWidth: 100,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  albumList: {
    paddingBottom: 16,
  },
  albumCard: {
    flex: 1,
    marginBottom: 16,
    marginRight: 8,
  },
  albumCoverPlaceholder: {
    height: 110,
    borderRadius: 16,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  albumTitle: {
    marginBottom: 6,
    fontWeight: "700",
  },
  albumMeta: {
    color: "#6b7280",
  },
  emptyCard: {
    marginBottom: 16,
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    marginTop: 10,
    color: "#6b7280",
    textAlign: "center",
  },
  createButton: {
    marginTop: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    padding: 20,
    borderRadius: 18,
  },
  modalTitle: {
    marginBottom: 16,
  },
  modalCancel: {
    marginTop: 12,
    alignItems: "center",
  },
});
