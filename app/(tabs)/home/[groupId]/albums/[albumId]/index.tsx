import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    View,
} from "react-native";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useCurrentUser } from "@/src/hooks/useCurrentUser";
import { getAlbum } from "@/src/services/firebase/albums";
import { batchDeletePhotos, createPhoto, getAlbumPhotos, uploadPhotoFile } from "@/src/services/firebase/photos";
import type { AlbumDoc, PhotoDoc } from "@/src/types";

export default function AlbumDetailScreen() {
  const router = useRouter();
  const { groupId, albumId } = useLocalSearchParams<{ groupId: string; albumId: string }>();
  const { user } = useCurrentUser();
  const [album, setAlbum] = useState<AlbumDoc | null>(null);
  const [photos, setPhotos] = useState<PhotoDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [photoTitle, setPhotoTitle] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  const loadAlbumData = async () => {
    if (!groupId || !albumId) {
      setError("Invalid album");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [albumResult, photoResult] = await Promise.all([
        getAlbum(albumId),
        getAlbumPhotos(albumId),
      ]);

      if (!albumResult) {
        setError("Album not found");
        return;
      }

      setAlbum(albumResult);
      setPhotos(photoResult);
    } catch (e: any) {
      setError(e.message ?? "Unable to load album");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAlbumData();
  }, [groupId, albumId]);

  const selectedCount = selectedPhotoIds.length;
  const isEmpty = !loading && photos.length === 0;

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotoIds((current) =>
      current.includes(photoId)
        ? current.filter((id) => id !== photoId)
        : [...current, photoId]
    );
  };

  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Allow photo access to upload images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setSelectedImageUri(result.assets[0].uri);
    }
  };

  const handleUploadPhoto = async () => {
    if (!selectedImageUri || !user || !groupId || !albumId) {
      return;
    }

    if (photos.length >= 50) {
      Alert.alert("Photo limit reached", "This album already has 50 photos.");
      return;
    }

    try {
      setUploading(true);
      const downloadUrl = await uploadPhotoFile(selectedImageUri, albumId);
      await createPhoto(albumId, groupId, user.uid, downloadUrl, photoTitle || undefined, photoCaption || undefined);
      setSelectedImageUri(null);
      setPhotoTitle("");
      setPhotoCaption("");
      setUploadModalOpen(false);
      await loadAlbumData();
    } catch (e: any) {
      Alert.alert("Upload failed", e.message ?? "Could not upload the photo.");
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadSelected = () => {
    if (!selectionMode) {
      setSelectionMode(true);
      return;
    }

    if (selectedCount === 0) {
      Alert.alert("Select photos", "Tap photos to select them before downloading.");
      return;
    }

    Alert.alert("Download photos", `Preparing to download ${selectedCount} photo(s).`);
  };

  const handleDeleteSelected = () => {
    if (!selectionMode) {
      setSelectionMode(true);
      return;
    }

    if (selectedCount === 0) {
      Alert.alert("Select photos", "Tap photos to select them before deleting.");
      return;
    }

    Alert.alert(
      "Delete photos",
      `Delete ${selectedCount} selected photo(s)?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await batchDeletePhotos(selectedPhotoIds);
              setSelectedPhotoIds([]);
              setSelectionMode(false);
              await loadAlbumData();
            } catch (e: any) {
              Alert.alert("Delete failed", e.message ?? "Could not delete photos.");
            }
          },
        },
      ]
    );
  };

  const header = (
    <View>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}>
          <ThemedText>Back</ThemedText>
        </Pressable>
        <View style={styles.titleColumn}>
          <ThemedText type="title">{album?.title ?? "Album"}</ThemedText>
          <ThemedText style={styles.subtitle}>
            Created by {album?.createdBy ?? "unknown"}
          </ThemedText>
        </View>
      </View>

      {!isEmpty && (
        <View style={styles.actionRow}>
          <Button title="Add" onPress={() => setUploadModalOpen(true)} accessibilityLabel="Upload photos" />
          <Button
            title={selectionMode ? "Download" : "Select"}
            onPress={handleDownloadSelected}
            accessibilityLabel="Download selected photos"
            variant={selectionMode ? "primary" : "secondary"}
            style={styles.smallButton}
          />
          <Button
            title="Delete"
            onPress={handleDeleteSelected}
            accessibilityLabel="Delete selected photos"
            variant={selectionMode ? "secondary" : "secondary"}
            style={styles.smallButton}
          />
        </View>
      )}

      {selectionMode && selectedCount > 0 && (
        <ThemedText style={styles.selectedCount}>{selectedCount} selected</ThemedText>
      )}
    </View>
  );

  const renderPhoto = ({ item }: { item: PhotoDoc }) => {
    const selected = selectedPhotoIds.includes(item.photoId);
    return (
      <Pressable
        style={styles.photoCard}
        onPress={() => {
          if (selectionMode) {
            togglePhotoSelection(item.photoId);
          }
        }}
        onLongPress={() => setSelectionMode(true)}
      >
        <Card style={styles.photoInnerCard}>
          <View style={styles.photoPreview}>
            {item.storageUrl ? (
              <Image source={{ uri: item.storageUrl }} style={styles.photoImage} />
            ) : (
              <ThemedText>{item.title?.[0] ?? "P"}</ThemedText>
            )}
          </View>
          <ThemedText style={styles.photoTitle}>{item.title || "Untitled"}</ThemedText>
          <ThemedText style={styles.photoMeta}>{item.caption ?? "No caption"}</ThemedText>
          {selectionMode && (
            <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
              {selected && <ThemedText style={styles.checkboxText}>✓</ThemedText>}
            </View>
          )}
        </Card>
      </Pressable>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      ) : isEmpty ? (
        <View style={styles.emptyStateContainer}>
          {header}
          <Card style={styles.emptyCard}>
            <ThemedText type="subtitle">No photos yet</ThemedText>
            <ThemedText style={styles.emptyText}>Upload photos to share in this album.</ThemedText>
            <Button title="Upload Photos" onPress={() => setUploadModalOpen(true)} accessibilityLabel="Upload photos" />
          </Card>
        </View>
      ) : (
        <FlatList
          ListHeaderComponent={header}
          ListHeaderComponentStyle={styles.listHeader}
          data={photos}
          keyExtractor={(item) => item.photoId}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.photoList}
          renderItem={renderPhoto}
        />
      )}

      <Modal visible={uploadModalOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <Card style={styles.modalCard}>
            <ThemedText type="title" style={styles.modalTitle}>
              Upload Photo
            </ThemedText>
            <Button title="Choose Photo" onPress={handlePickPhoto} accessibilityLabel="Choose photo" />
            {selectedImageUri ? (
              <Image source={{ uri: selectedImageUri }} style={styles.uploadPreview} />
            ) : null}
            <Input value={photoTitle} onChangeText={setPhotoTitle} placeholder="Title" />
            <Input value={photoCaption} onChangeText={setPhotoCaption} placeholder="Caption" />
            <Button
              title={uploading ? "Uploading..." : "Upload"}
              onPress={handleUploadPhoto}
              accessibilityLabel="Upload photo"
            />
            <Pressable onPress={() => setUploadModalOpen(false)} style={styles.modalCancel}>
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#dc2626",
  },
  listHeader: {
    padding: 20,
    paddingBottom: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconButton: {
    padding: 12,
  },
  titleColumn: {
    flex: 1,
    marginLeft: 8,
  },
  subtitle: {
    marginTop: 8,
    color: "#6b7280",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  smallButton: {
    minWidth: 90,
  },
  selectedCount: {
    color: "#6b7280",
    marginBottom: 12,
  },
  photoList: {
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  photoCard: {
    flex: 1,
    marginBottom: 16,
    marginRight: 8,
  },
  photoInnerCard: {
    padding: 12,
  },
  photoPreview: {
    height: 120,
    borderRadius: 16,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    overflow: "hidden",
  },
  photoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  photoTitle: {
    marginBottom: 4,
    fontWeight: "700",
  },
  photoMeta: {
    color: "#6b7280",
  },
  checkbox: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#94a3b8",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  checkboxSelected: {
    backgroundColor: "#0a7ea4",
    borderColor: "#0a7ea4",
  },
  checkboxText: {
    color: "#fff",
    fontWeight: "700",
  },
  emptyStateContainer: {
    padding: 20,
  },
  emptyCard: {
    marginTop: 24,
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    marginTop: 10,
    color: "#6b7280",
    textAlign: "center",
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
  uploadPreview: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    marginVertical: 14,
  },
  modalCancel: {
    marginTop: 12,
    alignItems: "center",
  },
});
