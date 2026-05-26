import { getAuthInstance } from "@/src/lib/auth";
import { AuthService } from "@/src/services/firebase/auth.service";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { useEffect } from "react";

WebBrowser.maybeCompleteAuthSession();

const authService = new AuthService();

const redirectUri = AuthSession.makeRedirectUri({
  scheme: "momento",
});

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    console.log("Google request redirectUri:", request?.url);
    console.log("Google response:", JSON.stringify(response));
    console.log("Google response:", JSON.stringify(response));
    if (response?.type === "success") {
      const { id_token, access_token } = response.params;
      const credential = GoogleAuthProvider.credential(
        id_token ?? null,
        access_token,
      );
      signInWithCredential(getAuthInstance(), credential)
        .then(async (result) => {
          const { uid, displayName, email } = result.user;
          const existing = await authService.getUserProfile(uid);
          if (!existing) {
            const username = displayName ?? email?.split("@")[0] ?? "user";
            await authService.createUserProfile(uid, username);
          }
          await WebBrowser.coolDownAsync();
          router.replace("/(tabs)/home");
        })
        .catch((e) => alert(e.message));
    }
  }, [response]);

  return { promptAsync, request };
}
