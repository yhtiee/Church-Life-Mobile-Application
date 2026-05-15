import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

type Variant =
  | 'h1' | 'h2' | 'h3' | 'h4'
  | 'body' | 'bodyLarge' | 'bodySmall'
  | 'caption' | 'label' | 'overline';

interface ThemedTextProps extends TextProps {
  variant?: Variant;
  color?: string;
  muted?: boolean;
  center?: boolean;
  bold?: boolean;
  semiBold?: boolean;
}

export function ThemedText({
  variant = 'body',
  color,
  muted,
  center,
  bold,
  semiBold,
  style,
  ...props
}: ThemedTextProps) {
  const { colors, typography } = useTheme();

  const variantStyle = styles[variant];
  const textColor = color ?? (muted ? colors.textSecondary : colors.text);

  return (
    <Text
      style={[
        variantStyle,
        {
          color: textColor,
          fontFamily: bold
            ? typography.fontFamily.bold
            : semiBold
            ? typography.fontFamily.semiBold
            : typography.fontFamily.regular,
          textAlign: center ? 'center' : undefined,
        },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 34, lineHeight: 42, letterSpacing: -0.5 },
  h2: { fontSize: 28, lineHeight: 36, letterSpacing: -0.3 },
  h3: { fontSize: 24, lineHeight: 32, letterSpacing: -0.2 },
  h4: { fontSize: 20, lineHeight: 28 },
  bodyLarge: { fontSize: 18, lineHeight: 28 },
  body: { fontSize: 15, lineHeight: 24 },
  bodySmall: { fontSize: 13, lineHeight: 20 },
  caption: { fontSize: 12, lineHeight: 18 },
  label: { fontSize: 13, lineHeight: 18, letterSpacing: 0.2 },
  overline: { fontSize: 11, lineHeight: 16, letterSpacing: 1.5, textTransform: 'uppercase' },
});
