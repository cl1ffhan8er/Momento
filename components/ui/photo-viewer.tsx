import { Colors } from "@/constants/theme";
import { updatePhoto } from "@/src/services/firebase/photos";
import React, { useState } from "react";
import { Image, Modal, Pressable, Text, TextInput, View } from "react-native";

export default function PhotoViewer({
  visible,
  photos,
  startIndex,
  onClose,
  onRefresh,
}: {
  visible: boolean;
  photos: { photoId: string; storageUrl: string | null; caption?: string | null }[];
  startIndex: number;
  onClose: () => void;
  onRefresh?: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(photos[startIndex]?.caption ?? "");

  React.useEffect(() => {
    setIndex(startIndex);
    setCaption(photos[startIndex]?.caption ?? "");
    setEditing(false);
  }, [startIndex, photos, visible]);

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(photos.length - 1, i + 1));

  const saveCaption = async () => {
    const photo = photos[index];
    if (!photo) return;
    try {
      await updatePhoto(photo.photoId, { caption: caption || null });
      setEditing(false);
      if (onRefresh) await onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const photo = photos[index];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-surface/90 px-4">
        <View className="w-full h-full items-center justify-center">
          <Image source={{ uri: photo?.storageUrl ?? undefined }} className="w-full h-3/4" resizeMode="contain" />

          <View className="absolute left-4 top-1/2 -translate-y-6">
            <Pressable onPress={prev} className="rounded-full bg-surface/80 p-3">
              <Text className="text-textPrimary text-2xl">‹</Text>
            </Pressable>
          </View>

          <View className="absolute right-4 top-1/2 -translate-y-6">
            <Pressable onPress={next} className="rounded-full bg-surface/80 p-3">
              <Text className="text-textPrimary text-2xl">›</Text>
            </Pressable>
          </View>

          <View className="absolute bottom-8 left-4 right-4">
            {editing ? (
              <View className="rounded-2xl bg-card p-3 shadow-lg">
                <TextInput
                  value={caption}
                  onChangeText={setCaption}
                  placeholder="Enter caption"
                  placeholderTextColor={Colors.light.textMuted}
                  className="text-textPrimary"
                />
                <View className="mt-2 flex-row justify-end">
                  <Pressable onPress={() => setEditing(false)} className="mr-3">
                    <Text className="text-textMuted">Cancel</Text>
                  </Pressable>
                  <Pressable onPress={saveCaption} className="bg-primary rounded-2xl px-4 py-2">
                    <Text className="font-bold text-white">Save</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View className="rounded-2xl bg-surface/90 p-3 flex-row items-center justify-between shadow-lg">
                <Text className="text-textPrimary">{photo?.caption ?? ""}</Text>
                <Pressable onPress={() => setEditing(true)} className="ml-3">
                  <Text className="text-textMuted">Edit</Text>
                </Pressable>
              </View>
            )}

            <Pressable onPress={onClose} className="mt-4 items-center">
              <Text className="text-textMuted">Close</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
