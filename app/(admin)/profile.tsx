import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
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
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        <Text style={{ flex: 1, fontSize: 14, fontFamily: typography.fontFamily.medium, color: textColor, marginLeft: 12 }}>
          {label}
        </Text>
        {value && <Text style={{ fontSize: 13, fontFamily: typography.fontFamily.regular, color: colors.textMuted }}>{value}</Text>}
        {rightEl}
        {onPress && !isDestructive && <Ionicons name="chevron-forward" size={16} color={colors.border} style={{ marginLeft: 8 }} />}
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper edges={['top', 'left', 'right']}>
      <ScreenHeader title="Admin Settings" />
      
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* ── Admin Identity ── */}
        <View style={styles.identitySection}>
          <Avatar name={user?.fullName ?? 'Admin'} size={80} />
          <Text style={[styles.adminName, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
            {user?.fullName}
          </Text>
          <View style={[styles.roleBadge, { backgroundColor: colors.dangerBg }]}>
            <Text style={{ fontSize: 11, color: colors.danger, fontFamily: typography.fontFamily.bold }}>
              {user?.role === 'parish_admin' ? 'PARISH PRIEST' : 'SECRETARY'}
            </Text>
          </View>
        </View>

        {/* ── Parish Configuration ── */}
        <Text style={[styles.sectionLabel, { fontFamily: typography.fontFamily.semiBold, color: colors.textMuted }]}>
          Parish Configuration
        </Text>
        <Card elevation="sm" style={styles.card}>
          <SettingRow 
            icon="book-outline" 
            label="Edit Parish History" 
            onPress={() => router.push('/(modals)/edit-parish-history')} 
          />
          <SettingRow 
            icon="people-circle-outline" 
            label="Manage Groups" 
            onPress={() => router.push('/(modals)/manage-groups')} 
          />
        </Card>

        {/* ── System & UI ── */}
        <Text style={[styles.sectionLabel, { fontFamily: typography.fontFamily.semiBold, color: colors.textMuted }]}>
          System
        </Text>
        <Card elevation="sm" style={styles.card}>
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
        </Card>

        {/* ── Account ── */}
        <Text style={[styles.sectionLabel, { fontFamily: typography.fontFamily.semiBold, color: colors.textMuted }]}>
          Account
        </Text>
        <Card elevation="sm" style={styles.card}>
          <SettingRow 
            icon="log-out-outline" 
            label="Log Out" 
            isDestructive 
            onPress={logout} 
          />
        </Card>

        <View style={styles.footerInfo}>
          <Text style={{ fontSize: 12, color: colors.textMuted, fontFamily: typography.fontFamily.medium }}>
            ChurchLife Admin • Version 1.0.0
          </Text>
        </View>

      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  identitySection: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  adminName: {
    fontSize: 20,
    marginTop: 16,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  sectionLabel: { 
    fontSize: 11, 
    letterSpacing: 1.2, 
    textTransform: 'uppercase', 
    marginBottom: 8, 
    marginTop: 12,
    marginLeft: 4,
  },
  card: { marginBottom: 20, padding: 0, overflow: 'hidden' },
  settingRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 14, 
    borderBottomWidth: StyleSheet.hairlineWidth 
  },
  settingIcon: { 
    width: 34, 
    height: 34, 
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  footerInfo: {
    alignItems: 'center',
    marginTop: 24,
    opacity: 0.5,
  },
});
