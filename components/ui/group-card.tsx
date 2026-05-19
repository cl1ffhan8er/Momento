import { Image, Pressable, Text, View } from "react-native";

type Props = {
  name: string;
  memberCount: number;
  image?: string;
  onPress?: () => void;
};

export default function GroupCard({
  name,
  memberCount,
  image,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-4 overflow-hidden rounded-3xl bg-neutral-900"
    >
      <Image
        source={{
          uri:
            image ||
            "https://placehold.co/600x400/png",
        }}
        className="h-44 w-full"
      />

      <View className="p-4">
        <Text className="text-lg font-bold text-white">
          {name}
        </Text>

        <Text className="mt-1 text-sm text-neutral-400">
          {memberCount} members
        </Text>
      </View>
    </Pressable>
  );
}