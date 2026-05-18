import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/src/hooks/use-color-scheme";
import { Text, View } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          height: 60,
          justifyContent: "center",
          paddingHorizontal: 16,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold", color:"white" }}>
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