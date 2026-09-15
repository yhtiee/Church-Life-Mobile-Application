import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { PlatformParishes } from '@/components/platform/PlatformParishes';
import { PlatformPeople } from '@/components/platform/PlatformPeople';
import { PlatformGroups } from '@/components/platform/PlatformGroups';
import { PlatformAudit } from '@/components/platform/PlatformAudit';

type Section = 'parishes' | 'people' | 'groups' | 'activity';

const SECTIONS: { key: Section; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  // { key: 'parishes', label: 'Parishes', icon: 'business-outline' },
  { key: 'people', label: 'People', icon: 'people-outline' },
  { key: 'groups', label: 'Groups', icon: 'albums-outline' },
  { key: 'activity', label: 'Activity', icon: 'time-outline' },
];

/**
 * Platform administration.
 *
 * Gated on `is_super_admin`, which is separate from `role`: a platform
 * administrator is not automatically a parish admin and usually has no parish
 * of their own. The database functions behind every action check the same
 * flag, so this gate is presentation rather than the security boundary.
 */
export default function PlatformScreen() {
  const { colors, typography, radius } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [section, setSection] = useState<Section>('people');

  if (!user?.is_super_admin) {
    return (
      <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
        <ScreenHeader title="Platform" />
        <View style={styles.denied}>
          <Ionicons name="lock-closed-outline" size={40} color={colors.textMuted} />
          <Text
            style={{
              fontSize: 15,
              color: colors.textMuted,
              fontFamily: typography.fontFamily.regular,
              textAlign: 'center',
              marginTop: 12,
              lineHeight: 22,
            }}
          >
            This area is for platform administrators.
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
      <ScreenHeader title="Platform" />

      <View style={styles.tabsWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          {SECTIONS.map((s) => {
            const active = s.key === section;
            return (
              <TouchableOpacity
                key={s.key}
                onPress={() => setSection(s.key)}
                style={[
                  styles.tab,
                  {
                    borderRadius: radius.md,
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Ionicons
                  name={s.icon}
                  size={15}
                  color={active ? colors.textInverse : colors.textMuted}
                />
                <Text
                  style={{
                    fontSize: 13,
                    marginLeft: 6,
                    color: active ? colors.textInverse : colors.text,
                    fontFamily: active
                      ? typography.fontFamily.bold
                      : typography.fontFamily.medium,
                  }}
                >
                  {s.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <Animated.View key={section} entering={FadeInDown.duration(300)} style={{ flex: 1 }}>
        {/* {section === 'parishes' && <PlatformParishes />} */}
        {section === 'people' && <PlatformPeople />}
        {section === 'groups' && <PlatformGroups />}
        {section === 'activity' && <PlatformAudit />}
      </Animated.View>

      {/* Same switches the profile screens offer, so a super admin can move
          straight to either of the other views from here. */}
      <View style={[styles.switchBar, { borderTopColor: colors.border }]}>
        {user.role === 'parish_admin' && (
          <TouchableOpacity
            style={[styles.switchBtn, { borderColor: colors.border, borderRadius: radius.md }]}
            onPress={() => router.replace('/(admin)')}
          >
            <Ionicons name="settings-outline" size={16} color={colors.primary} />
            <Text
              style={{
                fontSize: 13,
                marginLeft: 6,
                color: colors.text,
                fontFamily: typography.fontFamily.semiBold,
              }}
            >
              Switch to Admin
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.switchBtn, { borderColor: colors.border, borderRadius: radius.md }]}
          onPress={() => router.replace('/(tabs)')}
        >
          <Ionicons name="apps-outline" size={16} color={colors.primary} />
          <Text
            style={{
              fontSize: 13,
              marginLeft: 6,
              color: colors.text,
              fontFamily: typography.fontFamily.semiBold,
            }}
          >
            Switch to Parishioner
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  tabsWrap: { paddingVertical: 6 },
  tabs: { paddingHorizontal: 20, gap: 8 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
  },
  denied: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  switchBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  switchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderWidth: 1,
  },
});
