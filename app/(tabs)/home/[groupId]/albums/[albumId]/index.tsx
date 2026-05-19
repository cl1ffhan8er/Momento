import { ThemedText } from "@/components/themed-text";
import PhotoActions from "@/components/ui/photo-actions";
import PhotoViewer from "@/components/ui/photo-viewer";
import { useCurrentUser } from "@/src/hooks/useCurrentUser";
import { getAlbum } from "@/src/services/firebase/albums";
import { batchDeletePhotos, createPhoto, getAlbumPhotos, uploadPhotoFile } from "@/src/services/firebase/photos";
import type { AlbumDoc, PhotoDoc } from "@/src/types";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, Modal, Pressable, Text, View } from "react-native";

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
  const [selectedImageUris, setSelectedImageUris] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const loadAlbumData = async () => {
    if (!groupId || !albumId) {
      setError("Invalid album");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [albumResult, photoResult] = await Promise.all([getAlbum(albumId), getAlbumPhotos(albumId)]);
      if (!albumResult) {
        setError("Album not found");
        setLoading(false);
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
    setSelectedPhotoIds((current) => (current.includes(photoId) ? current.filter((id) => id !== photoId) : [...current, photoId]));
  };

  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Allow photo access to upload images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7, allowsMultipleSelection: true });
    if (!result.canceled && result.assets.length > 0) setSelectedImageUris(result.assets.map((a) => a.uri));
  };

  const handleUploadPhotos = async () => {
    if (selectedImageUris.length === 0 || !user || !groupId || !albumId) return;
    if (photos.length + selectedImageUris.length > 500) {
      Alert.alert("Photo limit reached", "This album would exceed the photo limit.");
      return;
    }

    try {
      setUploading(true);
      for (const uri of selectedImageUris) {
        const downloadUrl = await uploadPhotoFile(uri, albumId);
        await createPhoto(albumId, groupId, user.uid, downloadUrl);
      }
      setSelectedImageUris([]);
      setUploadModalOpen(false);
      await loadAlbumData();
    } catch (e: any) {
      Alert.alert("Upload failed", e.message ?? "Could not upload photos.");
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadSelected = () => {
    if (!selectionMode) {
      setSelectionMode(true);
      return;
    }
    if (selectedCount === 0) return Alert.alert("Select photos", "Tap photos to select them before downloading.");
    Alert.alert("Download photos", `Preparing to download ${selectedCount} photo(s).`);
  };

  const handleDeleteSelected = () => {
    if (!selectionMode) {
      setSelectionMode(true);
      return;
    }
    if (selectedCount === 0) return Alert.alert("Select photos", "Tap photos to select them before deleting.");

    Alert.alert("Delete photos", `Delete ${selectedCount} selected photo(s)?`, [
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
    ]);
  };

  const header = (
    <View className="pb-4 px-5">

        <Pressable onPress={() => router.back()} className="p-3">
            <ThemedText>Back</ThemedText>
        </Pressable>

        <View className="mb-6 items-center">
            <Text className="text-5xl font-bold tracking-widest text-white uppercase">
                {album?.title ?? "Album"}
            </Text>
            <View className="mt-3 h-px w-full bg-neutral-700" />
        </View>

      {!isEmpty && (
        <PhotoActions selectionMode={selectionMode} selectedCount={selectedCount} onAdd={() => setUploadModalOpen(true)} onToggleSelect={handleDownloadSelected} onDelete={handleDeleteSelected} />
      )}

      {selectionMode && selectedCount > 0 && <ThemedText className="text-neutral-400 mb-3">{selectedCount} selected</ThemedText>}
    </View>
  );

  const renderPhoto = ({ item, index }: { item: PhotoDoc; index: number }) => {
    const selected = selectedPhotoIds.includes(item.photoId);
    return (
      <Pressable key={item.photoId} className="flex-1 mb-4 mr-2" onPress={() => (selectionMode ? togglePhotoSelection(item.photoId) : (setViewerIndex(index), setViewerOpen(true)))} onLongPress={() => setSelectionMode(true)}>
        <View className="bg-neutral-900 rounded-2xl p-3">
          <View className="h-40 rounded-xl overflow-hidden bg-neutral-800 mb-3 items-center justify-center">
            {item.storageUrl ? <Image source={{ uri: item.storageUrl }} className="w-full h-full" resizeMode="cover" /> : <ThemedText>P</ThemedText>}
          </View>

          <ThemedText className="font-bold mb-1">{item.title || ""}</ThemedText>
          <ThemedText className="text-neutral-400">{item.caption ?? ""}</ThemedText>

          {selectionMode && (
            <View className={`absolute top-3 right-3 w-6 h-6 rounded-full items-center justify-center ${selected ? "bg-teal-600" : "bg-white/90"}`}>
              {selected && <ThemedText className="text-white">✓</ThemedText>}
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-black">
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center">
          <ThemedText className="text-red-500">{error}</ThemedText>
        </View>
      ) : isEmpty ? (
        <View className="p-5">
          {header}
          <View className="bg-neutral-900 rounded-3xl p-6 items-center">
            <ThemedText type="subtitle">No photos yet</ThemedText>
            <ThemedText className="text-neutral-400 mt-2 text-center">Upload photos to share in this album.</ThemedText>
            <Pressable onPress={() => setUploadModalOpen(true)} className="mt-4 rounded-2xl bg-white px-4 py-3">
              <ThemedText className="font-bold text-black">Upload Photos</ThemedText>
            </Pressable>
          </View>
        </View>
      ) : (
        <FlatList<PhotoDoc>
          ListHeaderComponent={header}
          ListHeaderComponentStyle={{ padding: 20, paddingBottom: 0 }}
          data={photos}
          keyExtractor={(item: PhotoDoc) => item.photoId}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{ paddingTop: 8, paddingHorizontal: 20, paddingBottom: 40 }}
          renderItem={renderPhoto}
        />
      )}

      <Modal visible={uploadModalOpen} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-center p-5">
          <View className="bg-neutral-900 rounded-3xl p-6">
            <ThemedText type="title" className="mb-4">
              Upload Photos
            </ThemedText>

            <Pressable onPress={handlePickPhoto} className="rounded-2xl bg-white px-4 py-3 mb-4 items-center">
              <ThemedText className="font-bold text-black">Choose Photos</ThemedText>
            </Pressable>

            {selectedImageUris.length > 0 ? (
              <View className="mb-4">
                {selectedImageUris.map((uri) => (
                  <Image key={uri} source={{ uri }} className="w-full h-40 rounded-xl mb-3" resizeMode="cover" />
                ))}
              </View>
            ) : null}

            <Pressable onPress={handleUploadPhotos} className="rounded-2xl bg-white px-4 py-3 items-center">
              <ThemedText className="font-bold text-black">{uploading ? "Uploading..." : "Upload"}</ThemedText>
            </Pressable>

            <Pressable onPress={() => setUploadModalOpen(false)} className="mt-4 items-center">
              <ThemedText className="text-neutral-400">Cancel</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>

      <PhotoViewer visible={viewerOpen} photos={photos.map((p) => ({ photoId: p.photoId, storageUrl: p.storageUrl, caption: p.caption }))} startIndex={viewerIndex} onClose={() => setViewerOpen(false)} onRefresh={loadAlbumData} />
    </View>
  );
}
