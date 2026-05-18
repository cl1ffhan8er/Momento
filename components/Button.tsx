import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/src/hooks/use-theme-color";
import { Pressable, StyleSheet, type ViewStyle } from "react-native";

export type ButtonProps = {
  title: string;
  onPress: () => void;
  accessibilityLabel?: string;
  variant?: "primary" | "secondary";
  style?: ViewStyle;
};

export function Button({
  title,
  onPress,
  accessibilityLabel,
  variant = "primary",
  style,
}: ButtonProps) {
  const backgroundColor = useThemeColor(
    { light: variant === "primary" ? "#0a7ea4" : "#f1f5f9", dark: variant === "primary" ? "#0a7ea4" : "#202328" },
    "background"
  );
  const textColor = variant === "primary" ? "#fff" : "#0a7ea4";

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? title}
      style={[styles.button, { backgroundColor }, style]}
      onPress={onPress}
    >
      <ThemedText style={[styles.text, { color: textColor }]}>{title}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
});
