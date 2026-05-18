import { AuthService } from "@/src/services/firebase/auth.service";
import { router } from "expo-router";
import { useState } from "react";
import { Button, TextInput, View } from "react-native";

const authService = new AuthService();

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await authService.login(email, password);
      router.replace("/(tabs)/home");
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <View>
      <TextInput placeholder="Email" onChangeText={setEmail} />
      <TextInput
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Go to Login" onPress={() => router.push("/(auth)/login")} />
    </View>
  );
}
