import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { RequestCard } from '@/components/admin/RequestCard';
import { MOCK_GROUP_REQUESTS, MOCK_ADMIN_GROUP_POSTS } from '@/constants/mockData';
import { Image } from 'expo-image';

type GroupTab = 'Feed' | 'Requests';

export default function GroupsAdminScreen() {
  const { colors, typography, radius } = useTheme();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<GroupTab>('Feed');
  const [filter, setFilter] = useState('All');

  const handleApprove = (id: string) => {
    Alert.alert('Approved', 'Group request has been approved successfully.');
  };

  const handleReject = (id: string) => {
    Alert.alert('Rejected', 'Group request has been rejected.');
  };

  const renderFeedItem = ({ item }: { item: typeof MOCK_ADMIN_GROUP_POSTS[0] }) => (
    <View style={[styles.postCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
      <View style={styles.postHeader}>
        <Image source={item.authorAvatar} style={[styles.postAvatar, { borderRadius: 18 }]} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={styles.authorRow}>
            <Text style={[styles.authorName, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
              {item.author}
            </Text>
            {item.isPinned && (
              <View style={[styles.pinnedBadge, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="pin" size={10} color={colors.primary} />
                <Text style={{ fontSize: 9, color: colors.primary, fontFamily: typography.fontFamily.bold, marginLeft: 4 }}>PINNED</Text>
              </View>
            )}
          </View>
          <Text style={[styles.postMeta, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
            {item.timestamp} • {item.groupId.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.postContent, { color: colors.text, fontFamily: typography.fontFamily.regular }]}>
        {item.content}
      </Text>

      <View style={[styles.engagementRow, { borderTopColor: colors.divider }]}>
        <View style={styles.engagementStat}>
          <Ionicons name="eye-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.statText, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
            Seen by {item.seenBy} members
          </Text>
        </View>
        <TouchableOpacity>
          <Text style={{ fontSize: 12, color: colors.primary, fontFamily: typography.fontFamily.semiBold }}>View Detailed Stats</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenWrapper edges={['top', 'left', 'right']}>
      <ScreenHeader title="Parish Groups" />

      {/* ── Segmented Tabs ── */}
      <View style={[styles.tabsContainer, { backgroundColor: colors.surface }]}>
        <View style={[styles.tabsWrapper, { backgroundColor: colors.surfaceMuted, borderRadius: radius.md }]}>
          {(['Feed', 'Requests'] as GroupTab[]).map((tab) => {
            const isActive = activeTab === tab;
            const badgeCount = tab === 'Requests' ? MOCK_GROUP_REQUESTS.length : 0;
            
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  isActive && { backgroundColor: colors.surface, borderRadius: radius.sm, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 }
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[
                    styles.tabText,
                    { color: isActive ? colors.primary : colors.textMuted, fontFamily: isActive ? typography.fontFamily.bold : typography.fontFamily.medium }
                  ]}>
                    {tab === 'Feed' ? 'Live Engagement' : 'Group Requests'}
                  </Text>
                  {badgeCount > 0 && (
                    <View style={[styles.badge, { backgroundColor: colors.danger }]}>
                      <Text style={styles.badgeText}>{badgeCount}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {activeTab === 'Requests' ? (
          <View style={{ flex: 1 }}>
            {/* ── Horizontal Filters ── */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              {['All', 'CMO', 'CWO', 'CYON', 'Finance'].map((cat) => (
                <TouchableOpacity 
                  key={cat} 
                  onPress={() => setFilter(cat)}
                  style={[
                    styles.filterPill, 
                    { backgroundColor: filter === cat ? colors.primary : colors.surfaceMuted, borderRadius: radius.xl }
                  ]}
                >
                  <Text style={{ fontSize: 12, color: filter === cat ? '#FFFFFF' : colors.textSecondary, fontFamily: typography.fontFamily.semiBold }}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <FlatList
              data={MOCK_GROUP_REQUESTS}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, marginTop: 20 }}
              renderItem={({ item }) => (
                <RequestCard
                  request={item} 
                  onApprove={() => handleApprove(item.id)}
                  onReject={() => handleReject(item.id)}
                />
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="checkmark-circle-outline" size={48} color={colors.success} />
                  <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>All caught up!</Text>
                  <Text style={[styles.emptySub, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>No pending group requests.</Text>
                </View>
              }
            />
          </View>
        ) : (
          <FlatList
            data={MOCK_ADMIN_GROUP_POSTS}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, paddingTop: 10 }}
            renderItem={renderFeedItem}
          />
        )}
      </View>

      {/* ── Floating Action Button ── */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary, borderRadius: radius.xl }]}
        onPress={() => router.push('/(modals)/compose-message')}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  tabsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 20,
  },
  tabsWrapper: {
    flexDirection: 'row',
    padding: 4,
  },
  tab: {
    flex: 1,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 13,
  },
  badge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  filterScroll: {
    marginTop: 20,
    paddingHorizontal: 20,
    gap: 10,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  postCard: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAvatar: {
    width: 36,
    height: 36,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorName: {
    fontSize: 15,
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  postMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  engagementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  engagementStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 11,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    marginTop: 16,
  },
  emptySub: {
    fontSize: 14,
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
});
