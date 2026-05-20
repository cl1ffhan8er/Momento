import { ThemedText } from "@/components/themed-text";
import PhotoViewer from "@/components/ui/photo-viewer";
import { useCurrentUser } from "@/src/hooks/useCurrentUser";
import { getAlbum } from "@/src/services/firebase/albums";
import { batchDeletePhotos, createPhoto, getAlbumPhotos, uploadPhotoFile } from "@/src/services/firebase/photos";
import { getUser } from "@/src/services/firebase/users";
import type { AlbumDoc, PhotoDoc } from "@/src/types";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Download, Plus, Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AlbumDetailScreen() {
  const router = useRouter();
  const { groupId, albumId } = useLocalSearchParams<{ groupId: string; albumId: string }>();
  const { user } = useCurrentUser();

  const [album, setAlbum] = useState<AlbumDoc | null>(null);
  const [albumCreatorName, setAlbumCreatorName] = useState<string>("Anonymous");
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

      const creator = await getUser(albumResult.createdBy);
      setAlbumCreatorName(creator?.username ?? "Anonymous");
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
    <View className="pb-4">

      <View className="flex-row items-start mb-4">
        <Pressable
          onPress={() => router.back()}
          className="mr-4 pt-2"
        >
          <Text className="text-primary text-5xl">‹</Text>
        </Pressable>

        <View className="flex-1">
          <Text className="text-4xl font-koulen font-bold tracking-widest leading-[72px] text-textPrimary uppercase">
            {album?.title ?? "Album"}
          </Text>

          <ThemedText className="text-primary text-sm">
            Created by {albumCreatorName}
          </ThemedText>

          <View className="h-px w-full bg-primary" />
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center space-x-2">
          <Pressable onPress={() => setUploadModalOpen(true)} className="px-1 py-2">
            <Text className="text-sm text-textPrimary"><Plus/></Text>
          </Pressable>
          <Pressable onPress={handleDownloadSelected} className="px-1 py-2">
            <Text className="text-sm text-textPrimary"><Download/></Text>
          </Pressable>
        </View>
        <Pressable onPress={handleDeleteSelected} className="px-1 py-2">
          <Text className="text-sm text-textPrimary"><Trash2/></Text>
        </Pressable>
      </View>

      {selectionMode && selectedCount > 0 && (
        <ThemedText className="text-textMuted mb-3">{selectedCount} selected</ThemedText>
      )}
    </View>
  );

  const renderPhoto = ({ item, index }: { item: PhotoDoc; index: number }) => {
    const selected = selectedPhotoIds.includes(item.photoId);
    return (
      <Pressable key={item.photoId} className="w-[48%] mb-4" onPress={() => (selectionMode ? togglePhotoSelection(item.photoId) : (setViewerIndex(index), setViewerOpen(true)))} onLongPress={() => setSelectionMode(true)}>
        <View className="relative bg-card rounded-2xl p-3 shadow-sm">
          <View className="h-40 rounded-xl overflow-hidden bg-surface mb-3 items-center justify-center">
            {item.storageUrl ? <Image source={{ uri: item.storageUrl }} className="w-full h-full" resizeMode="cover" /> : <ThemedText>P</ThemedText>}
          </View>

          <ThemedText className="font-bold mb-1 text-textPrimary">{item.title || ""}</ThemedText>
          <ThemedText className="text-textMuted">{item.caption ?? ""}</ThemedText>

          {selectionMode && (
            <View className={`absolute top-3 right-3 w-6 h-6 rounded-full items-center justify-center ${selected ? "bg-primary" : "bg-surface/90"}`}>
              {selected && <ThemedText className="text-white">✓</ThemedText>}
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center">
          <ThemedText className="text-textPrimary">{error}</ThemedText>
        </View>
      ) : isEmpty ? (
        <View className="p-5">
          {header}
          <View className="bg-card rounded-3xl p-6 items-center shadow-lg">
            <ThemedText type="subtitle">No photos yet</ThemedText>
            <ThemedText className="text-textMuted mt-2 text-center">Upload photos to share in this album.</ThemedText>
            <Pressable onPress={() => setUploadModalOpen(true)} className="mt-4 rounded-2xl bg-primary px-4 py-3">
              <ThemedText className="font-bold text-white">Upload Photos</ThemedText>
            </Pressable>
          </View>
        </View>
      ) : (
        <View className="flex-1 px-5">
          {header}
          <View className="flex-1 rounded-3xl bg-card p-0 shadow-lg">
            <ScrollView
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
              className="flex-1"
            >
              <View className="flex-row flex-wrap justify-between">
                {photos.map((photo, index) => renderPhoto({ item: photo, index }))}
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {selectionMode && (
        <Pressable onPress={() => { setSelectionMode(false); setSelectedPhotoIds([]); }} className="absolute right-5 bottom-8 rounded-full bg-surface/80 p-4 shadow-lg">
          <Text className="text-textPrimary text-base">✕</Text>
        </Pressable>
      )}

      <Modal visible={uploadModalOpen} animationType="slide" transparent>
        <View className="flex-1 bg-surface/90 justify-center p-5">
          <View className="bg-card rounded-3xl p-6 shadow-xl">
            <ThemedText type="title" className="mb-4">
              Upload Photos
            </ThemedText>

            <Pressable onPress={handlePickPhoto} className="rounded-2xl bg-primary px-4 py-3 mb-4 items-center">
              <ThemedText className="font-bold text-white">Choose Photos</ThemedText>
            </Pressable>

            {selectedImageUris.length > 0 ? (
              <View className="mb-4">
                {selectedImageUris.map((uri) => (
                  <Image key={uri} source={{ uri }} className="w-full h-40 rounded-xl mb-3" resizeMode="cover" />
                ))}
              </View>
            ) : null}

            <Pressable onPress={handleUploadPhotos} className="rounded-2xl bg-primary px-4 py-3 items-center">
              <ThemedText className="font-bold text-white">{uploading ? "Uploading..." : "Upload"}</ThemedText>
            </Pressable>

            <Pressable onPress={() => setUploadModalOpen(false)} className="mt-4 items-center">
              <ThemedText className="text-textMuted">Cancel</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>

      <PhotoViewer visible={viewerOpen} photos={photos.map((p) => ({ photoId: p.photoId, storageUrl: p.storageUrl, caption: p.caption }))} startIndex={viewerIndex} onClose={() => setViewerOpen(false)} onRefresh={loadAlbumData} />
    </SafeAreaView>
  );  
}
