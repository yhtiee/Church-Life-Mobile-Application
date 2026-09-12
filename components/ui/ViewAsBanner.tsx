import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

/**
 * Shown whenever a platform admin is looking at another experience.
 *
 * Without it the switch is a trap: viewing as a member hides the admin
 * entry points, so there would be nothing left on screen to switch back
 * with. Rendered by ScreenWrapper, so it is present on every screen.
 */
export function ViewAsBanner() {
  const { colors, typography } = useTheme();
  const { viewAs, setViewAs } = useAuth();

  if (!viewAs) return null;

  return (
    <View style={[styles.bar, { backgroundColor: colors.primary }]}>
      <Ionicons name="eye-outline" size={14} color={colors.textInverse} />
      <Text
        style={{
          flex: 1,
          marginLeft: 8,
          fontSize: 12,
          color: colors.textInverse,
          fontFamily: typography.fontFamily.medium,
        }}
        numberOfLines={1}
      >
        Viewing as {viewAs === 'admin' ? 'parish admin' : 'member'}
      </Text>
      <TouchableOpacity onPress={() => setViewAs(null)} hitSlop={10}>
        <Text
          style={{
            fontSize: 12,
            color: colors.textInverse,
            fontFamily: typography.fontFamily.bold,
          }}
        >
          Exit
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
});
