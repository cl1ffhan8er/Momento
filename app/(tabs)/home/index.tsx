import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
} from "react-native";

import { Button } from "@/components/Button";
import GroupCard from "@/components/ui/group-card";

import { useCurrentUser } from "@/src/hooks/useCurrentUser";
import { useGroups } from "@/src/hooks/useGroups";

export default function GroupsScreen() {
  const router = useRouter();

  const { user, loading: authLoading } = useCurrentUser();

  const { groups, loading, error } = useGroups(
    user?.uid ?? null
  );

  const isLoading = authLoading || loading;

  return (
    <View className="flex-1 bg-black px-5 pt-16">
      <View className="mb-6 items-center">
        <Text className="text-5xl font-bold tracking-widest text-white uppercase">
          YOUR GROUP
        </Text>
        <View className="mt-3 h-px w-full bg-neutral-700" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 140,
        }}
      >
        {isLoading ? (
          <ActivityIndicator />
        ) : error ? (
          <Text className="text-red-500">
            {error}
          </Text>
        ) : groups.length === 0 ? (
          <View className="rounded-3xl bg-neutral-900 p-6">
            <Text className="text-lg font-bold text-white">
              No groups yet
            </Text>

            <Text className="mt-2 text-neutral-400">
              Create your first group or join one.
            </Text>
          </View>
        ) : (
          groups.map((group) => (
            <GroupCard
              key={group.groupId}
              name={group.name}
              memberCount={group.memberCount}
              onPress={() =>
                router.push(`/home/${group.groupId}`)
              }
            />
          ))
        )}
      </ScrollView>

      {/* Floating Buttons */}
      <View className="absolute bottom-8 left-5 right-5 gap-3">
        <Button
          title="Create a Group"
          onPress={() =>
            router.push("/home/create-group")
          }
        />

        <Button
          title="Join a Group"
          variant="secondary"
          onPress={() =>
            router.push("/home/join-group")
          }
        />
      </View>
    </View>
  );
}