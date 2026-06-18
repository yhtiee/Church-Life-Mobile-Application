import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/FeedbackContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { RequestCard } from '@/components/admin/RequestCard';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import GlobalLoader from '@/components/ui/GlobalLoader';
import { getGroupMetadata } from '@/constants/groups';
import { useGroupRequestsByParishQuery, useGroupUpdatesByParishQuery, useGroupsByParishQuery } from '@/hooks/queries/useGroups';
import { useApproveGroupRequestMutation, useRejectGroupRequestMutation, useCreateSecuredGroupMutation } from '@/hooks/mutations/useGroups';

type GroupTab = 'Requests' | 'Manage';

export default function GroupsAdminScreen() {
  const { colors, typography, radius } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [activeTab, setActiveTab] = useState<GroupTab>('Requests');
  const [filter, setFilter] = useState('All');
  const [createGroupModal, setCreateGroupModal] = useState(false);
  const [groupDetailsModal, setGroupDetailsModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<typeof parishGroups[0] | null>(null);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');

  const { data: groupRequests = [], isLoading: loadingRequests } = useGroupRequestsByParishQuery(user?.parishId as string);
  // const { data: groupUpdates = [], isLoading: loadingUpdates } = useGroupUpdatesByParishQuery(user?.parishId as string); // Commented out - Feed section disabled
  const { data: parishGroups = [], isLoading: loadingGroups } = useGroupsByParishQuery(user?.parishId as string);

  const approveMutation = useApproveGroupRequestMutation();
  const rejectMutation = useRejectGroupRequestMutation();
  const createGroupMutation = useCreateSecuredGroupMutation();

  const loading = loadingRequests || loadingGroups;
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filteredRequests = useMemo(() => {
    if (filter === 'All') return groupRequests;
    return groupRequests.filter((r) => getGroupMetadata(r.targetGroup?.name ?? '').shortName === filter);
  }, [groupRequests, filter]);

  const handleApprove = (request: typeof groupRequests[number]) => {
    setProcessingId(request.id);
    approveMutation.mutate(request, {
      onSettled: () => setProcessingId(null),
      onError: (err: any) => Alert.alert('Error', err?.message ?? 'Failed to approve request.'),
    });
  };

  const handleReject = (requestId: string) => {
    setProcessingId(requestId);
    rejectMutation.mutate(requestId, {
      onSettled: () => setProcessingId(null),
      onError: (err: any) => Alert.alert('Error', err?.message ?? 'Failed to reject request.'),
    });
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      showAlert({ title: 'Error', message: 'Group name is required', type: 'error' });
      return;
    }

    createGroupMutation.mutate(
      {
        name: groupName,
        description: groupDescription,
        parishId: user?.parishId as string,
        is_secure: true,
      } as any,
      {
        onSuccess: () => {
          setGroupName('');
          setGroupDescription('');
          setCreateGroupModal(false);
          showAlert({ title: 'Success', message: 'Secured group created successfully', type: 'success' });
        },
        onError: (err: any) => {
          showAlert({ title: 'Error', message: err?.message || 'Failed to create group', type: 'error' });
        },
      }
    );
  };

  const handleViewGroupDetails = (group: typeof parishGroups[0]) => {
    setSelectedGroup(group);
    setGroupName(group.name);
    setGroupDescription(group.description || '');
    setGroupDetailsModal(true);
  };

  const handleDeleteGroup = (groupId: string, groupName: string) => {
    Alert.alert(
      'Delete Group',
      `Are you sure you want to delete "${groupName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: () => {
            showAlert({ title: 'Coming Soon', message: 'Delete functionality will be available soon', type: 'success' });
          },
          style: 'destructive',
        },
      ]
    );
  };

  const closeGroupDetailsModal = () => {
    setGroupDetailsModal(false);
    setSelectedGroup(null);
    setGroupName('');
    setGroupDescription('');
  };

  // Render function for Feed items - commented out (Feed section disabled)
  /* 
  const renderFeedItem = ({ item, index }: { item: typeof groupUpdates[number]; index: number }) => {
    const meta = getGroupMetadata(item.group?.name ?? '');
    return (
      <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 50).duration(350)}>
        <View style={[styles.postCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
          <View style={styles.postHeader}>
            <Avatar name={item.author} size={36} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={styles.authorRow}>
                <Text style={[styles.authorName, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
                  {item.author}
                </Text>
                <View style={[styles.groupBadge, { backgroundColor: meta.color + '15' }]}>
                  <Text style={{ fontSize: 9, color: meta.color, fontFamily: typography.fontFamily.bold }}>
                    {meta.shortName.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={[styles.postMeta, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                {item.date}
              </Text>
            </View>
          </View>

          <Text style={[styles.postTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
            {item.title}
          </Text>
          <Text style={[styles.postContent, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
            {item.body}
          </Text>
        </View>
      </Animated.View>
    );
  };
  */

  return (
    <ScreenWrapper edges={['top', 'left', 'right']}>
      <ScreenHeader title="Parish Groups" />

      {/* ── Segmented Tabs ── */}
      <Animated.View entering={FadeInDown.delay(40).duration(400)} style={[styles.tabsContainer, { backgroundColor: colors.surface }]}>
        <View style={[styles.tabsWrapper, { backgroundColor: colors.surfaceMuted, borderRadius: radius.md }]}>
          {(['Requests', 'Manage'] as GroupTab[]).map((tab) => {
            const isActive = activeTab === tab;
            const badgeCount = tab === 'Requests' ? groupRequests.length : 0;

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
                    {tab}
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
      </Animated.View>

      <View style={{ flex: 1 }}>
        {activeTab === 'Requests' ? (
          <View style={{ flex: 1 }}>
            {/* ── Horizontal Filters ── */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              {['All', 'CMO', 'CWO', 'CYON', 'HCA'].map((cat) => (
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
              data={filteredRequests}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, marginTop: 20 }}
              renderItem={({ item, index }) => (
                <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 50).duration(350)}>
                  <RequestCard
                    userName={item.userName}
                    requestDate={new Date(item.requestDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    targetGroupName={item.targetGroup?.name ?? 'Unknown Group'}
                    currentGroupName={item.currentGroup?.name}
                    onApprove={() => handleApprove(item)}
                    onReject={() => handleReject(item.id)}
                    isProcessing={processingId === item.id}
                  />
                </Animated.View>
              )}
              ListEmptyComponent={
                loading ? null : (
                  <View style={styles.emptyState}>
                    <Ionicons name="checkmark-circle-outline" size={48} color={colors.success} />
                    <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>All caught up!</Text>
                    <Text style={[styles.emptySub, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>No pending group requests.</Text>
                  </View>
                )
              }
            />
          </View>
        ) : activeTab === 'Manage' ? (
          <View style={{ flex: 1 }}>
            <FlatList
              data={parishGroups}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, paddingTop: 20 }}
              renderItem={({ item, index }) => (
                <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 50).duration(350)}>
                  <View style={[styles.groupCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
                    <View style={styles.groupCardHeader}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <Ionicons 
                            name={item.is_secure ? 'lock-closed' : 'people'} 
                            size={16} 
                            color={item.is_secure ? colors.danger : colors.primary} 
                          />
                          <Text style={[styles.groupName, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
                            {item.name}
                          </Text>
                          <View style={[styles.groupTypeBadge, { backgroundColor: item.is_secure ? colors.danger + '20' : colors.primary + '20' }]}>
                            <Text style={{ fontSize: 10, color: item.is_secure ? colors.danger : colors.primary, fontFamily: typography.fontFamily.semiBold }}>
                              {item.is_secure ? 'Secured' : 'Open'}
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.groupDesc, { color: colors.textMuted, fontFamily: typography.fontFamily.regular }]}>
                          {item.description || 'No description'}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Ionicons name="person" size={14} color={colors.textMuted} />
                            <Text style={[styles.groupStat, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                              {item.member_ids?.length || 0} members
                            </Text>
                          </View>
                          <Text style={[styles.groupStat, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                            Created {new Date(item.created_at).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.groupCardActions}>
                      <TouchableOpacity 
                        style={[styles.actionBtn, { backgroundColor: colors.primaryLight, borderRadius: radius.md }]}
                        onPress={() => handleViewGroupDetails(item)}
                      >
                        <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
                        <Text style={{ fontSize: 12, color: colors.primary, fontFamily: typography.fontFamily.semiBold, marginLeft: 4 }}>
                          Details
                        </Text>
                      </TouchableOpacity>
                      {/* <TouchableOpacity 
                        style={[styles.actionBtn, { backgroundColor: colors.surfaceMuted, borderRadius: radius.md }]}
                        onPress={() => handleViewGroupDetails(item)}
                      >
                        <Ionicons name="create-outline" size={16} color={colors.primary} />
                        <Text style={{ fontSize: 12, color: colors.primary, fontFamily: typography.fontFamily.semiBold, marginLeft: 4 }}>
                          Edit
                        </Text>
                      </TouchableOpacity> */}
                      <TouchableOpacity 
                        style={[styles.actionBtn, { backgroundColor: colors.danger + '20', borderRadius: radius.md }]}
                        onPress={() => handleDeleteGroup(item.id, item.name)}
                      >
                        <Ionicons name="trash-outline" size={16} color={colors.danger} />
                        <Text style={{ fontSize: 12, color: colors.danger, fontFamily: typography.fontFamily.semiBold, marginLeft: 4 }}>
                          Delete
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Animated.View>
              )}
              ListEmptyComponent={
                loading ? null : (
                  <View style={styles.emptyState}>
                    <Ionicons name="apps-outline" size={48} color={colors.textMuted} />
                    <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>No groups yet</Text>
                    <Text style={[styles.emptySub, { color: colors.textMuted, fontFamily: typography.fontFamily.medium, marginBottom: 20 }]}>Create your first group to get started</Text>
                    <Button
                      label="Create Group"
                      onPress={() => setCreateGroupModal(true)}
                      size="sm"
                    />
                  </View>
                )
              }
            />
            {parishGroups.length > 0 && (
              <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.primary, borderRadius: radius.xl }]}
                onPress={() => {
                  setGroupName('');
                  setGroupDescription('');
                  setCreateGroupModal(true);
                }}
              >
                <Ionicons name="add" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          // Feed section - commented out (no official announcements feature yet)
          /* 
          <FlatList
            data={groupUpdates}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, paddingTop: 10 }}
            renderItem={renderFeedItem}
            ListEmptyComponent={
              loading ? null : (
                <View style={styles.emptyState}>
                  <Ionicons name="newspaper-outline" size={48} color={colors.textMuted} />
                  <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>No updates yet</Text>
                  <Text style={[styles.emptySub, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>Group bulletins will appear here.</Text>
                </View>
              )
            }
          />
          */
          <View style={styles.emptyState}>
            <Ionicons name="newspaper-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>Feed coming soon</Text>
            <Text style={[styles.emptySub, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>Official announcements feature will be available soon.</Text>
          </View>
        )}
      </View>

      {/* ── Create Group Modal ── */}
      <Modal
        visible={createGroupModal}
        transparent
        animationType="slide"
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
                Create Secured Group
              </Text>
              <TouchableOpacity onPress={() => setCreateGroupModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
              placeholder="Group Name"
              placeholderTextColor={colors.textMuted}
              value={groupName}
              onChangeText={setGroupName}
            />

            <TextInput
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface, height: 100 }]}
              placeholder="Group Description (optional)"
              placeholderTextColor={colors.textMuted}
              value={groupDescription}
              onChangeText={setGroupDescription}
              multiline
            />

            <View style={{ gap: 12 }}>
              <Button
                label={createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
                onPress={handleCreateGroup}
                disabled={createGroupMutation.isPending}
              />
              <TouchableOpacity
                onPress={() => setCreateGroupModal(false)}
                style={[styles.cancelButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Text style={{ color: colors.text, fontFamily: typography.fontFamily.semiBold }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Group Details Modal ── */}
      <Modal
        visible={groupDetailsModal}
        transparent
        animationType="slide"
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
                Group Details
              </Text>
              <TouchableOpacity onPress={closeGroupDetailsModal}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedGroup && (
              <>
                <View style={{ marginBottom: 20 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <View style={[styles.groupIcon, { backgroundColor: selectedGroup.is_secure ? colors.danger : colors.primary }]}>
                      <Ionicons name={selectedGroup.is_secure ? 'lock-closed' : 'people'} size={24} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, color: colors.text, fontFamily: typography.fontFamily.bold }}>
                        {selectedGroup.name}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.textMuted, fontFamily: typography.fontFamily.medium, marginTop: 2 }}>
                        {selectedGroup.is_secure ? 'Secured Group' : 'Open Group'}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
                    <Text style={{ fontSize: 12, color: colors.textMuted, fontFamily: typography.fontFamily.semiBold }}>MEMBERS</Text>
                    <Text style={{ fontSize: 14, color: colors.text, fontFamily: typography.fontFamily.bold }}>
                      {selectedGroup.member_ids?.length || 0}
                    </Text>
                  </View>

                  <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
                    <Text style={{ fontSize: 12, color: colors.textMuted, fontFamily: typography.fontFamily.semiBold }}>CREATED</Text>
                    <Text style={{ fontSize: 14, color: colors.text, fontFamily: typography.fontFamily.medium }}>
                      {new Date(selectedGroup.created_at).toLocaleDateString()}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={{ fontSize: 12, color: colors.textMuted, fontFamily: typography.fontFamily.semiBold }}>STATUS</Text>
                    <View style={[styles.statusBadge, { backgroundColor: selectedGroup.is_secure ? colors.danger : colors.primary }]}>
                      <Text style={{ fontSize: 11, color: '#FFFFFF', fontFamily: typography.fontFamily.semiBold }}>
                        {selectedGroup.is_secure ? 'SECURED' : 'OPEN'}
                      </Text>
                    </View>
                  </View>
                </View>

                {selectedGroup.description && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 12, color: colors.textMuted, fontFamily: typography.fontFamily.semiBold, marginBottom: 8 }}>
                      DESCRIPTION
                    </Text>
                    <View style={[styles.descriptionBox, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
                      <Text style={{ color: colors.text, fontFamily: typography.fontFamily.regular, fontSize: 14, lineHeight: 21 }}>
                        {selectedGroup.description}
                      </Text>
                    </View>
                  </View>
                )}

                {selectedGroup.member_ids && selectedGroup.member_ids.length > 0 && (
                  <View style={{ marginBottom: 20 }}>
                    <Text style={{ fontSize: 12, color: colors.textMuted, fontFamily: typography.fontFamily.semiBold, marginBottom: 8 }}>
                      MEMBERS
                    </Text>
                    <View style={[styles.membersList, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
                      <Text style={{ color: colors.text, fontFamily: typography.fontFamily.medium, fontSize: 14 }}>
                        {selectedGroup.member_ids.length} member{selectedGroup.member_ids.length > 1 ? 's' : ''} in this group
                      </Text>
                    </View>
                  </View>
                )}
              </>
            )}

            <View style={{ gap: 12 }}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={closeGroupDetailsModal}
              >
                <Text style={{ color: colors.text, fontFamily: typography.fontFamily.semiBold }}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Floating Action Button for Messaging ── */}
      {activeTab === 'Requests' && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary, borderRadius: radius.xl }]}
          onPress={() => router.push('/(modals)/compose-message')}
        >
          <Ionicons name="paper-plane" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      <GlobalLoader visible={loading} />
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
    paddingVertical: 0,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
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
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorName: {
    fontSize: 15,
  },
  groupBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  postMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  postTitle: {
    fontSize: 15,
    marginBottom: 6,
  },
  postContent: {
    fontSize: 14,
    lineHeight: 21,
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
    bottom: 150,
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
  groupCard: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
    borderRadius: 12,
  },
  groupCardHeader: {
    marginBottom: 12,
  },
  groupName: {
    fontSize: 15,
  },
  groupDesc: {
    fontSize: 13,
  },
  groupStat: {
    fontSize: 12,
  },
  groupTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  groupCardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  descriptionBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  membersList: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
