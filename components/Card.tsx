import { View, type ViewProps } from "react-native";

export function Card({ style, ...otherProps }: ViewProps) {
  return (
    <View
      className="rounded-3xl bg-card p-5 mb-4 shadow-lg"
      style={style}
      {...otherProps}
    />
  );
}
