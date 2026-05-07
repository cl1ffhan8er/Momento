import { useFacebookAuth } from "@/src/hooks/use-facebook";
import { AuthService } from "@/src/services/firebase/auth.service";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const authService = new AuthService();

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signInWithFacebook } = useFacebookAuth();

  const handleLogin = async () => {
    try {
      authService.login(email, password);
      router.replace("/home");
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleFacebook = async () => {
    try {
      await signInWithFacebook();
      router.replace("/home");
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <View className="flex-1 bg-[#dce4ec] items-center justify-center px-7">
      <View className="w-full bg-white/70 rounded-2xl p-6">
        <TextInput
          className="bg-white/80 border border-[#3a3f6e22] rounded-xl px-4 py-3 text-sm text-[#3a3f6e] mb-3"
          placeholder="Email"
          placeholderTextColor="#b0bad0"
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
        />
        <TextInput
          className="bg-white/80 border border-[#3a3f6e22] rounded-xl px-4 py-3 text-sm text-[#3a3f6e] mb-4"
          placeholder="Password"
          placeholderTextColor="#b0bad0"
          secureTextEntry
          onChangeText={setPassword}
        />

        <Pressable
          className="bg-[#3a3f6e] rounded-xl py-3 items-center mb-4"
          onPress={handleLogin}
        >
          <Text className="text-white text-sm font-medium">Login</Text>
        </Pressable>

        <View className="flex-row items-center mb-4">
          <View className="flex-1 h-px bg-[#3a3f6e22]" />
          <Text className="text-xs text-[#b0bad0] mx-3">or continue with</Text>
          <View className="flex-1 h-px bg-[#3a3f6e22]" />
        </View>

        <Pressable
          className="flex-row items-center justify-center border border-[#3a3f6e22] rounded-xl py-3 bg-white gap-2"
          onPress={handleFacebook}
        >
          <View className="w-6 h-6 rounded-full bg-[#1877f2] items-center justify-center">
            <Text className="text-white font-bold text-sm leading-none">f</Text>
          </View>
          <Text className="text-sm text-[#3a3f6e]">Continue with Facebook</Text>
        </Pressable>
      </View>

      <Pressable className="mt-6" onPress={() => router.push("/signup")}>
        <Text className="text-sm text-[#9aa4b8]">
          Don't have an account?{" "}
          <Text className="text-[#3a3f6e] font-medium">Sign up</Text>
        </Text>
      </Pressable>
    </View>
  );
}
