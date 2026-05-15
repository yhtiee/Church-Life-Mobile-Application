import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  fullWidth,
  icon,
  style,
  labelStyle,
}: ButtonProps) {
  const { colors, typography, radius } = useTheme();

  const variantStyles: Record<Variant, { bg: string; text: string; border?: string }> = {
    primary: { bg: colors.primary, text: '#FFFFFF' },
    secondary: { bg: colors.surface, text: colors.primary, border: colors.border },
    ghost: { bg: 'transparent', text: colors.primary, border: 'transparent' },
    danger: { bg: colors.danger, text: '#FFFFFF' },
    accent: { bg: colors.accent, text: '#FFFFFF' },
  };

  const sizeStyles: Record<Size, { height: number; fontSize: number; px: number }> = {
    sm: { height: 36, fontSize: 13, px: 14 },
    md: { height: 48, fontSize: 15, px: 20 },
    lg: { height: 56, fontSize: 17, px: 28 },
  };

  const { bg, text, border } = variantStyles[variant];
  const { height, fontSize, px } = sizeStyles[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      disabled={isDisabled}
      style={[
        styles.base,
        {
          height,
          paddingHorizontal: px,
          borderRadius: radius.md,
          backgroundColor: bg,
          borderWidth: border ? 1 : 0,
          borderColor: border,
          width: fullWidth ? '100%' : undefined,
          opacity: isDisabled ? 0.55 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={text} size="small" />
      ) : (
        <View style={styles.inner}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text
            style={[
              {
                color: text,
                fontSize,
                fontFamily: typography.fontFamily.semiBold,
                letterSpacing: 0.2,
              },
              labelStyle,
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  inner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon: {},
});
