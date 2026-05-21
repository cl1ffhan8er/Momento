import { useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

import { Button } from "@/components/Button";
import GroupCard from "@/components/ui/group-card";

import { useCurrentUser } from "@/src/hooks/useCurrentUser";
import { useGroups } from "@/src/hooks/useGroups";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GroupsScreen() {
  const router = useRouter();

  const { user, loading: authLoading } = useCurrentUser();

  const { groups, loading, error } = useGroups(user?.uid ?? null);

  const isLoading = authLoading || loading;

  return (
    <SafeAreaView
      className="flex-1 bg-background px-5"
      edges={["top", "left", "right"]}
    >
      <View className="mb-6 items-center">
        <Text className="font-koulen text-5xl leading-[72px] tracking-widest text-primary uppercase">
          YOUR GROUPS
        </Text>
        <View className="mt-3 h-px w-full bg-primary" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: 140,
        }}
      >
        {isLoading ? (
          <ActivityIndicator />
        ) : error ? (
          <Text className="text-textPrimary">{error}</Text>
        ) : groups.length === 0 ? (
          <View className="rounded-3xl bg-card p-6 shadow-lg">
            <Text className="text-lg font-bold text-textPrimary">
              No groups yet
            </Text>

            <Text className="mt-2 text-textMuted">
              Create your first group or join one.
            </Text>
          </View>
        ) : (
          groups.map((group) => (
            <GroupCard
              key={group.groupId}
              name={group.name}
              image={group.coverPhotoURL ?? undefined}
              memberCount={group.memberCount}
              onPress={() => router.push(`/home/${group.groupId}`)}
            />
          ))
        )}
      </ScrollView>

      {/* Floating Buttons */}
      <View className="pb-4 pt-2">
        <View className="h-px w-full bg-primary mb-4" />
        <Button
          title="Create a Group"
          style={{ width: "100%" }}
          onPress={() => router.push("/home/create-group")}
        />

        <View className="h-3" />

        <Button
          title="Join a Group"
          variant="accent"
          style={{ width: "100%" }}
          onPress={() => router.push("/home/join-group")}
        />
      </View>
    </SafeAreaView>
  );
}
