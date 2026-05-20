import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Text, View } from "react-native";
import "react-native-reanimated";
import "../global.css";

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
  const [fontsLoaded] = useFonts({
    Koulen: require("../assets/fonts/Koulen-Regular.ttf"),

    JustAnotherHand: require(
      "../assets/fonts/JustAnotherHand-Regular.ttf"
    ),
  });
  console.log(fontsLoaded);

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

    const target = user ? "/(tabs)/home" : "/(auth)/login";

    router.replace(target);
}, [ready, user]);

  if (!ready || !fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  if (Text && (Text as any).defaultProps == null) {
    (Text as any).defaultProps = {} as any;
  }
  (Text as any).defaultProps.style = [{ fontFamily: "Koulen" }, (Text as any).defaultProps.style || {}];

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
