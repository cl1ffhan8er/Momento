import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/src/hooks/use-color-scheme";
import { AuthService } from "@/src/services/firebase/auth.service";
import { useEffect, useState } from "react";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<any>(undefined);

  useEffect(() => {
    const authService = new AuthService();
    const unsubscribe = authService.listenToAuthChanges((u: any) => {
      setUser(u);
      setReady(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (user) {
      router.replace("/(tabs)/home");
    } else {
      router.replace("/(auth)/login");
    }
  }, [ready, user]);

  if (!ready)
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/signup" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
