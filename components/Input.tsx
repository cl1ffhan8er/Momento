import { useThemeColor } from "@/src/hooks/use-theme-color";
import { StyleSheet, TextInput, type TextInputProps } from "react-native";

export function Input(props: TextInputProps) {
  const backgroundColor = useThemeColor({ light: "#f8fafc", dark: "#111827" }, "background");
  const color = useThemeColor({ light: "#111827", dark: "#f8fafc" }, "text");

  return <TextInput placeholderTextColor="#94a3b8" style={[styles.input, { backgroundColor, color }]} {...props} />;
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 20,
  },
});
