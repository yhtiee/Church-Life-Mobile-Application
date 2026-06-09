import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { Animation } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function Input({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  isPassword,
  style,
  value,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const { colors, typography, radius } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Shared animated value: 0 = unfocused/empty, 1 = focused/has value
  const focusAnim = useSharedValue(value ? 1 : 0);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    focusAnim.value = withTiming(1, { duration: Animation.normal });
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (!value) {
      focusAnim.value = withTiming(0, { duration: Animation.normal });
    }
    onBlur?.(e);
  };

  // Animated border color
  const containerAnimStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focusAnim.value,
      [0, 1],
      [error ? colors.danger : colors.border, error ? colors.danger : colors.primary]
    ),
    backgroundColor: interpolateColor(
      focusAnim.value,
      [0, 1],
      [colors.surface, colors.primaryLight + '18']
    ),
  }));

  // Floating label
  const labelAnimStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(focusAnim.value, [0, 1], [0, -26]),
      },
      {
        scale: interpolate(focusAnim.value, [0, 1], [1, 0.82]),
      },
    ],
    color: interpolateColor(
      focusAnim.value,
      [0, 1],
      [colors.textMuted, error ? colors.danger : colors.primary]
    ),
  }));

  const iconColor = isFocused ? colors.primary : colors.icon;
  const hasFloatingLabel = !!label;
  const paddingTop = hasFloatingLabel ? 20 : 0;

  return (
    <View style={[styles.container, containerStyle]}>
      <AnimatedView
        style={[
          styles.inputRow,
          {
            borderRadius: radius.md,
            borderWidth: 1.5,
            paddingHorizontal: 14,
            height: 56,
          },
          containerAnimStyle,
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={18}
            color={iconColor}
            style={styles.leftIcon}
          />
        )}

        <View style={[styles.fieldWrap, { paddingTop }]}>
          {hasFloatingLabel && (
            <Animated.Text
              style={[
                styles.floatingLabel,
                { fontFamily: typography.fontFamily.medium, fontSize: 14 },
                labelAnimStyle,
              ]}
              pointerEvents="none"
            >
              {label}
            </Animated.Text>
          )}
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                fontFamily: typography.fontFamily.regular,
                fontSize: 16,
              },
              style,
            ]}
            placeholderTextColor={hasFloatingLabel ? 'transparent' : colors.textMuted}
            secureTextEntry={isPassword && !showPassword}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
        </View>

        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={iconColor}
            />
          </TouchableOpacity>
        )}

        {rightIcon && !isPassword && (
          <TouchableOpacity onPress={onRightIconPress}>
            <Ionicons name={rightIcon} size={18} color={iconColor} />
          </TouchableOpacity>
        )}
      </AnimatedView>

      {(error || helper) && (
        <Text
          style={{
            fontSize: 12,
            fontFamily: typography.fontFamily.regular,
            color: error ? colors.danger : colors.textMuted,
            marginTop: 5,
            marginLeft: 4,
          }}
        >
          {error ?? helper}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  fieldWrap: {
    flex: 1,
    justifyContent: 'center',
    height: '100%',
  },
  floatingLabel: {
    position: 'absolute',
    top: 18,
    left: 0,
    transformOrigin: 'left center',
  },
  leftIcon: { marginRight: 10 },
  input: { flex: 1, height: '100%', paddingTop: 0, paddingBottom: 0 },
});
