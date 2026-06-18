import React, { useState, useRef } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { getGroupMetadata } from '@/constants/groups';
import { useGroupsQuery } from '@/hooks/queries/useGroups';
import { useJoinOpenGroupMutation } from '@/hooks/mutations/useGroups';
import { useAlert } from '@/context/FeedbackContext';

export default function GroupsScreen() {
  const { colors, typography, radius } = useTheme();
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const { showAlert } = useAlert();

  const { data: groups = [], isLoading, refetch, isRefetching } = useGroupsQuery();
  const { mutateAsync: joinOpenGroup } = useJoinOpenGroupMutation();

  // Separate groups by membership and type
  const myGroups = groups.filter((g) => user?.id && g.member_ids?.includes(user.id));
  const openGroups = groups.filter((g) => !g.is_secure && !(user?.id && g.member_ids?.includes(user.id)));
  const securedGroups = groups.filter((g) => g.is_secure);

  const handleJoinGroup = (group: any) => {
    if (!user?.id) return;
    showAlert({
      title: `Join ${group.name}?`,
      message: `Are you sure you want to join this group?`,
      type: 'success',
      buttonLabel: 'Yes, Join',
      onPress: async () => {
        try {
          await joinOpenGroup({
            userId: user.id,
            groupId: group.id,
          });
          showAlert({
            title: 'Welcome!',
            message: `You are now a member of ${group.name}.`,
            type: 'success',
          });
        } catch (err: any) {
          showAlert({
            title: 'Failed to Join',
            message: err.message || 'An error occurred. Please try again.',
            type: 'error',
          });
        }
      },
      secondaryButtonLabel: 'Cancel',
      onSecondaryPress: () => {},
    });
  };

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const toggleExpand = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  return (
    <ScreenWrapper edges={['top', 'left', 'right']}>
      <ScreenHeader title="Community & Groups" showBack={false} />

      <ScrollView
        contentContainerStyle={[styles.scroll, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* ── My Groups Section ── */}
        {!isLoading && myGroups.length > 0 && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <View style={styles.myGroupsHeader}>
              <View style={styles.myGroupsHeaderContent}>
                <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                <Text style={[styles.sectionLabel, { color: colors.primary, fontFamily: typography.fontFamily.bold, margin: 0, lineHeight: 18 }]}>
                  My Groups
                </Text>
              </View>
              <Text style={[styles.myGroupsCount, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                {myGroups.length}
              </Text>
            </View>

            {myGroups.map((group, i) => {
              const meta = getGroupMetadata(group.name);
              return (
                <Animated.View key={group.id} entering={FadeInDown.delay(i * 40).duration(350)}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      router.push({
                        pathname: '/(modals)/group-chat',
                        params: { groupId: group.id, groupName: group.name },
                      })
                    }
                    style={[
                      styles.groupRow,
                      {
                        backgroundColor: colors.primaryLight,
                        borderColor: colors.primary,
                        borderWidth: 2,
                        borderRadius: radius.md,
                        marginBottom: i < myGroups.length - 1 ? 10 : 16,
                      },
                    ]}
                  >
                    {/* Left — colored icon square */}
                    <View style={[styles.groupIconBox, { backgroundColor: meta.color + '18' }]}>
                      <Ionicons name={meta.icon as any} size={22} color={meta.color} />
                    </View>

                    {/* Middle — name & description */}
                    <View style={styles.groupMeta}>
                      <Text style={[styles.groupName, { color: colors.text, fontFamily: typography.fontFamily.bold }]} numberOfLines={2}>
                        {group.name}
                      </Text>
                      <Text style={[styles.groupDesc, { color: colors.textMuted, fontFamily: typography.fontFamily.regular }]} numberOfLines={1}>
                        {group.description}
                      </Text>
                    </View>

                    {/* Right — Clickable hint (arrow) */}
                    <View style={styles.clickHintContainer}>
                      <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </Animated.View>
        )}

        {/* ── Open Groups section label ── */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.semiBold, marginTop: myGroups.length > 0 ? 24 : 0 }]}>
          Open Groups
        </Text>

        {/* ── Open Groups list ── */}
        {isLoading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <Text style={{ color: colors.textSecondary, fontFamily: typography.fontFamily.regular }}>Loading open groups...</Text>
          </View>
        ) : openGroups.length === 0 ? (
          <View style={[styles.noGroupCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="people-outline" size={36} color={colors.textMuted} />
            <Text style={[styles.noGroupTitle, { color: colors.text, fontFamily: typography.fontFamily.bold, marginTop: 12 }]}>
              No Open Groups
            </Text>
            <Text style={[styles.noGroupBody, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
              There are no open groups available at the moment.
            </Text>
          </View>
        ) : (
          openGroups.map((group, i) => {
            const isLast = i === openGroups.length - 1;
            const meta = getGroupMetadata(group.name);

            return (
              <Animated.View key={group.id} entering={FadeInDown.delay(i * 60).duration(400)}>
                <TouchableOpacity
                  activeOpacity={0.78}
                  onPress={() => handleJoinGroup(group)}
                  style={[
                    styles.groupRow,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderRadius: radius.md,
                      marginBottom: isLast ? 0 : 10,
                    },
                  ]}
                >
                  {/* Left — colored icon square */}
                  <View style={[styles.groupIconBox, { backgroundColor: meta.color + '18' }]}>
                    <Ionicons name={meta.icon as any} size={22} color={meta.color} />
                  </View>

                  {/* Middle — name & description */}
                  <View style={styles.groupMeta}>
                    <Text style={[styles.groupName, { color: colors.text, fontFamily: typography.fontFamily.bold }]} numberOfLines={2}>
                      {group.name}
                    </Text>
                    <Text style={[styles.groupDesc, { color: colors.textMuted, fontFamily: typography.fontFamily.regular }]} numberOfLines={1}>
                      {group.description}
                    </Text>
                  </View>

                  {/* Right — Join action with clickable hint */}
                  <View style={styles.actionHintContainer}>
                    <View style={[styles.joinPill, { backgroundColor: meta.color + '18', borderColor: meta.color + '40' }]}>
                      <Text style={[styles.joinText, { color: meta.color, fontFamily: typography.fontFamily.semiBold }]}>
                        Join
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} style={styles.hintArrow} />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })
        )}

        {/* ── No group assigned state ── */}
        {/* {!myGroup && !isLoading && (
          <Animated.View
            entering={ZoomIn.duration(400)}
            style={[styles.noGroupCard, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 16 }]}
          >
            <View style={[styles.noGroupIconCircle, { backgroundColor: colors.surfaceMuted }]}>
              <Ionicons name="people-outline" size={36} color={colors.textMuted} />
            </View>
            <Text style={[styles.noGroupTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
              No Group Assigned
            </Text>
            <Text style={[styles.noGroupBody, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
              {`You haven't been assigned to a church group yet. Contact the parish office for assistance.`}
            </Text>
          </Animated.View>
        )} */}

        {/* ── Secured Groups ── */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.semiBold, marginTop: 28 }]}>
          Secured Groups
        </Text>
        <Text style={[styles.securedSubtext, { color: colors.textMuted, fontFamily: typography.fontFamily.regular }]}>
          These groups require admin approval to join.
        </Text>

        {isLoading ? (
          <View style={{ paddingVertical: 20, alignItems: 'center' }}>
            <Text style={{ color: colors.textSecondary, fontFamily: typography.fontFamily.regular }}>Loading secured groups...</Text>
          </View>
        ) : securedGroups.length === 0 ? (
          <View style={[styles.noGroupCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="lock-closed-outline" size={36} color={colors.textMuted} />
            <Text style={[styles.noGroupTitle, { color: colors.text, fontFamily: typography.fontFamily.bold, marginTop: 12 }]}>
              No Secured Groups
            </Text>
            <Text style={[styles.noGroupBody, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
              There are no secured groups available at the moment.
            </Text>
          </View>
        ) : (
          securedGroups.map((group, i) => {
            const meta = getGroupMetadata(group.name);
            return (
              <Animated.View key={group.id} entering={FadeInDown.delay(i * 80).duration(400)}>
                <TouchableOpacity
                  activeOpacity={0.78}
                  onPress={() =>
                    router.push({
                      pathname: '/(modals)/group-access-request',
                      params: { groupId: group.id },
                    })
                  }
                  style={[
                    styles.groupRow,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderRadius: radius.md,
                      marginBottom: i < securedGroups.length - 1 ? 10 : 0,
                    },
                  ]}
                >
                  {/* Left — colored icon square */}
                  <View style={[styles.groupIconBox, { backgroundColor: meta.color + '18' }]}>
                    <Ionicons name={meta.icon as any} size={22} color={meta.color} />
                  </View>

                  {/* Middle — name & description */}
                  <View style={styles.groupMeta}>
                    <Text style={[styles.groupName, { color: colors.text, fontFamily: typography.fontFamily.bold }]} numberOfLines={1}>
                      {group.name}
                    </Text>
                    <Text style={[styles.groupDesc, { color: colors.textMuted, fontFamily: typography.fontFamily.regular }]} numberOfLines={1}>
                      {group.description}
                    </Text>
                  </View>

                  {/* Right — Approval chip */}
                  <View style={[styles.approvalChip, { backgroundColor: colors.warningBg }]}>
                    <Ionicons name="lock-closed" size={9} color={colors.warning} />
                    <Text style={[styles.approvalText, { color: colors.warning, fontFamily: typography.fontFamily.semiBold }]}>
                      Approval
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })
        )}

        <View style={{ height: 28 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 120 },

  // ── My Groups Header ───────────────────────────────────────────────────────
  myGroupsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  myGroupsHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 24,
  },
  myGroupsCount: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  // ── Header action ──────────────────────────────────────────────────────────
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  createBtnText: {
    fontSize: 13,
  },

  // ── Section label ──────────────────────────────────────────────────────────
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  // ── Group row (both open & secured) ───────────────────────────────────────
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
  },
  groupIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  groupMeta: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  groupName: {
    fontSize: 14,
    lineHeight: 20,
  },
  groupDesc: {
    fontSize: 12,
    marginTop: 2,
  },

  // Join / Joined pills & clickable hints
  joinedPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    flexShrink: 0,
  },
  joinedText: {
    fontSize: 12,
  },
  joinPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    flexShrink: 0,
  },
  joinText: {
    fontSize: 12,
  },
  actionHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clickHintContainer: {
    marginLeft: 4,
    flexShrink: 0,
  },
  hintArrow: {
    opacity: 0.5,
  },

  // ── My Group expanded detail blocks ───────────────────────────────────────
  detailBlock: {
    marginTop: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  detailLabel: {
    fontSize: 11,
    letterSpacing: 0.3,
  },
  timeChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  timeChipText: {
    fontSize: 11,
  },

  // Feed
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  feedHeaderText: {
    fontSize: 12,
    letterSpacing: 0.2,
  },
  readOnlyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  readOnlyText: {
    fontSize: 10,
  },
  emptyUpdates: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  emptyText: {
    fontSize: 13,
    marginTop: 8,
  },

  // Update items
  updateItem: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  updateHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  updateTitle: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  dateBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dateBadgeText: {
    fontSize: 10,
  },
  updateBody: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
  updateFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  updateAuthor: {
    fontSize: 11,
  },
  readMore: {
    fontSize: 11,
  },

  // No group assigned
  noGroupCard: {
    alignItems: 'center',
    padding: 36,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 28,
  },
  noGroupIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  noGroupTitle: {
    fontSize: 17,
    marginBottom: 8,
  },
  noGroupBody: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Secured groups
  securedSubtext: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 19,
  },
  approvalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
    flexShrink: 0,
  },
  approvalText: {
    fontSize: 10,
  },
});
