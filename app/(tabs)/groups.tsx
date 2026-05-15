import React, { useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { OPEN_GROUPS, SECURED_GROUPS } from '@/constants/groups';
import { MOCK_GROUP_UPDATES, GROUP_MEETING_TIMES } from '@/constants/mockData';

export default function GroupsScreen() {
  const { colors, typography, radius } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const myGroup = OPEN_GROUPS.find((g) => g.id === user?.groupId);
  const myUpdates = MOCK_GROUP_UPDATES.filter((u) => u.groupId === user?.groupId);
  const meetingTimes = myGroup ? (GROUP_MEETING_TIMES[myGroup.id] ?? []) : [];

  // Expandable update bodies
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const toggleExpand = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <ScreenWrapper edges={['top', 'left', 'right']}>

      <ScreenHeader 
        title="Community & Groups" 
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {myGroup ? (
          <TouchableOpacity 
            activeOpacity={0.9}
            onPress={() => router.push('/(modals)/group-chat')}
            style={[styles.featuredCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}
          >

            {/* Group hero strip */}
            <LinearGradient
              colors={[myGroup.color, myGroup.color + 'BB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.heroStrip, { borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg }]}
            >
              {/* Cross watermark */}
              <View style={styles.crossWrap} pointerEvents="none">
                <View style={styles.crossV} />
                <View style={styles.crossH} />
              </View>

              {/* Badge top-right */}
              <View style={styles.myGroupBadge}>
                <Ionicons name="star" size={10} color={myGroup.color} />
                <Text style={{ fontSize: 10, fontFamily: typography.fontFamily.bold, color: myGroup.color, marginLeft: 4 }}>
                  My Group
                </Text>
              </View>

              {/* Icon + name */}
              <View style={[styles.heroIcon, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
                <Ionicons name={myGroup.icon as any} size={32} color="#FFFFFF" />
              </View>
              <Text style={{ fontSize: 18, fontFamily: typography.fontFamily.extraBold, color: '#FFFFFF', marginTop: 12, textAlign: 'center' }}>
                {myGroup.name}
              </Text>
              <Text style={{ fontSize: 12, fontFamily: typography.fontFamily.semiBold, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}>
                {myGroup.shortName}
              </Text>
            </LinearGradient>

            {/* Meeting times */}
            {meetingTimes.length > 0 && (
              <View style={[styles.meetingRow, { borderBottomColor: colors.divider }]}>
                <Ionicons name="time-outline" size={13} color={colors.primary} />
                <Text style={{ fontSize: 11, fontFamily: typography.fontFamily.semiBold, color: colors.primary, marginLeft: 5, marginRight: 10, letterSpacing: 0.3 }}>
                  Meetings
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {meetingTimes.map((t) => (
                    <View key={t} style={[styles.timeChip, { backgroundColor: colors.primaryLight }]}>
                      <Text style={{ fontSize: 11, fontFamily: typography.fontFamily.medium, color: colors.primary }}>{t}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Updates feed */}
            <View style={styles.updatesSection}>
              {/* Feed header */}
              <View style={[styles.feedHeader, { borderBottomColor: colors.divider }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="newspaper-outline" size={13} color={colors.primary} />
                  <Text style={{ fontSize: 12, fontFamily: typography.fontFamily.semiBold, color: colors.primary, letterSpacing: 0.3 }}>
                    Latest Updates
                  </Text>
                </View>
                <View style={styles.readOnlyChip}>
                  <Ionicons name="lock-closed" size={10} color={colors.textMuted} />
                  <Text style={{ fontSize: 10, fontFamily: typography.fontFamily.medium, color: colors.textMuted, marginLeft: 4 }}>
                    Admin posts only
                  </Text>
                </View>
              </View>

              {/* Update items */}
              {myUpdates.length === 0 ? (
                <View style={styles.emptyUpdates}>
                  <Ionicons name="chatbubble-ellipses-outline" size={28} color={colors.border} />
                  <Text style={{ fontSize: 13, fontFamily: typography.fontFamily.regular, color: colors.textMuted, marginTop: 8 }}>
                    No updates yet
                  </Text>
                </View>
              ) : (
                myUpdates.map((update, i) => {
                  const expanded = expandedIds.has(update.id);
                  const isLast = i === myUpdates.length - 1;
                  return (
                    <View
                      key={update.id}
                      style={[
                        styles.updateItem,
                        {
                          borderBottomColor: colors.divider,
                          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
                        },
                      ]}
                    >
                      <View style={styles.updateHeader}>
                        <Text style={{ flex: 1, fontSize: 14, fontFamily: typography.fontFamily.bold, color: colors.text }}>
                          {update.title}
                        </Text>
                        <View style={[styles.dateBadge, { backgroundColor: colors.surfaceMuted }]}>
                          <Text style={{ fontSize: 10, fontFamily: typography.fontFamily.regular, color: colors.textMuted }}>
                            {update.date}
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={{ fontSize: 13, fontFamily: typography.fontFamily.regular, color: colors.textSecondary, marginTop: 6, lineHeight: 20 }}
                        numberOfLines={expanded ? undefined : 2}
                      >
                        {update.body}
                      </Text>
                      <View style={styles.updateFooter}>
                        <Text style={{ fontSize: 11, fontFamily: typography.fontFamily.regular, color: colors.textMuted }}>
                          — {update.author}
                        </Text>
                        <TouchableOpacity onPress={() => toggleExpand(update.id)}>
                          <Text style={{ fontSize: 11, fontFamily: typography.fontFamily.semiBold, color: colors.primary }}>
                            {expanded ? 'Show less' : 'Read more'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </TouchableOpacity>
        ) : (
          /* No group assigned */
          <Card elevation="sm" style={[styles.noGroupCard, { borderRadius: radius.lg }]}>
            <Ionicons name="people-outline" size={32} color={colors.border} />
            <Text style={{ fontSize: 15, fontFamily: typography.fontFamily.semiBold, color: colors.text, marginTop: 12 }}>
              No Group Assigned
            </Text>
            <Text style={{ fontSize: 13, fontFamily: typography.fontFamily.regular, color: colors.textSecondary, marginTop: 6, textAlign: 'center', lineHeight: 20 }}>
              You haven't been assigned to a church group yet. Contact the parish office for assistance.
            </Text>
          </Card>
        )}

        {/* ════════════════════════════════════════════════════
            SECURED GROUPS DIVIDER
        ════════════════════════════════════════════════════ */}
        <View style={styles.dividerSection}>
          <Divider />
          <View style={[styles.dividerLabel, { backgroundColor: colors.background }]}>
            <Ionicons name="lock-closed" size={12} color={colors.textMuted} />
            <Text style={{ fontSize: 11, fontFamily: typography.fontFamily.semiBold, color: colors.textMuted, marginLeft: 6, letterSpacing: 0.8, textTransform: 'uppercase' }}>
              Secured Groups
            </Text>
          </View>
        </View>
        <Text style={{ fontSize: 13, fontFamily: typography.fontFamily.regular, color: colors.textMuted, marginBottom: 14, lineHeight: 19 }}>
          These groups require admin approval to join. Tap a group to submit your request.
        </Text>

        {/* ════════════════════════════════════════════════════
            SECURED GROUPS LIST
        ════════════════════════════════════════════════════ */}
        {SECURED_GROUPS.map((group, i) => (
          <TouchableOpacity
            key={group.id}
            activeOpacity={0.75}
            onPress={() => router.push({ pathname: '/(modals)/group-access-request', params: { groupId: group.id } })}
            style={[
              styles.lockedRow,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderLeftColor: group.color,
                borderRadius: radius.md,
                marginBottom: i < SECURED_GROUPS.length - 1 ? 10 : 0,
              },
            ]}
          >
            {/* Icon */}
            <View style={[styles.lockedIcon, { backgroundColor: group.color + '18' }]}>
              <Ionicons name={group.icon as any} size={20} color={group.color} />
            </View>

            {/* Text */}
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontSize: 14, fontFamily: typography.fontFamily.bold, color: colors.text }}>
                {group.name}
              </Text>
              <Text style={{ fontSize: 12, fontFamily: typography.fontFamily.regular, color: colors.textSecondary, marginTop: 2 }} numberOfLines={1}>
                {group.description}
              </Text>
            </View>

            {/* Right side */}
            <View style={styles.lockedRight}>
              <View style={[styles.approvalChip, { backgroundColor: colors.warningBg }]}>
                <Ionicons name="lock-closed" size={9} color={colors.warning} />
                <Text style={{ fontSize: 9, fontFamily: typography.fontFamily.semiBold, color: colors.warning, marginLeft: 3 }}>
                  Approval Required
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color={colors.border} style={{ marginTop: 4 }} />
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 28 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  // Scroll
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  // Featured card
  featuredCard: { borderWidth: 1, overflow: 'hidden', marginBottom: 28 },

  // Hero strip
  heroStrip: {
    paddingTop: 22, paddingBottom: 24, paddingHorizontal: 20,
    alignItems: 'center', position: 'relative', overflow: 'hidden',
  },
  crossWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  crossV: { position: 'absolute', width: 30, top: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.06)' },
  crossH: { position: 'absolute', height: 30, left: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.06)' },
  myGroupBadge: {
    position: 'absolute', top: 12, right: 12,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: 20,
  },
  heroIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },

  // Meeting times
  meetingRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  timeChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },

  // Updates feed
  updatesSection: {},
  feedHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  readOnlyChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 12,
  },
  emptyUpdates: { alignItems: 'center', paddingVertical: 24 },
  updateItem: { paddingHorizontal: 14, paddingVertical: 14 },
  updateHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  dateBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  updateFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8,
  },

  // No group
  noGroupCard: { alignItems: 'center', padding: 28, marginBottom: 28 },

  // Divider section
  dividerSection: { position: 'relative', marginBottom: 12 },
  dividerLabel: {
    position: 'absolute', top: -9, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 2,
  },

  // Locked row
  lockedRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, borderWidth: 1, borderLeftWidth: 3,
  },
  lockedIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  lockedRight: { alignItems: 'flex-end', marginLeft: 8 },
  approvalChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10,
  },
});
