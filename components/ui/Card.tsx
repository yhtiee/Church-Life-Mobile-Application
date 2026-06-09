import React from 'react';
import { Pressable, View, ViewProps, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { Shadow, Animation } from '@/constants/theme';

type Elevation = 'none' | 'sm' | 'md' | 'lg' | 'xl';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  elevation?: Elevation;
  backgroundColor?: string;
  gradient?: readonly string[];
  padding?: number;
  borderRadius?: number;
  pressable?: boolean;
  glowColor?: string;
  onPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Card({
  children,
  elevation = 'sm',
  backgroundColor,
  gradient,
  padding = 16,
  borderRadius,
  pressable = false,
  glowColor,
  onPress,
  style,
  ...rest
}: CardProps) {
  const { colors, radius } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (pressable) scale.value = withSpring(0.97, Animation.spring);
  };
  const handlePressOut = () => {
    if (pressable) scale.value = withSpring(1, Animation.spring);
  };

  const shadowStyle = elevation === 'none' ? {} : {
    ...Shadow[elevation],
    ...(glowColor ? { shadowColor: glowColor } : {}),
  };

  const cardBg = backgroundColor ?? colors.surface;
  const br = borderRadius ?? radius.lg;

  const innerContent = gradient ? (
    <LinearGradient
      colors={gradient as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.inner, { borderRadius: br, padding }]}
    >
      {children}
    </LinearGradient>
  ) : (
    <View
      style={[
        styles.inner,
        {
          backgroundColor: cardBg,
          borderRadius: br,
          padding,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
      ]}
    >
      {children}
    </View>
  );

  if (pressable || onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[animatedStyle, shadowStyle, { borderRadius: br }, style]}
        {...(rest as any)}
      >
        {innerContent}
      </AnimatedPressable>
    );
  }

  return (
    <View style={[shadowStyle, { borderRadius: br }, style]} {...rest}>
      {innerContent}
    </View>
  );
}

const styles = StyleSheet.create({
  inner: { overflow: 'hidden' },
});
