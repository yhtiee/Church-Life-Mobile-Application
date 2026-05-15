import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { MOCK_PARISHIONERS, Parishioner } from '@/constants/mockData';
import { AdminSearchBar } from '@/components/admin/AdminSearchBar';
import { MemberListItem } from '@/components/admin/MemberListItem';
import { useRouter } from 'expo-router';

type StatusTab = 'Active' | 'Pending' | 'Suspended';

export default function MembersScreen() {
  const { colors, typography, radius } = useTheme();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<StatusTab>('Active');

  const filteredMembers = useMemo(() => {
    return MOCK_PARISHIONERS.filter((p) => {
      const matchesSearch = p.fullName.toLowerCase().includes(search.toLowerCase()) || 
                            p.groupId?.toLowerCase().includes(search.toLowerCase());
      const matchesTab = p.status === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [search, activeTab]);

  const handleMessage = (member: Parishioner) => {
    Alert.alert('Message', `Opening chat with ${member.fullName}`);
  };

  const handleSuspend = (member: Parishioner) => {
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
      <ScreenHeader title="Parish Members" />
      
      {/* ── Search & Filters ── */}
      <AdminSearchBar 
        value={search} 
        onChangeText={setSearch} 
        onFilterPress={() => Alert.alert('Filter', 'Advanced filtering coming soon.')}
      />

      {/* ── Segmented Tabs ── */}
      <View style={[styles.tabsContainer, { backgroundColor: colors.surface }]}>
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
      </View>

      {/* ── Members List ── */}
      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MemberListItem 
            item={item} 
            onPress={() => router.push({ pathname: '/(modals)/member-detail', params: { id: item.id } })}
            onMessage={() => handleMessage(item)}
            onSuspend={() => handleSuspend(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ color: colors.textMuted, fontFamily: typography.fontFamily.medium }}>
              No members found in {activeTab}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
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
