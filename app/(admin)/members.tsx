import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { AdminSearchBar } from '@/components/admin/AdminSearchBar';
import { MemberListItem } from '@/components/admin/MemberListItem';
import { useRouter } from 'expo-router';
import GlobalLoader from '@/components/ui/GlobalLoader';
import { useProfilesByParishQuery } from '@/hooks/queries/useProfiles';
import { useGroupsByParishQuery } from '@/hooks/queries/useGroups';
import { getGroupMetadata } from '@/constants/groups';

type StatusTab = 'Active' | 'Pending' | 'Suspended';

export default function MembersScreen() {
  const { colors, typography, radius } = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<StatusTab>('Active');

  const { data: rawMembers = [], isLoading: loadingProfiles } = useProfilesByParishQuery(user?.parishId as string);
  const { data: groups = [], isLoading: loadingGroups } = useGroupsByParishQuery(user?.parishId as string);

  const loading = loadingProfiles || loadingGroups;

  const members = useMemo(() => {
    return rawMembers.map((m) => {
      const joined = groups.filter((g) => g.member_ids?.includes(m.id));
      const groupNamesStr = joined.map((g) => getGroupMetadata(g.name).shortName).join(', ');

      return {
        ...m,
        groupId: groupNamesStr || 'UNASSIGNED',
        status: 'Active' as StatusTab,
        phone: 'N/A',
      };
    });
  }, [rawMembers, groups]);

  const filteredMembers = useMemo(() => {
    return members.filter((p) => {
      const matchesSearch = p.fullName.toLowerCase().includes(search.toLowerCase()) || 
                            p.groupId?.toLowerCase().includes(search.toLowerCase());
      const matchesTab = p.status === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [members, search, activeTab]);

  const handleMessage = (member: any) => {
    Alert.alert('Message', `Opening chat with ${member.fullName}`);
  };

  const handleSuspend = (member: any) => {
    Alert.alert(
      'Account Action',
      `Are you sure you want to ${member.status === 'Suspended' ? 'reactivate' : 'suspend'} ${member.fullName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => {} } // TODO: Implement status toggle
      ]
    );
  };

  return (
    <ScreenWrapper edges={['top', 'left', 'right']}>
      <ScreenHeader title={`${user?.parishId ? 'Parish' : 'All'} Members`} />

      {/* ── Search & Filters ── */}
      <Animated.View entering={FadeInDown.delay(60).duration(400)}>
        <AdminSearchBar
          value={search}
          onChangeText={setSearch}
          onFilterPress={() => Alert.alert('Filter', 'Advanced filtering coming soon.')}
        />
      </Animated.View>

      {/* ── Segmented Tabs ── */}
      <Animated.View entering={FadeInDown.delay(120).duration(400)} style={[styles.tabsContainer, { backgroundColor: colors.surface }]}>
        <View style={[styles.tabsWrapper, { backgroundColor: colors.surfaceMuted, borderRadius: radius.md }]}>
          {(['Active', 'Pending', 'Suspended'] as StatusTab[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  isActive && { backgroundColor: colors.surface, borderRadius: radius.sm, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 }
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[
                  styles.tabText,
                  { color: isActive ? colors.primary : colors.textMuted, fontFamily: isActive ? typography.fontFamily.bold : typography.fontFamily.medium }
                ]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>

      {/* ── Members List ── */}
      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 40 + 160).duration(350)}>
            <MemberListItem
              item={item}
              onPress={() => router.push({ pathname: '/(modals)/member-detail', params: { id: item.id } })}
              onMessage={() => handleMessage(item)}
              onSuspend={() => handleSuspend(item)}
            />
          </Animated.View>
        )}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.emptyContainer}>
              <Text style={{ color: colors.textMuted, fontFamily: typography.fontFamily.medium }}>
                No members found in {activeTab}
              </Text>
            </View>
          )
        }
        contentContainerStyle={styles.listContent}
      />
      <GlobalLoader visible={loading} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  tabsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  tabsWrapper: {
    flexDirection: 'row',
    padding: 4,
  },
  tab: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 13,
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: 'center',
  },
});
