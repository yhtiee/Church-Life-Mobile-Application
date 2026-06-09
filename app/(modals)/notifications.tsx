import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Input } from '@/components/ui/Input';
import { useNotificationsQuery } from '@/hooks/queries/useNotifications';
import {
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
} from '@/hooks/mutations/useNotifications';

type NotifType = 'giving' | 'announcement' | 'group' | 'system';

const TYPE_CONFIG: Record<NotifType, { icon: any; bg: string; color: string }> = {
  giving:       { icon: 'card-outline',         bg: '#D1FAE5', color: '#059669' },
  announcement: { icon: 'megaphone-outline',    bg: '#E8F0FE', color: '#2A6FDB' },
  group:        { icon: 'people-outline',       bg: '#FBF5DC', color: '#D4AF37' },
  system:       { icon: 'settings-outline',     bg: '#EDE9FE', color: '#7C3AED' },
};

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'giving', label: 'Giving' },
  { key: 'group', label: 'Groups' },
  { key: 'announcement', label: 'Liturgies' },
  { key: 'system', label: 'System' },
];

function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function NotificationsModal() {
  const { colors, typography, radius } = useTheme();
  const { user } = useAuth();
  const userId = user?.id || '';

  const { data: notifications = [], isLoading } = useNotificationsQuery(userId);

  const markReadMutation = useMarkNotificationReadMutation(userId);
  const markAllMutation = useMarkAllNotificationsReadMutation(userId);
  const deleteMutation = useDeleteNotificationMutation(userId);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => n.unread).length;
  }, [notifications]);

  const filteredNotifs = useMemo(() => {
    return notifications.filter((notif) => {
      // 1. Category Filter
      if (activeFilter === 'unread') {
        if (!notif.unread) return false;
      } else if (activeFilter !== 'all') {
        if (notif.type !== activeFilter) return false;
      }

      // 2. Search Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = notif.title?.toLowerCase().includes(query);
        const bodyMatch = notif.body?.toLowerCase().includes(query);
        return titleMatch || bodyMatch;
      }

      return true;
    });
  }, [notifications, activeFilter, searchQuery]);

  const rightEl = unreadCount > 0 ? (
    <TouchableOpacity
      onPress={() => markAllMutation.mutate()}
      disabled={markAllMutation.isPending}
      style={[styles.markReadBtn, { backgroundColor: colors.primaryLight }]}
    >
      <Text style={[styles.markReadText, { color: colors.primary, fontFamily: typography.fontFamily.semiBold }]}>
        {markAllMutation.isPending ? 'Marking...' : 'Mark all'}
      </Text>
    </TouchableOpacity>
  ) : null;

  return (
    <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
      <ScreenHeader title="Notifications" rightElement={rightEl} />
      
      {/* Search Input */}
      <Input
        placeholder="Search notifications..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        leftIcon="search-outline"
        containerStyle={{ marginHorizontal: 20, marginBottom: 12 }}
      />

      {/* Filter Tabs */}
      <View style={styles.filtersScroll}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {FILTER_TABS.map((tab) => {
            const isSelected = activeFilter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveFilter(tab.key)}
                style={[
                  styles.filterTab,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderRadius: radius.full,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.textSecondary,
                      fontFamily: isSelected ? typography.fontFamily.bold : typography.fontFamily.medium,
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View style={[styles.list, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {filteredNotifs.length === 0 ? (
              <View style={styles.empty}>
                <View style={[styles.emptyIconCircle, { backgroundColor: colors.surfaceMuted }]}>
                  <Ionicons name="notifications-off-outline" size={36} color={colors.textMuted} />
                </View>
                <Text style={[styles.emptyText, { color: colors.text, fontFamily: typography.fontFamily.semiBold }]}>
                  No notifications
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.textMuted, fontFamily: typography.fontFamily.regular }]}>
                  {searchQuery ? 'Try adjusting your search query.' : 'All caught up! Check back later.'}
                </Text>
              </View>
            ) : (
              filteredNotifs.map((notif, index) => {
                const cfg = TYPE_CONFIG[notif.type as NotifType] ?? TYPE_CONFIG.system;
                const isLast = index === filteredNotifs.length - 1;

                return (
                  <Animated.View
                    key={notif.id}
                    entering={FadeInDown.delay(index * 40 + 50).duration(350)}
                  >
                    <TouchableOpacity
                      style={[
                        styles.notifItem,
                        {
                          borderBottomColor: colors.divider,
                          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
                          backgroundColor: notif.unread ? colors.primaryLight + '12' : 'transparent',
                        },
                      ]}
                      onPress={() => notif.unread && markReadMutation.mutate(notif.id)}
                      activeOpacity={0.75}
                    >
                      {/* Left: unread indicator */}
                      {notif.unread && (
                        <View style={[styles.unreadLine, { backgroundColor: colors.primary }]} />
                      )}

                      {/* Icon */}
                      <View style={[styles.iconCircle, { backgroundColor: cfg.bg }]}>
                        <Ionicons name={cfg.icon} size={20} color={cfg.color} />
                      </View>

                      {/* Content */}
                      <View style={styles.content}>
                        <View style={styles.contentTopRow}>
                          <Text
                            style={[
                              styles.notifTitle,
                              {
                                color: colors.text,
                                fontFamily: notif.unread
                                  ? typography.fontFamily.bold
                                  : typography.fontFamily.semiBold,
                              },
                            ]}
                            numberOfLines={1}
                          >
                            {notif.title}
                          </Text>
                          <Text style={[styles.time, { color: colors.textMuted, fontFamily: typography.fontFamily.regular }]}>
                            {formatRelativeTime(notif.created_at)}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.notifBody,
                            { color: colors.textSecondary, fontFamily: typography.fontFamily.regular },
                          ]}
                          numberOfLines={2}
                        >
                          {notif.body}
                        </Text>
                      </View>

                      {/* Right actions */}
                      <View style={styles.rightActionRow}>
                        {notif.unread && (
                          <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                        )}
                        <TouchableOpacity
                          onPress={() => deleteMutation.mutate(notif.id)}
                          style={styles.deleteBtn}
                        >
                          <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 48 },

  markReadBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  markReadText: {
    fontSize: 12,
  },

  // Filters
  filtersScroll: {
    maxHeight: 40,
    marginBottom: 16,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: 'center',
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
  },
  filterTabText: {
    fontSize: 12,
  },

  // List container
  list: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },

  // Notification item
  notifItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    position: 'relative',
  },
  unreadLine: {
    position: 'absolute',
    left: 0,
    top: 12,
    bottom: 12,
    width: 3,
    borderRadius: 2,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  contentTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 11,
  },
  notifBody: {
    fontSize: 13,
    lineHeight: 18,
  },
  rightActionRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    gap: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  deleteBtn: {
    padding: 4,
  },

  // Loading container
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty state
  empty: {
    alignItems: 'center',
    paddingVertical: 52,
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 17,
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});
