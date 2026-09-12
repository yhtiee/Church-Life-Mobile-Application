import * as Haptics from 'expo-haptics';
import type { BottomTabBarButtonProps } from 'expo-router/tabs';
import { Pressable } from 'react-native';

/**
 * The tab bar still hands down a few props that only the (now deprecated)
 * `PlatformPressable` understood, so strip those before delegating to `Pressable`.
 */
export function HapticTab({
  ref,
  href,
  hoverEffect,
  pressColor,
  pressOpacity,
  onPressIn,
  ...props
}: BottomTabBarButtonProps) {
  return (
    <Pressable
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPressIn?.(ev);
      }}
    />
  );
}
