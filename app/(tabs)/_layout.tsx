import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/src/hooks/use-color-scheme";
import { Flower } from "lucide-react-native";
import { Text, View } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <View style={{ flex: 1 }}>
      <View className="flex-row items-center px-8 pt-14 bg-primary">
        <Flower size={24} strokeWidth={2.2} color="#fff" />

        <Text className="font-koulen ml-3 text-2xl font-bold text-white">
          Momento
        </Text>
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