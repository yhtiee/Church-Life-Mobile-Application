import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

type BadgeVariant = 'primary' | 'accent' | 'secondary' | 'success' | 'danger' | 'warning' | 'muted';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

export function Badge({ label, variant = 'primary', size = 'md' }: BadgeProps) {
  const { colors, typography } = useTheme();

  const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
    primary: { bg: colors.primaryLight, text: colors.primary },
    accent: { bg: colors.accentLight, text: colors.accent },
    secondary: { bg: colors.secondaryLight, text: colors.secondary },
    success: { bg: colors.successBg, text: colors.success },
    danger: { bg: colors.dangerBg, text: colors.danger },
    warning: { bg: colors.warningBg, text: colors.warning },
    muted: { bg: colors.surfaceMuted, text: colors.textMuted },
  };

  const { bg, text } = variantColors[variant];
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          paddingHorizontal: isSm ? 8 : 12,
          paddingVertical: isSm ? 2 : 4,
          borderRadius: 999,
        },
      ]}
    >
      <Text
        style={{
          color: text,
          fontSize: isSm ? 11 : 12,
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
  badge: { alignSelf: 'flex-start' },
});
