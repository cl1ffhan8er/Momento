import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/src/hooks/use-color-scheme';

import { router } from "expo-router";
import { useEffect, useState } from "react";
import { listenToAuthChanges } from "../src/services/firebase/auth";

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = listenToAuthChanges((u: any) => {
      setUser(u);

      if (u) {
        router.replace("/home");
      } else {
        router.replace("/login");
      }
    });

    return unsubscribe;
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
