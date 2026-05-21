import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/src/hooks/use-color-scheme";
import { getAuthInstance } from "@/src/lib/auth";
import { AuthService } from "@/src/services/firebase/auth.service";
import { router } from "expo-router";
import { Flower, LogOut } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

const authService = new AuthService();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const unsubscribe = getAuthInstance().onAuthStateChanged((user) => {
      if (!user) return;
      authService.getUserProfile(user.uid).then((profile) => {
        if (profile?.username) setUsername(profile.username);
      });
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await getAuthInstance().signOut();
    router.replace("/(auth)/login");
  };

  return (
    <View style={{ flex: 1 }}>
      <View className="flex-row items-center justify-between px-8 pt-14 pb-3 bg-primary">
        <View className="flex-row items-center">
          <Flower size={24} strokeWidth={2.2} color="#fff" />
          <Text className="font-koulen ml-3 text-2xl font-bold text-white">
            Momento
          </Text>
        </View>

        <View className="flex-row items-center gap-3">
          {username ? (
            <Text className="text-white text-sm font-koulen">{username}</Text>
          ) : null}
          <Pressable onPress={handleLogout}>
            <LogOut size={20} color="#fff" strokeWidth={2} />
          </Pressable>
        </View>
      </View>

      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: false,
          tabBarShowLabel: false,
          tabBarButton: HapticTab,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="person.3.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="person.fill" color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
