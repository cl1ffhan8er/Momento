import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/src/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'hand';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color, fontFamily: 'Koulen' },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'hand' ? styles.hand : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Koulen',
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    fontFamily: 'Koulen',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
    fontFamily: 'Koulen',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Koulen',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    fontFamily: 'Koulen',
  },
  hand: {
    fontFamily: 'JustAnotherHand',
    fontSize: 28,
    lineHeight: 34,
  },
});
