// import { useFacebookAuth } from "@/src/hooks/use-facebook";
// import { AuthService } from "@/src/services/firebase/auth.service";
// import { router } from "expo-router";
// import { useState } from "react";
// import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

// const authService = new AuthService();

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const { signInWithFacebook } = useFacebookAuth();

//   const handleLogin = async () => {
//     try {
//       await authService.login(email, password);
//       router.replace("/(tabs)/home");
//     } catch (e: any) {
//       alert(e.message);
//     }
//   };

//   const handleFacebook = async () => {
//     try {
//       await signInWithFacebook();
//       router.replace("/(tabs)/home");
//     } catch (e: any) {
//       alert(e.message);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.card}>
//         <TextInput
//           style={styles.input}
//           placeholder="Email"
//           value={email}
//           placeholderTextColor="#b0bad0"
//           autoCapitalize="none"
//           keyboardType="email-address"
//           onChangeText={setEmail}
//         />
//         <TextInput
//           style={[styles.input, styles.inputLast]}
//           placeholder="Password"
//           value={password}
//           placeholderTextColor="#b0bad0"
//           secureTextEntry
//           onChangeText={setPassword}
//         />

//         <Pressable style={styles.loginButton} onPress={handleLogin}>
//           <Text style={styles.loginButtonText}>Login</Text>
//         </Pressable>

//         <View style={styles.divider}>
//           <View style={styles.dividerLine} />
//           <Text style={styles.dividerText}>or continue with</Text>
//           <View style={styles.dividerLine} />
//         </View>

//         <Pressable style={styles.facebookButton} onPress={handleFacebook}>
//           <View style={styles.facebookIcon}>
//             <Text style={styles.facebookIconText}>f</Text>
//           </View>
//           <Text style={styles.facebookButtonText}>Continue with Facebook</Text>
//         </Pressable>
//       </View>

//       <Pressable
//         style={styles.signupLink}
//         onPress={() => router.push("/(auth)/signup")}
//       >
//         <Text style={styles.signupText}>
//           Don't have an account?{" "}
//           <Text style={styles.signupTextBold}>Sign up</Text>
//         </Text>
//       </Pressable>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#dce4ec",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingHorizontal: 28,
//   },
//   card: {
//     width: "100%",
//     backgroundColor: "rgba(255,255,255,0.7)",
//     borderRadius: 16,
//     padding: 24,
//   },
//   input: {
//     backgroundColor: "rgba(255,255,255,0.8)",
//     borderWidth: 1,
//     borderColor: "rgba(58,63,110,0.13)",
//     borderRadius: 12,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     fontSize: 14,
//     color: "#3a3f6e",
//     marginBottom: 12,
//   },
//   inputLast: {
//     marginBottom: 16,
//   },
//   loginButton: {
//     backgroundColor: "#3a3f6e",
//     borderRadius: 12,
//     paddingVertical: 12,
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   loginButtonText: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "500",
//   },
//   divider: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   dividerLine: {
//     flex: 1,
//     height: 1,
//     backgroundColor: "rgba(58,63,110,0.13)",
//   },
//   dividerText: {
//     fontSize: 12,
//     color: "#b0bad0",
//     marginHorizontal: 12,
//   },
//   facebookButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 1,
//     borderColor: "rgba(58,63,110,0.13)",
//     borderRadius: 12,
//     paddingVertical: 12,
//     backgroundColor: "#fff",
//     gap: 8,
//   },
//   facebookIcon: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     backgroundColor: "#1877f2",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   facebookIconText: {
//     color: "#fff",
//     fontWeight: "700",
//     fontSize: 14,
//     lineHeight: 16,
//   },
//   facebookButtonText: {
//     fontSize: 14,
//     color: "#3a3f6e",
//   },
//   signupLink: {
//     marginTop: 24,
//   },
//   signupText: {
//     fontSize: 14,
//     color: "#9aa4b8",
//   },
//   signupTextBold: {
//     color: "#3a3f6e",
//     fontWeight: "500",
//   },
// });

import { auth } from "@/src/lib/auth";
import { signOut } from "firebase/auth";
import { Button } from "react-native";

export default function ProfileScreen() {
  const handleLogout = async () => {
    await signOut(auth);
  };

  return <Button title="Logout" onPress={handleLogout} />;
}