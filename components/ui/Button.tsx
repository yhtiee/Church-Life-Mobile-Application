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
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';
import { Gradients, Animation } from '@/constants/theme';

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

  const sizeStyles: Record<Size, { height: number; fontSize: number; px: number }> = {
    sm: { height: 36, fontSize: 13, px: 14 },
    md: { height: 48, fontSize: 15, px: 20 },
    lg: { height: 58, fontSize: 17, px: 28 },
  };

  const { height, fontSize, px } = sizeStyles[size];
  const isDisabled = disabled || loading;

  const isGradient = variant === 'primary' || variant === 'accent';

  const flatBg: Record<Variant, string> = {
    primary:   colors.primary,
    secondary: colors.surface,
    ghost:     'transparent',
    danger:    colors.danger,
    accent:    colors.primary,
  };

  const textColor: Record<Variant, string> = {
    primary:   '#FFFFFF',
    secondary: colors.primary,
    ghost:     colors.primary,
    danger:    '#FFFFFF',
    accent:    '#FFFFFF',
  };

  const borderColor: Record<Variant, string | undefined> = {
    primary:   undefined,
    secondary: colors.border,
    ghost:     'transparent',
    danger:    undefined,
    accent:    undefined,
  };

  const handlePress = () => {
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const inner = (
    <View style={styles.inner}>
      {icon && <View style={styles.icon}>{icon}</View>}
      {loading ? (
        <ActivityIndicator color={textColor[variant]} size="small" />
      ) : (
        <Text
          style={[
            {
              color: textColor[variant],
              fontSize,
              fontFamily: typography.fontFamily.semiBold,
              letterSpacing: 0.5,
            },
            labelStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </View>
  );

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        {
          width: fullWidth ? '100%' : undefined,
          opacity: isDisabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {isGradient ? (
        <LinearGradient
          colors={['#2A6FDB', '#4A8FFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.base,
            {
              height,
              paddingHorizontal: px,
              borderRadius: radius.lg,
            },
          ]}
        >
          {inner}
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.base,
            {
              height,
              paddingHorizontal: px,
              borderRadius: radius.lg,
              backgroundColor: flatBg[variant],
              borderWidth: borderColor[variant] ? 1 : 0,
              borderColor: borderColor[variant],
            },
          ]}
        >
          {inner}
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
