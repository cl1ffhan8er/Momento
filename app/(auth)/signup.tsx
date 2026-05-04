import { router } from "expo-router";
import { useState } from "react";
import { Button, TextInput, View } from "react-native";
import { login } from "../../src/services/firebase/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await login(email, password);
      router.replace("/home");
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <View>
      <TextInput placeholder="Email" onChangeText={setEmail} />
      <TextInput placeholder="Password" secureTextEntry onChangeText={setPassword} />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Go to Signup" onPress={() => router.push("/signup")} />
    </View>
  );
}