import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Avatar } from '@/components/ui/Avatar';
import { getGroupMetadata } from '@/constants/groups';
import { useGroupsQuery } from '@/hooks/queries/useGroups';

export default function ProfileScreen() {
  const { colors, typography, radius, isDark, setColorMode, colorMode } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();

  const { data: groups = [] } = useGroupsQuery();
  const joinedGroups = user?.id ? groups.filter((g) => g.member_ids?.includes(user.id)) : [];
  const primaryGroupColor = joinedGroups.length > 0 ? getGroupMetadata(joinedGroups[0].name).color : colors.primary;

  // ── Setting Row component ──────────────────────────────────────────────────
  const SettingRow = ({
    icon,
    label,
    value,
    onPress,
    rightEl,
    showEditIcon,
    isDestructive,
    iconBgColor,
    iconColor: customIconColor,
  }: {
    icon: any;
    label: string;
    value?: string;
    onPress?: () => void;
    rightEl?: React.ReactNode;
    showEditIcon?: boolean;
    isDestructive?: boolean;
    iconBgColor?: string;
    iconColor?: string;
  }) => {
    const textColor = isDestructive ? colors.danger : colors.text;
    const resolvedIconColor = customIconColor ?? (isDestructive ? colors.danger : colors.primary);
    const resolvedIconBg = iconBgColor ?? (isDestructive ? colors.dangerBg : colors.primaryLight);

    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={!onPress && !rightEl && !showEditIcon}
        style={[styles.settingRow, { borderBottomColor: colors.divider }]}
        activeOpacity={onPress || showEditIcon ? 0.7 : 1}
      >
        <View style={[styles.settingIcon, { backgroundColor: resolvedIconBg, borderRadius: 10 }]}>
          <Ionicons name={icon} size={16} color={resolvedIconColor} />
        </View>
        <Text style={{ flex: 1, fontSize: 14, fontFamily: typography.fontFamily.medium, color: textColor, marginLeft: 13 }}>
          {label}
        </Text>
        {value && (
          <Text style={{ fontSize: 13, fontFamily: typography.fontFamily.regular, color: colors.textMuted }}>
            {value}
          </Text>
        )}
        {rightEl}
        {showEditIcon && (
          <Ionicons name="pencil-outline" size={14} color={colors.primary} style={{ marginLeft: 8 }} />
        )}
        {onPress && !showEditIcon && !isDestructive && (
          <Ionicons name="chevron-forward" size={16} color={colors.border} style={{ marginLeft: 8 }} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper edges={['top', 'left', 'right']}>
      <ScreenHeader title="My Profile" showBack={false} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* ── Profile Hero — name left, avatar right ── */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={[styles.heroSection, { backgroundColor: colors.background }]}
        >
          {/* Left — name & baptismal */}
          <View style={styles.heroLeft}>
            <Text style={[styles.heroName, { color: colors.text, fontFamily: typography.fontFamily.extraBold }]}>
              {user?.fullName ?? 'Parishioner'}
            </Text>
            {user?.baptismalName && (
              <Text style={[styles.heroBaptismal, { color: colors.textMuted, fontFamily: typography.fontFamily.regular }]}>
                Baptismal: {user.baptismalName}
              </Text>
            )}

            {/* Badges row — lives under the name */}
            <Animated.View entering={FadeInDown.delay(160).duration(400)} style={styles.badgesRow}>
              {joinedGroups.map((g) => {
                const meta = getGroupMetadata(g.name);
                return (
                  <View key={g.id} style={[styles.heroBadge, { backgroundColor: meta.color + '20', borderColor: meta.color + '70' }]}>
                    <Text style={[styles.heroBadgeText, { color: meta.color, fontFamily: typography.fontFamily.bold }]}>
                      {meta.shortName}
                    </Text>
                  </View>
                );
              })}
              {user?.role === 'parish_admin' && (
                <View style={[styles.heroBadge, { backgroundColor: colors.dangerBg, borderColor: colors.danger + '60' }]}>
                  <Text style={[styles.heroBadgeText, { color: colors.danger, fontFamily: typography.fontFamily.bold }]}>
                    Admin
                  </Text>
                </View>
              )}
              <View style={[styles.heroBadge, { backgroundColor: colors.primaryLight, borderColor: colors.primary + '40' }]}>
                <Text style={[styles.heroBadgeText, { color: colors.primary, fontFamily: typography.fontFamily.medium }]}>
                  {user?.hasParishAccess && user.parishName ? user.parishName : 'Unassigned'}
                </Text>
              </View>
            </Animated.View>
          </View>

          {/* Right — Avatar */}
          <Animated.View entering={ZoomIn.springify().damping(14)} style={styles.heroRight}>
            <Avatar
              name={user?.fullName ?? 'User'}
              size={80}
              ring={primaryGroupColor}
            />
          </Animated.View>
        </Animated.View>

        {/* Subtle separator before settings */}
        <View style={[styles.separator, { backgroundColor: colors.divider }]} />

        {/* ── Settings Content ── */}
        <View style={{ paddingHorizontal: 20 }}>

          {/* Personal Details */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.semiBold }]}>
              Personal Details
            </Text>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <SettingRow
                icon="mail-outline"
                label="Email"
                value={user?.email}
                showEditIcon
                onPress={() => router.push('/(modals)/edit-email')}
              />
              <SettingRow
                icon="calendar-outline"
                label="Birthday Month"
                value={user?.birthdayMonth}
                showEditIcon
                onPress={() => router.push('/(modals)/edit-birthday')}
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

          {/* Security */}
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

          {/* Preferences */}
          <Animated.View entering={FadeInDown.delay(220).duration(400)}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.semiBold }]}>
              App Preferences
            </Text>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <SettingRow
                icon="notifications-outline"
                label="Push Notifications"
                rightEl={
                  <Switch
                    value={true}
                    onValueChange={() => {}}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#FFFFFF"
                  />
                }
              />
              <SettingRow
                icon="moon-outline"
                label="Dark Mode"
                iconBgColor={isDark ? 'rgba(255,255,255,0.10)' : colors.primaryLight}
                iconColor={isDark ? '#FFFFFF' : colors.primary}
                rightEl={
                  <Switch
                    value={colorMode === 'dark' || (colorMode === 'system' && isDark)}
                    onValueChange={(val) => setColorMode(val ? 'dark' : 'light')}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#FFFFFF"
                  />
                }
              />
            </View>
          </Animated.View>

          {/* Transitions */}
          <Animated.View entering={FadeInDown.delay(280).duration(400)}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.semiBold }]}>
              Transitions & Administration
            </Text>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <SettingRow
                icon="swap-horizontal-outline"
                label="Request Group Transition"
                onPress={() => router.push('/(modals)/group-transition-request')}
              />
              {user?.role === 'parish_admin' && (
                <SettingRow
                  icon="settings-outline"
                  label="Admin Dashboard"
                  onPress={() => router.push('/(admin)')}
                />
              )}
            </View>
          </Animated.View>

          {/* Logout */}
          <Animated.View entering={FadeInDown.delay(340).duration(400)} style={styles.footerActions}>
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

            <TouchableOpacity onPress={() => {}} style={styles.deleteBtn}>
              <Text style={{ fontSize: 13, fontFamily: typography.fontFamily.medium, color: colors.textMuted }}>
                Delete Account
              </Text>
            </TouchableOpacity>
          </Animated.View>

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
  heroBaptismal: {
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
  deleteBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 4,
  },
});
