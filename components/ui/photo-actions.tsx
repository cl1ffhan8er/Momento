import React from "react";
import { Pressable, Text, View } from "react-native";

export default function PhotoActions({
  selectionMode,
  selectedCount,
  onAdd,
  onToggleSelect,
  onDelete,
}: {
  selectionMode: boolean;
  selectedCount: number;
  onAdd: () => void;
  onToggleSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <View className="mt-4 flex-row items-center justify-between">
      <Pressable onPress={onAdd} className="rounded-2xl bg-white px-4 py-3 mr-2 flex-1 items-center">
        <Text className="font-bold text-black">Add</Text>
      </Pressable>

      <Pressable
        onPress={onToggleSelect}
        className="rounded-2xl bg-neutral-900 px-4 py-3 mr-2 flex-1 items-center border border-neutral-700"
      >
        <Text className="font-semibold text-white">{selectionMode ? `Download` : `Select`}</Text>
      </Pressable>

      <Pressable
        onPress={onDelete}
        className="rounded-2xl bg-red-600 px-4 py-3 flex-1 items-center ml-2"
      >
        <Text className="font-semibold text-white">Delete</Text>
      </Pressable>
    </View>
  );
}
