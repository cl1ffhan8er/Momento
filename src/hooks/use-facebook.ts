import * as Facebook from "expo-auth-session/providers/facebook";
import { signInWithFacebookToken } from "../lib/oauth";

export const useFacebookAuth = () => {
  const [request, response, promptAsync] = Facebook.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID,
    webClientId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID,
  });

  const signInWithFacebook = async () => {
    const result = await promptAsync();
    if (result.type === "success") {
      const { access_token } = result.params;
      return signInWithFacebookToken(access_token);
    }
  };

  return { signInWithFacebook, request };
};
