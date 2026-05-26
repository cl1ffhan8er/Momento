import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function OAuthRedirect() {
  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator />
    </View>
  );
}
