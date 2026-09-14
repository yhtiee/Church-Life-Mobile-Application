import React from 'react';
import { StyleSheet, TouchableOpacity, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  onPress: () => void;
  /** Read by screen readers, since the button shows only an icon. */
  accessibilityLabel: string;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}

/**
 * The round primary action pinned to the bottom-right of a list, matching the
 * floating buttons already used on the member and group screens.
 *
 * Positioned absolutely, so render it as the last child of the container it
 * should float over, and give any list underneath enough bottom padding that
 * its last row can scroll clear of the button.
 */
export function FloatingActionButton({ onPress, accessibilityLabel, icon = 'add', style }: Props) {
  const { colors, radius } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.fab,
        { backgroundColor: colors.primary, borderRadius: radius.xl, shadowColor: colors.primary },
        style,
      ]}
    >
      <Ionicons name={icon} size={28} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
