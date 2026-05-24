import { useRouter } from "expo-router";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCurrentUser } from "@/src/hooks/useCurrentUser";
import { useProfile } from "@/src/hooks/useProfile";
import { getAuthInstance } from "@/src/lib/auth";

export default function ProfileScreen() {
  const router = useRouter();

  const { user, loading: authLoading } = useCurrentUser();
  const { profile, loading } = useProfile(user?.uid ?? null);

  const isLoading = authLoading || loading;

  const handleLogout = async () => {
    await getAuthInstance().signOut();
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background px-5"
      edges={["top", "left", "right"]}
    >
      <View className="mb-6 items-center">
        <Text className="font-koulen text-5xl leading-[72px] tracking-widest text-primary uppercase">
          PROFILE
        </Text>
        <View className="mt-3 h-px w-full bg-primary" />
      </View>

      {isLoading ? (
        <ActivityIndicator />
      ) : !profile ? (
        <View className="rounded-3xl bg-card p-6 shadow-lg">
          <Text className="text-lg font-bold text-textPrimary">
            Unable to load profile
          </Text>
        </View>
      ) : (
        <View className="flex-1">
          <View className="mb-6 items-center">
            <View className="h-28 w-28 overflow-hidden rounded-full bg-surface">
              {profile.avatarURL ? (
                <Image
                  source={{ uri: profile.avatarURL }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="h-full w-full items-center justify-center bg-card">
                  <Text className="text-4xl font-bold text-textPrimary">
                    {profile.username?.[0]?.toUpperCase() ?? "U"}
                  </Text>
                </View>
              )}
            </View>

            <Text className="mt-4 font-koulen text-2xl text-textPrimary">
              {profile.username ?? "User"}
            </Text>

            <Text className="mt-1 text-sm text-textMuted">
              {profile.email}
            </Text>

            {profile.bio ? (
              <Text className="mt-3 text-center text-base text-textMuted">
                {profile.bio}
              </Text>
            ) : null}
          </View>

          <View className="rounded-3xl bg-card p-6 shadow-lg">
            <Pressable
              onPress={() => router.push("/profile/edit-profile")}
              className="flex-row items-center justify-between py-4"
            >
              <View>
                <Text className="text-base font-semibold text-textPrimary">
                  Edit Profile
                </Text>
                <Text className="mt-1 text-sm text-textMuted">
                  Change your photo, name, and bio
                </Text>
              </View>
              <Text className="text-2xl text-textMuted">›</Text>
            </Pressable>

            <View className="h-px w-full bg-surface" />

            <View className="py-4">
              <Text className="text-base font-semibold text-textPrimary">
                Account
              </Text>
              <Text className="mt-1 text-sm text-textMuted">
                Member since{" "}
                {new Date(profile.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View className="mt-6">
            <Pressable
              onPress={handleLogout}
              className="items-center rounded-3xl border border-red-400 bg-card py-4 shadow-lg"
            >
              <Text className="text-base font-semibold text-red-500">
                Log Out
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
