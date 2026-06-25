import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Avatar } from '@/components/ui/Avatar';
import { ScreenHeader } from '@/components/ui/ScreenHeader';

export default function AdminProfileScreen() {
  const { colors, typography, radius, isDark, setColorMode, colorMode } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();

  const SettingRow = ({
    icon, label, value, onPress, rightEl, isDestructive,
  }: {
    icon: any; label: string; value?: string; onPress?: () => void;
    rightEl?: React.ReactNode; isDestructive?: boolean;
  }) => {
    const textColor = isDestructive ? colors.danger : colors.text;
    const iconColor = isDestructive ? colors.danger : colors.primary;
    const iconBg = isDestructive ? colors.dangerBg : colors.primaryLight;

    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={!onPress && !rightEl}
        style={[styles.settingRow, { borderBottomColor: colors.divider }]}
        activeOpacity={onPress ? 0.7 : 1}
      >
        <View style={[styles.settingIcon, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={16} color={iconColor} />
        </View>
        <Text style={{ flex: 1, fontSize: 14, fontFamily: typography.fontFamily.medium, color: textColor, marginLeft: 13 }}>
          {label}
        </Text>
        {value && <Text style={{ fontSize: 13, fontFamily: typography.fontFamily.regular, color: colors.textMuted }}>{value}</Text>}
        {rightEl}
        {onPress && !isDestructive && !rightEl && <Ionicons name="chevron-forward" size={16} color={colors.border} style={{ marginLeft: 8 }} />}
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper edges={['top', 'left', 'right']}>
      <ScreenHeader title="Admin Settings" showBack={false} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* ── Admin Hero — name left, avatar right ── */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={[styles.heroSection, { backgroundColor: colors.background }]}
        >
          <View style={styles.heroLeft}>
            <Text style={[styles.heroName, { color: colors.text, fontFamily: typography.fontFamily.extraBold }]}>
              {user?.fullName ?? 'Admin'}
            </Text>
            {user?.parishName && (
              <Text style={[styles.heroSub, { color: colors.textMuted, fontFamily: typography.fontFamily.regular }]}>
                {user.parishName}
              </Text>
            )}

            <Animated.View entering={FadeInDown.delay(160).duration(400)} style={styles.badgesRow}>
              <View style={[styles.heroBadge, { backgroundColor: colors.dangerBg, borderColor: colors.danger + '60' }]}>
                <Text style={[styles.heroBadgeText, { color: colors.danger, fontFamily: typography.fontFamily.bold }]}>
                  {user?.role === 'parish_admin' ? 'Parish Admin' : 'Secretary'}
                </Text>
              </View>
            </Animated.View>
          </View>

          <Animated.View entering={ZoomIn.springify().damping(14)} style={styles.heroRight}>
            <Avatar name={user?.fullName ?? 'Admin'} size={80} ring={colors.danger} />
          </Animated.View>
        </Animated.View>

        {/* Subtle separator before settings */}
        <View style={[styles.separator, { backgroundColor: colors.divider }]} />

        <View style={{ paddingHorizontal: 20 }}>

          {/* ── Personal Details ── */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.semiBold }]}>
              Personal Details
            </Text>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <SettingRow
                icon="mail-outline"
                label="Email"
                value={user?.email}
              />
              <SettingRow
                icon="calendar-outline"
                label="Birthday Month"
                value={user?.birthdayMonth}
              />
              <SettingRow
                icon="male-female-outline"
                label="Sex"
                value={user?.sex}
              />
              <SettingRow
                icon="location-outline"
                label="Parish"
                value={user?.parishName ?? 'Not assigned'}
              />
            </View>
          </Animated.View>

          {/* ── Security ── */}
          <Animated.View entering={FadeInDown.delay(160).duration(400)}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.semiBold }]}>
              Security
            </Text>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <SettingRow
                icon="lock-closed-outline"
                label="Change Password"
                onPress={() => router.push('/(modals)/change-password')}
              />
            </View>
          </Animated.View>

          {/* ── Parish Management ── */}
          {user?.role === 'parish_admin' && (
            <Animated.View entering={FadeInDown.delay(190).duration(400)}>
              <Text style={[styles.sectionLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.semiBold }]}>
                Parish Management
              </Text>
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <SettingRow
                  icon="business-outline"
                  label="Edit Parish History"
                  onPress={() => router.push('/(modals)/edit-parish-history')}
                />
              </View>
            </Animated.View>
          )}

          {/* ── System & UI ── */}
          <Animated.View entering={FadeInDown.delay(220).duration(400)}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.semiBold }]}>
              System
            </Text>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <SettingRow
                icon="moon-outline"
                label="Dark Mode"
                rightEl={
                  <Switch
                    value={colorMode === 'dark' || (colorMode === 'system' && isDark)}
                    onValueChange={(val) => setColorMode(val ? 'dark' : 'light')}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#FFFFFF"
                  />
                }
              />
              <SettingRow
                icon="apps-outline"
                label="Switch to Parishioner View"
                onPress={() => router.replace('/(tabs)')}
              />
            </View>
          </Animated.View>

          {/* ── Account ── */}
          <Animated.View entering={FadeInDown.delay(280).duration(400)} style={styles.footerActions}>
            <TouchableOpacity
              onPress={logout}
              style={[
                styles.logoutBtn,
                { backgroundColor: colors.dangerBg, borderColor: colors.danger, borderRadius: radius.md },
              ]}
            >
              <Ionicons name="log-out-outline" size={18} color={colors.danger} />
              <Text style={{ fontSize: 15, fontFamily: typography.fontFamily.semiBold, color: colors.danger, marginLeft: 8 }}>
                Log Out
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.footerInfo}>
            <Text style={{ fontSize: 12, color: colors.textMuted, fontFamily: typography.fontFamily.medium }}>
              ChurchLife Admin • Version 1.0.0
            </Text>
          </View>

        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  // ── Hero ───────────────────────────────────────────────────────────────────
  heroSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  heroLeft: {
    flex: 1,
    paddingRight: 20,
  },
  heroName: {
    fontSize: 26,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  heroSub: {
    fontSize: 13,
    marginTop: 4,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 14,
  },
  heroBadge: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  heroBadgeText: {
    fontSize: 11,
    letterSpacing: 0.3,
  },
  heroRight: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
  },

  // ── Separator ──────────────────────────────────────────────────────────────
  separator: {
    height: 6,
    marginBottom: 4,
  },

  // ── Settings ───────────────────────────────────────────────────────────────
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 20,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Footer ─────────────────────────────────────────────────────────────────
  footerActions: {
    marginTop: 24,
    marginBottom: 16,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
  },
  footerInfo: {
    alignItems: 'center',
    marginTop: 8,
    opacity: 0.5,
  },
});
