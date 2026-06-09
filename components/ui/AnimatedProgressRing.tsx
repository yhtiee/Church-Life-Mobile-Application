import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@/context/ThemeContext';

interface AnimatedProgressRingProps {
  percentage: number;   // 0–100
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
  style?: ViewStyle;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function AnimatedProgressRing({
  percentage,
  size = 90,
  strokeWidth = 8,
  color,
  trackColor,
  label,
  sublabel,
  style,
}: AnimatedProgressRingProps) {
  const { colors, typography } = useTheme();
  const ringColor = color ?? colors.primary;
  const ringTrack = trackColor ?? colors.border;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(percentage / 100, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [percentage]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const cx = size / 2;
  const cy = size / 2;

  return (
    <View style={[styles.container, style]}>
      <Svg width={size} height={size}>
        {/* Track */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={ringTrack}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc */}
        <AnimatedCircle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${cx}, ${cy}`}
        />
      </Svg>
      {(label || sublabel) && (
        <View style={[StyleSheet.absoluteFillObject, styles.labelWrap]}>
          {label && (
            <Text
              style={[
                styles.label,
                {
                  fontFamily: typography.fontFamily.extraBold,
                  color: colors.text,
                },
              ]}
            >
              {label}
            </Text>
          )}
          {sublabel && (
            <Text
              style={[
                styles.sublabel,
                {
                  fontFamily: typography.fontFamily.regular,
                  color: colors.textMuted,
                },
              ]}
            >
              {sublabel}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  labelWrap: { alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 16 },
  sublabel: { fontSize: 10, marginTop: 2 },
});
