import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useAuth, type ViewAs } from '@/context/AuthContext';

const OPTIONS: { value: ViewAs | null; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: null, label: 'My view', icon: 'person-circle-outline' },
  { value: 'admin', label: 'Parish admin', icon: 'settings-outline' },
  { value: 'member', label: 'Member', icon: 'people-outline' },
];

/**
 * Lets a platform admin look at the app as a parish admin or an ordinary
 * member, and switch back.
 *
 * A view switch, not an identity switch: the signed-in account never changes,
 * so every database policy still applies to them. It decides which part of
 * the app they are routed into, which is enough to check what each kind of
 * user actually sees.
 */
export function ViewAsSwitcher() {
  const { colors, typography, radius } = useTheme();
  const { user, viewAs, setViewAs } = useAuth();

  // Hidden while a view is active, so the preview is faithful: an admin
  // checking what a member sees should not see admin controls. The banner
  // ScreenWrapper renders is the way back.
  if (!user?.is_super_admin || viewAs) return null;

  return (
    <View style={styles.wrap}>
      <Text
        style={[
          styles.title,
          { color: colors.textMuted, fontFamily: typography.fontFamily.semiBold },
        ]}
      >
        View the app as
      </Text>

      <View style={styles.row}>
        {OPTIONS.map((option) => {
          const active = viewAs === option.value;
          return (
            <TouchableOpacity
              key={option.label}
              onPress={() => setViewAs(option.value)}
              style={[
                styles.option,
                {
                  borderRadius: radius.md,
                  backgroundColor: active ? colors.primary : colors.surface,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Ionicons
                name={option.icon}
                size={18}
                color={active ? colors.textInverse : colors.textMuted}
              />
              <Text
                style={{
                  fontSize: 12,
                  marginTop: 5,
                  textAlign: 'center',
                  color: active ? colors.textInverse : colors.text,
                  fontFamily: active ? typography.fontFamily.bold : typography.fontFamily.medium,
                }}
                numberOfLines={2}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text
        style={{
          fontSize: 12,
          color: colors.textMuted,
          fontFamily: typography.fontFamily.regular,
          marginTop: 8,
          lineHeight: 18,
        }}
      >
        This only changes what you see. Your account and its permissions stay
        the same, so you will see the data your own account can reach.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, marginBottom: 20 },
  title: {
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  row: { flexDirection: 'row', gap: 8 },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderWidth: 1,
  },
});
