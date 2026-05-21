import { AuthService } from "@/src/services/firebase/auth.service";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

const authService = new AuthService();

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = async () => {
    if (!username.trim()) {
      alert("Username is required");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      const cred = await authService.signup(email, password);
      await authService.createUserProfile(cred.user.uid, username);
      router.replace("/(tabs)/home");
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          placeholderTextColor="#b0bad0"
          autoCapitalize="none"
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          placeholderTextColor="#b0bad0"
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          placeholderTextColor="#b0bad0"
          secureTextEntry
          onChangeText={setPassword}
        />
        <TextInput
          style={[styles.input, styles.inputLast]}
          placeholder="Confirm Password"
          value={confirmPassword}
          placeholderTextColor="#b0bad0"
          secureTextEntry
          onChangeText={setConfirmPassword}
        />

        <Pressable style={styles.signupButton} onPress={handleSignup}>
          <Text style={styles.signupButtonText}>Sign Up</Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.loginLink}
        onPress={() => router.replace("/(auth)/login")}
      >
        <Text style={styles.loginText}>
          Already have an account?{" "}
          <Text style={styles.loginTextBold}>Log in</Text>
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#dde3f0",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e6f0",
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: "#222",
    backgroundColor: "#fff",
  },
  inputLast: {
    marginBottom: 4,
  },
  signupButton: {
    backgroundColor: "#3d4a7a",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 4,
  },
  signupButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  loginLink: {
    marginTop: 24,
  },
  loginText: {
    color: "#8a94a6",
    fontSize: 14,
  },
  loginTextBold: {
    color: "#222",
    fontWeight: "bold",
  },
});
