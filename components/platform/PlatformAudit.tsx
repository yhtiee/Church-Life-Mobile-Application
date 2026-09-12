import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { Card } from '@/components/ui/Card';
import { useAuditLogQuery } from '@/hooks/queries/usePlatform';

const ACTION_LABELS: Record<string, string> = {
  'parish.create': 'created a parish',
  'parish.update': 'updated a parish',
  'admin.grant': 'made someone a parish admin',
  'admin.revoke': 'removed parish admin access',
  'member.move': 'moved a member to another parish',
  'superadmin.grant': 'granted platform access',
  'superadmin.revoke': 'revoked platform access',
  'group.create': 'created a group',
  'group.update': 'updated a group',
};

const ACTION_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  parish: 'business-outline',
  profile: 'person-outline',
  group: 'albums-outline',
};

/** A record of who changed what across the platform. */
export function PlatformAudit() {
  const { colors, typography, radius } = useTheme();
  const { data: entries = [], isLoading } = useAuditLogQuery();

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Text
        style={{
          fontSize: 13,
          color: colors.textMuted,
          fontFamily: typography.fontFamily.regular,
          lineHeight: 20,
          marginBottom: 14,
        }}
      >
        Every platform action is recorded here. Entries are written by the database itself, so they
        cannot be forged or edited from the app.
      </Text>

      {entries.map((entry, index) => (
        <Animated.View key={entry.id} entering={FadeInDown.delay(index * 20).duration(300)}>
          <Card elevation="sm" style={{ padding: 14, borderRadius: radius.lg, marginBottom: 8 }}>
            <View style={styles.row}>
              <Ionicons
                name={ACTION_ICONS[entry.target_type ?? ''] ?? 'ellipse-outline'}
                size={18}
                color={colors.primary}
              />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.text,
                    fontFamily: typography.fontFamily.medium,
                    lineHeight: 20,
                  }}
                >
                  <Text style={{ fontFamily: typography.fontFamily.bold }}>
                    {entry.actor_name?.trim() || 'Someone'}
                  </Text>{' '}
                  {ACTION_LABELS[entry.action] ?? entry.action}
                  {entry.detail?.name ? ` — ${entry.detail.name}` : ''}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textMuted,
                    fontFamily: typography.fontFamily.regular,
                    marginTop: 3,
                  }}
                >
                  {new Date(entry.created_at).toLocaleString()}
                </Text>
              </View>
            </View>
          </Card>
        </Animated.View>
      ))}

      {!isLoading && entries.length === 0 && (
        <Text
          style={{
            fontSize: 14,
            color: colors.textMuted,
            fontFamily: typography.fontFamily.regular,
            textAlign: 'center',
            marginTop: 40,
          }}
        >
          Nothing recorded yet.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 60 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
});
