import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import Animated, { withSpring, useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ColorMode } from '@/context/ThemeContext';

interface ThemeSwitcherProps {
  size?: number;
}

export function ThemeSwitcher({ size = 42 }: ThemeSwitcherProps) {
  const { colors, colorMode, setColorMode } = useTheme();
  const scaleAnim = useSharedValue(1);

  const getIcon = () => {
    if (colorMode === 'light') return 'sunny-outline';
    if (colorMode === 'dark') return 'moon-outline';
    return 'contrast-outline';
  };

  const getNextMode = (): ColorMode => {
    if (colorMode === 'light') return 'dark';
    if (colorMode === 'dark') return 'system';
    return 'light';
  };

  const handlePress = () => {
    scaleAnim.value = withSpring(0.85, { damping: 5, mass: 0.5 }, () => {
      scaleAnim.value = withSpring(1, { damping: 5, mass: 0.5 });
    });
    const nextMode = getNextMode();
    setColorMode(nextMode);
  };

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  return (
    <Animated.View style={scaleStyle}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Ionicons
          name={getIcon()}
          size={size * 0.45}
          color={colors.text}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
