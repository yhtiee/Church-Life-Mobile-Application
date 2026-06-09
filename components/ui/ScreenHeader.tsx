import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StyleProp, ViewStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';

interface ScreenHeaderProps {
  /** Screen title — shown when showGreeting is false */
  title?: string;
  /** Shown on home — shows time-based greeting + user's name */
  showGreeting?: boolean;
  /** Whether to show the back button */
  showBack?: boolean;
  /** Custom right element */
  rightElement?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Called when back button is pressed; defaults to router.back() */
  onBack?: () => void;
}

export function ScreenHeader({
  title,
  showGreeting,
  showBack = true,
  rightElement,
  style,
  onBack,
}: ScreenHeaderProps) {
  const { colors, typography, isDark } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const handleBack = () => {
    if (onBack) onBack();
    else router.back();
  };

  // ── Home greeting header ─────────────────────────────────────────────────
  if (showGreeting) {
    return (
      <Animated.View
        entering={FadeInDown.duration(500)}
        style={[
          styles.greetingWrapper,
          { backgroundColor: colors.background },
          style as any,
        ]}
      >
        {/* Text area */}
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.greetingLabel,
              { color: colors.textMuted, fontFamily: typography.fontFamily.regular },
            ]}
          >
            {greeting} 👋
          </Text>
          <Text
            style={[
              styles.greetingName,
              { color: colors.text, fontFamily: typography.fontFamily.extraBold },
            ]}
            numberOfLines={1}
          >
            {user?.fullName?.split(' ')[0] ?? 'Parishioner'}
          </Text>
          {user?.parishName && user.hasParishAccess && (
            <View style={styles.parishRow}>
              <Ionicons name="location-outline" size={11} color={colors.primary} />
              <Text
                style={[
                  styles.parishLine,
                  { color: colors.primary, fontFamily: typography.fontFamily.medium },
                ]}
              >
                {user.parishName}
              </Text>
            </View>
          )}
        </View>

        {/* Right: notification + avatar */}
        <View style={styles.rightArea}>
          <TouchableOpacity
            style={[styles.notifBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push('/(modals)/notifications')}
          >
            <Ionicons name="notifications-outline" size={21} color={colors.text} />
            {/* Unread dot */}
            <View style={[styles.notifDot, { borderColor: colors.background }]} />
          </TouchableOpacity>
          <Avatar
            name={user?.fullName ?? 'User'}
            size={42}
            ring={colors.primary}
          />
        </View>
      </Animated.View>
    );
  }

  // ── Secondary screen header ───────────────────────────────────────────────
  return (
    <View
      style={[
        styles.secondaryWrapper,
        { backgroundColor: colors.background, borderBottomColor: colors.divider },
        style as any,
      ]}
    >
      {/* Back button */}
      {
        showBack && (
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
        )
      }

      {/* Title */}
      <Text
        style={[
          styles.secondaryTitle,
          { color: colors.text, fontFamily: typography.fontFamily.bold },
        ]}
        numberOfLines={1}
      >
        {title ?? ''}
      </Text>

      {/* Right: notification bell */}
      {rightElement !== undefined ? (
        rightElement
      ) : (
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => router.push('/(modals)/notifications')}
        >
          <Ionicons name="notifications-outline" size={21} color={colors.text} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Greeting (Home) ────────────────────────────────────────────────────────
  greetingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
  },
  greetingLabel: {
    fontSize: 13,
    marginBottom: 2,
  },
  greetingName: {
    fontSize: 26,
    letterSpacing: -0.5,
  },
  parishRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  parishLine: {
    fontSize: 12,
    letterSpacing: 0.2,
  },
  rightArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  notifDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E53E3E',
    zIndex: 1,
    borderWidth: 1.5,
  },

  // ── Secondary screen header ───────────────────────────────────────────────
  secondaryWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  secondaryTitle: {
    flex: 1,
    fontSize: 17,
    textAlign: 'center',
    marginHorizontal: 8,
    letterSpacing: -0.2,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
