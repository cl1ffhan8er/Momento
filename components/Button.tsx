import { ThemedText } from "@/components/themed-text";
import { Pressable, type ViewStyle } from "react-native";

export type ButtonProps = {
  title: string;
  onPress: () => void;
  accessibilityLabel?: string;
  variant?: "primary" | "secondary" | "accent";
  style?: ViewStyle;
};

export function Button({
  title,
  onPress,
  accessibilityLabel,
  variant = "primary",
  style,
}: ButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? title}
      className={`rounded-2xl px-4 py-4 items-center justify-center ${
        variant === "primary"
          ? "bg-primary"
          : variant === "secondary"
          ? "bg-surface border border-secondary"
          : "bg-accent"
      }`}
      style={style}
      onPress={onPress}
    >
      <ThemedText
        className={`text-base font-semibold ${
          variant === "primary"
            ? "text-white"
            : variant === "secondary"
            ? "text-textPrimary"
            : "text-primary"
        }`}
      >
        {title}
      </ThemedText>
    </Pressable>
  );
}
