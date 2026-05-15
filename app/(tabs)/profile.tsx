import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { OPEN_GROUPS } from '@/constants/groups';

export default function ProfileScreen() {
  const { colors, typography, radius, isDark, setColorMode, colorMode } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();

  const group = OPEN_GROUPS.find((g) => g.id === user?.groupId);

  const SettingRow = ({
    icon, label, value, onPress, rightEl, showEditIcon, isDestructive,
  }: { 
    icon: any; label: string; value?: string; onPress?: () => void; 
    rightEl?: React.ReactNode; showEditIcon?: boolean; isDestructive?: boolean;
  }) => {
    const textColor = isDestructive ? colors.danger : colors.text;
    const iconColor = isDestructive ? colors.danger : colors.primary;
    const iconBg = isDestructive ? colors.dangerBg : colors.primaryLight;

    return (
      <TouchableOpacity 
        onPress={onPress} 
        disabled={!onPress && !rightEl && !showEditIcon} 
        style={[styles.settingRow, { borderBottomColor: colors.divider }]} 
        activeOpacity={onPress || showEditIcon ? 0.7 : 1}
      >
        <View style={[styles.settingIcon, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        <Text style={{ flex: 1, fontSize: 14, fontFamily: typography.fontFamily.medium, color: textColor, marginLeft: 12 }}>
          {label}
        </Text>
        {value && <Text style={{ fontSize: 13, fontFamily: typography.fontFamily.regular, color: colors.textMuted }}>{value}</Text>}
        {rightEl}
        {showEditIcon && <Ionicons name="pencil-outline" size={16} color={colors.border} style={{ marginLeft: 8 }} />}
        {onPress && !showEditIcon && !isDestructive && <Ionicons name="chevron-forward" size={16} color={colors.border} style={{ marginLeft: 8 }} />}
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper edges={['top', 'left', 'right']}>
      {/* ── Profile Header ── */}
      <LinearGradient
        colors={['#0A1929', '#1D3557']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerBg}
      >
        <Avatar name={user?.fullName ?? 'User'} size={80} />
        <Text style={{ fontSize: 20, fontFamily: typography.fontFamily.bold, color: '#FFFFFF', marginTop: 12 }}>
          {user?.fullName}
        </Text>
        {user?.baptismalName && (
          <Text style={{ fontSize: 13, fontFamily: typography.fontFamily.regular, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
            Baptismal Name: {user.baptismalName}
          </Text>
        )}
        <View style={styles.badgeRow}>
          {group && <Badge label={group.shortName} variant="accent" size="sm" />}
          {user?.role === 'parish_admin' && <Badge label="Admin" variant="danger" size="sm" />}
          <Badge label={user?.hasParishAccess && user.parishName ? user.parishName : 'Unassigned'} variant="muted" size="sm" />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* ── Personal Details ── */}
        <Text style={[styles.sectionLabel, { fontFamily: typography.fontFamily.semiBold, color: colors.textMuted }]}>
          Personal Details
        </Text>
        <Card elevation="sm" style={styles.card}>
          <SettingRow icon="mail-outline" label="Email" value={user?.email} showEditIcon onPress={() => router.push('/(modals)/edit-email')} />
          <SettingRow icon="calendar-outline" label="Birthday Month" value={user?.birthdayMonth} showEditIcon onPress={() => router.push('/(modals)/edit-birthday')} />
          <SettingRow icon="male-female-outline" label="Sex" value={user?.sex} />
          <SettingRow icon="location-outline" label="Parish" value={user?.parishName ?? 'Not assigned'} />
        </Card>

        {/* ── Security ── */}
        <Text style={[styles.sectionLabel, { fontFamily: typography.fontFamily.semiBold, color: colors.textMuted }]}>
          Security
        </Text>
        <Card elevation="sm" style={styles.card}>
          <SettingRow icon="lock-closed-outline" label="Change Password" onPress={() => router.push('/(modals)/change-password')} />
        </Card>

        {/* ── App Preferences ── */}
        <Text style={[styles.sectionLabel, { fontFamily: typography.fontFamily.semiBold, color: colors.textMuted }]}>
          App Preferences
        </Text>
        <Card elevation="sm" style={styles.card}>
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
            rightEl={
              <Switch
                value={colorMode === 'dark' || (colorMode === 'system' && isDark)}
                onValueChange={(val) => setColorMode(val ? 'dark' : 'light')}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </Card>

        {/* ── Transitions & Administration ── */}
        <Text style={[styles.sectionLabel, { fontFamily: typography.fontFamily.semiBold, color: colors.textMuted }]}>
          Transitions & Administration
        </Text>
        <Card elevation="sm" style={styles.card}>
          <SettingRow 
            icon="swap-horizontal-outline" 
            label="Request Group Transition" 
            onPress={() => router.push('/(modals)/group-transition-request')} 
          />
          {user?.role === 'parish_admin' && (
            <SettingRow icon="settings-outline" label="Admin Dashboard" onPress={() => router.push('/(admin)')} />
          )}
        </Card>

        {/* ── Footer Actions ── */}
        <View style={styles.footerActions}>
          <TouchableOpacity
            onPress={logout}
            style={[styles.logoutBtn, { backgroundColor: colors.dangerBg, borderColor: colors.danger, borderRadius: radius.md }]}
          >
            <Ionicons name="log-out-outline" size={18} color={colors.danger} />
            <Text style={{ fontSize: 15, fontFamily: typography.fontFamily.semiBold, color: colors.danger, marginLeft: 8 }}>
              Log Out
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {}} style={styles.deleteBtn}>
            <Text style={{ fontSize: 13, fontFamily: typography.fontFamily.semiBold, color: colors.danger }}>
              Delete Account
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  headerBg: { paddingTop: 28, paddingBottom: 28, alignItems: 'center', paddingHorizontal: 24 },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  sectionLabel: { fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8, marginTop: 12 },
  card: { marginBottom: 16, padding: 0, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  settingIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  footerActions: { marginTop: 16 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderWidth: 1 },
  deleteBtn: { alignItems: 'center', justifyContent: 'center', padding: 16, marginTop: 4 },
});
