import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

type Variant = 'default' | 'accent' | 'success' | 'danger' | 'warning' | 'muted' | 'primary';
type Size = 'xs' | 'sm' | 'md';

interface BadgeProps {
  label: string;
  variant?: Variant;
  size?: Size;
  glow?: boolean;
  style?: ViewStyle;
}

export function Badge({ label, variant = 'default', size = 'md', glow = false, style }: BadgeProps) {
  const { colors, typography } = useTheme();

  const variantMap: Record<Variant, { bg: string; text: string }> = {
    default:  { bg: colors.surfaceMuted,    text: colors.textSecondary },
    primary:  { bg: colors.primaryLight,    text: colors.primary },
    accent:   { bg: colors.accentLight,     text: colors.accent },
    success:  { bg: colors.successBg,       text: colors.success },
    danger:   { bg: colors.dangerBg,        text: colors.danger },
    warning:  { bg: colors.warningBg,       text: colors.warning },
    muted:    { bg: colors.surfaceMuted,    text: colors.textMuted },
  };

  const sizeMap: Record<Size, { px: number; py: number; fontSize: number }> = {
    xs: { px: 6,  py: 2, fontSize: 9  },
    sm: { px: 8,  py: 3, fontSize: 10 },
    md: { px: 10, py: 4, fontSize: 12 },
  };

  const { bg, text } = variantMap[variant];
  const { px, py, fontSize } = sizeMap[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          paddingHorizontal: px,
          paddingVertical: py,
          ...(glow ? {
            shadowColor: text,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.35,
            shadowRadius: 6,
            elevation: 3,
          } : {}),
        },
        style,
      ]}
    >
      <Text
        style={{
          color: text,
          fontSize,
          fontFamily: typography.fontFamily.semiBold,
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
});
