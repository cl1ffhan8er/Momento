import { useThemeColor } from "@/src/hooks/use-theme-color";
import { StyleSheet, View, type ViewProps } from "react-native";

export function Card({ style, ...otherProps }: ViewProps) {
  const backgroundColor = useThemeColor({ light: "#fff", dark: "#1f2937" }, "background");

  return <View style={[styles.card, { backgroundColor }, style]} {...otherProps} />;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
});
