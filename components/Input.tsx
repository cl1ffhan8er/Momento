import { Colors } from "@/constants/theme";
import { TextInput, type TextInputProps } from "react-native";

export function Input(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={Colors.light.textMuted}
      className="rounded-2xl border border-secondary bg-surface px-4 py-4 text-textPrimary"
      {...props}
    />
  );
}
