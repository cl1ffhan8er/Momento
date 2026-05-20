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
      <Pressable onPress={onAdd} className="rounded-2xl bg-primary px-4 py-3 mr-2 flex-1 items-center">
        <Text className="font-bold text-white">Add</Text>
      </Pressable>

      <Pressable
        onPress={onToggleSelect}
        className="rounded-2xl bg-surface px-4 py-3 mr-2 flex-1 items-center border border-secondary"
      >
        <Text className="font-semibold text-textPrimary">{selectionMode ? `Download` : `Select`}</Text>
      </Pressable>

      <Pressable
        onPress={onDelete}
        className="rounded-2xl bg-secondary px-4 py-3 flex-1 items-center ml-2"
      >
        <Text className="font-semibold text-white">Delete</Text>
      </Pressable>
    </View>
  );
}
