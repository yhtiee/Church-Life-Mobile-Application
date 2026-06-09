import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

export interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  onDismiss: (id: string) => void;
}

const { width } = Dimensions.get('window');

export function Toast({ id, message, type, onDismiss }: ToastProps) {
  const { colors, typography, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  // Configure colors based on status type
  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: colors.successBg || '#E8F5E9',
          border: colors.success || '#2E7D32',
          icon: 'checkmark-circle-outline' as const,
          iconColor: colors.success || '#2E7D32',
        };
      case 'error':
        return {
          bg: colors.dangerBg || '#FFEBEE',
          border: colors.danger || '#C62828',
          icon: 'alert-circle-outline' as const,
          iconColor: colors.danger || '#C62828',
        };
      case 'info':
      default:
        return {
          bg: colors.infoBg || '#E3F2FD',
          border: colors.info || '#1565C0',
          icon: 'information-circle-outline' as const,
          iconColor: colors.info || '#1565C0',
        };
    }
  };

  const styleConfig = getStyles();

  useEffect(() => {
    // Slide in
    translateY.value = withSpring(0, { damping: 12 });
    opacity.value = withTiming(1, { duration: 300 });

    const timer = setTimeout(() => {
      // Slide out
      translateY.value = withTiming(-100, { duration: 250 });
      opacity.value = withTiming(0, { duration: 250 }, () => {
        runOnJS(onDismiss)(id);
      });
    }, 3200);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: Math.max(insets.top, 16),
          backgroundColor: styleConfig.bg,
          borderColor: styleConfig.border,
          borderRadius: radius.md,
        },
        animatedStyle,
      ]}
    >
      <View style={styles.content}>
        <Ionicons name={styleConfig.icon} size={22} color={styleConfig.iconColor} />
        <Text style={[styles.message, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 9999,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  message: {
    fontSize: 14,
    flex: 1,
    lineHeight: 18,
  },
});
