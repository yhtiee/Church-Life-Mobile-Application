import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/FeedbackContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { CampaignHero } from '@/components/admin/CampaignHero';
import { PledgeLedgerItem } from '@/components/admin/PledgeLedgerItem';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AdminPledge, Donation, Pledge } from '@/constants/mockData';
import { useDonationsByParishQuery, usePledgesByParishQuery, usePendingDonationsQuery, usePendingPledgesQuery, useFulfillDonationMutation, useRejectDonationMutation, useFulfillPledgeMutation, useRejectPledgeMutation } from '@/hooks/queries/useFinance';
import GlobalLoader from '@/components/ui/GlobalLoader';

type FinanceTab = 'Collections' | 'Pledges' | 'Pending Approvals';
type ActionType = 'fulfill' | 'reject' | null;

interface ActionModalState {
  type: ActionType;
  itemId: string;
  itemType: 'donation' | 'pledge';
  amount?: number;
  title?: string;
}

export default function FinancesScreen() {
  const { colors, typography, radius } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [activeTab, setActiveTab] = useState<FinanceTab>('Pledges');
  const [actionModal, setActionModal] = useState<ActionModalState>({ type: null, itemId: '', itemType: 'donation' });
  const [fulfilledAmount, setFulfilledAmount] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Query collections and pledges
  const { data: donations = [], isLoading: loadingDonations } = useDonationsByParishQuery(user?.parishId as string);
  const { data: pledges = [], isLoading: loadingPledges } = usePledgesByParishQuery(user?.parishId as string);

  // Query pending approvals
  const { data: pendingDonations = [], isLoading: loadingPendingDonations } = usePendingDonationsQuery();
  const { data: pendingPledges = [], isLoading: loadingPendingPledges } = usePendingPledgesQuery();

  // Mutations for approvals
  const { mutateAsync: fulfillDonation, isPending: fulfilling } = useFulfillDonationMutation();
  const { mutateAsync: rejectDonation, isPending: rejecting } = useRejectDonationMutation();
  const { mutateAsync: fulfillPledge, isPending: fulfillingPledge } = useFulfillPledgeMutation();
  const { mutateAsync: rejectPledge, isPending: rejectingPledge } = useRejectPledgeMutation();

  const loading = loadingDonations || loadingPledges || loadingPendingDonations || loadingPendingPledges;

  const campaignStats = useMemo(() => {
    // Calculate stats including workflow statuses
    const goal = pledges.reduce((sum, p) => sum + Number(p.targetAmount), 0);
    
    // Fulfilled amount = what has been actually recorded/fulfilled via the approval workflow
    const fulfilled = pledges.reduce((sum, p) => {
      const status = (p as any).status;
      // If pledge has been fulfilled in workflow, use fulfilled_amount, otherwise use paid amount
      if (status === 'fulfilled' && (p as any).fulfilled_amount) {
        return sum + Number((p as any).fulfilled_amount);
      }
      return sum + Number(p.paidAmount || 0);
    }, 0);
    
    // Pending approvals = pledges awaiting admin approval/fulfillment
    const pendingCount = pledges.filter((p) => (p as any).status === 'pending').length;
    
    // Approved count = pledges approved but not yet fulfilled
    const approvedCount = pledges.filter((p) => (p as any).status === 'approved').length;
    
    // Fulfilled count = pledges completed
    const fulfilledCount = pledges.filter((p) => (p as any).status === 'fulfilled' || p.isPaid).length;
    
    const contributors = new Set(pledges.map((p) => p.user_id)).size;
    
    return { 
      title: 'Active Pledges', 
      goal, 
      raised: fulfilled, 
      contributors,
      pendingApprovals: pendingCount,
      approved: approvedCount,
      fulfilled: fulfilledCount,
    };
  }, [pledges]);

  const ledgerItems: AdminPledge[] = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return pledges.map((p) => {
      // Use workflow status if available (from Phase 1 approval workflow)
      // Otherwise fall back to legacy status calculation
      const status: AdminPledge['status'] = (p as any).status && ['pending', 'approved', 'fulfilled', 'rejected'].includes((p as any).status)
        ? (p as any).status
        : p.isPaid
          ? 'Paid'
          : p.dueDate < today
            ? 'Overdue'
            : 'Pending';
      
      return {
        id: p.id,
        name: `${p.profiles?.fullName ?? 'Unknown'} — ${p.title}`,
        totalPledge: Number(p.targetAmount),
        paidAmount: Number(p.paidAmount || 0),
        fulfilledAmount: (p as any).fulfilled_amount ? Number((p as any).fulfilled_amount) : undefined,
        status,
        approvedAt: (p as any).approved_at,
        approvedBy: (p as any).approved_by,
      };
    });
  }, [pledges]);

  const openActionModal = (type: ActionType, itemId: string, itemType: 'donation' | 'pledge', amount?: number, title?: string) => {
    setFulfilledAmount(amount?.toString() || '');
    setRejectionReason('');
    setActionModal({ type, itemId, itemType, amount, title });
  };

  const closeActionModal = () => {
    setActionModal({ type: null, itemId: '', itemType: 'donation' });
    setFulfilledAmount('');
    setRejectionReason('');
  };

  const handleFulfill = async () => {
    if (!fulfilledAmount || !user?.id) return;

    try {
      if (actionModal.itemType === 'donation') {
        await fulfillDonation({
          donationId: actionModal.itemId,
          fulfilledAmount: Number(fulfilledAmount),
          approvedBy: user.id,
        });
      } else {
        await fulfillPledge({
          pledgeId: actionModal.itemId,
          fulfilledAmount: Number(fulfilledAmount),
          approvedBy: user.id,
        });
      }
      showAlert({
        title: 'Success',
        message: `${actionModal.itemType === 'donation' ? 'Donation' : 'Pledge'} fulfilled successfully.`,
        type: 'success',
      });
      closeActionModal();
    } catch (err: any) {
      showAlert({
        title: 'Error',
        message: err.message || 'Failed to fulfill request.',
        type: 'error',
      });
    }
  };

  const handleReject = async () => {
    if (!rejectionReason || !user?.id) return;

    try {
      if (actionModal.itemType === 'donation') {
        await rejectDonation({
          donationId: actionModal.itemId,
          reason: rejectionReason,
          rejectedBy: user.id,
        });
      } else {
        await rejectPledge({
          pledgeId: actionModal.itemId,
          reason: rejectionReason,
          rejectedBy: user.id,
        });
      }
      showAlert({
        title: 'Success',
        message: `${actionModal.itemType === 'donation' ? 'Donation' : 'Pledge'} rejected successfully.`,
        type: 'success',
      });
      closeActionModal();
    } catch (err: any) {
      showAlert({
        title: 'Error',
        message: err.message || 'Failed to reject request.',
        type: 'error',
      });
    }
  };

  const renderPendingDonationItem = (donation: Donation & { profiles?: { fullName: string; email: string } }, index: number) => (
    <Animated.View key={donation.id} entering={FadeInDown.delay(Math.min(index, 8) * 40).duration(350)}>
      <Card
        elevation="sm"
        style={[styles.itemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        padding={16}
      >
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text style={[styles.itemDonor, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
              {donation.profiles?.fullName || 'Unknown'}
            </Text>
            <Text style={[styles.itemCategory, { color: colors.textSecondary, fontFamily: typography.fontFamily.medium }]}>
              {donation.category}
            </Text>
          </View>
          <Badge label="Pending" variant="warning" />
        </View>

        <View style={styles.itemDetails}>
          <Text style={[styles.itemAmount, { color: colors.primary, fontFamily: typography.fontFamily.extraBold }]}>
            ₦{Number(donation.amount).toLocaleString()}
          </Text>
          <Text style={[styles.itemDate, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
            {donation.date}
          </Text>
        </View>

        <View style={[styles.actionButtons, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.successBg }]}
            onPress={() => openActionModal('fulfill', donation.id, 'donation', donation.amount)}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color={colors.success} />
            <Text style={[styles.actionBtnText, { color: colors.success, fontFamily: typography.fontFamily.bold }]}>
              Fulfill
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.dangerBg }]}
            onPress={() => openActionModal('reject', donation.id, 'donation')}
          >
            <Ionicons name="close-circle-outline" size={18} color={colors.danger} />
            <Text style={[styles.actionBtnText, { color: colors.danger, fontFamily: typography.fontFamily.bold }]}>
              Reject
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    </Animated.View>
  );

  const renderPendingPledgeItem = (pledge: Pledge & { profiles?: { fullName: string; email: string } }, index: number) => (
    <Animated.View key={pledge.id} entering={FadeInDown.delay(Math.min(index, 8) * 40).duration(350)}>
      <Card
        elevation="sm"
        style={[styles.itemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        padding={16}
      >
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text style={[styles.itemDonor, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
              {pledge.profiles?.fullName || 'Unknown'}
            </Text>
            <Text style={[styles.itemCategory, { color: colors.textSecondary, fontFamily: typography.fontFamily.medium }]}>
              {pledge.title}
            </Text>
          </View>
          <Badge label="Pending" variant="warning" />
        </View>

        <View style={styles.itemDetails}>
          <Text style={[styles.itemAmount, { color: colors.primary, fontFamily: typography.fontFamily.extraBold }]}>
            ₦{Number(pledge.targetAmount).toLocaleString()}
          </Text>
          <Text style={[styles.itemDate, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
            Due: {pledge.dueDate}
          </Text>
        </View>

        <View style={[styles.actionButtons, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.successBg }]}
            onPress={() => openActionModal('fulfill', pledge.id, 'pledge', pledge.targetAmount, pledge.title)}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color={colors.success} />
            <Text style={[styles.actionBtnText, { color: colors.success, fontFamily: typography.fontFamily.bold }]}>
              Fulfill
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.dangerBg }]}
            onPress={() => openActionModal('reject', pledge.id, 'pledge')}
          >
            <Ionicons name="close-circle-outline" size={18} color={colors.danger} />
            <Text style={[styles.actionBtnText, { color: colors.danger, fontFamily: typography.fontFamily.bold }]}>
              Reject
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    </Animated.View>
  );

  const renderCollections = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted, fontFamily: typography.fontFamily.semiBold }]}>
        Recent Collections
      </Text>
      {donations.length === 0 ? (
        <Text style={{ color: colors.textMuted, fontFamily: typography.fontFamily.medium, fontSize: 13 }}>
          No donations recorded yet.
        </Text>
      ) : (
        donations.map((item, index) => (
          <Animated.View key={item.id} entering={FadeInDown.delay(Math.min(index, 8) * 40).duration(350)}>
            <View style={[styles.donationItem, { borderBottomColor: colors.divider }]}>
              <View style={styles.donationLeft}>
                <Text style={[styles.donationDesc, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
                  {item.description}
                </Text>
                <Text style={[styles.donationDate, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                  {item.profiles?.fullName ?? 'Unknown'} • {item.date} • {item.category}
                </Text>
              </View>
              <Text style={[styles.donationAmount, { color: colors.success, fontFamily: typography.fontFamily.extraBold }]}>
                +{item.currency}{Number(item.amount).toLocaleString()}
              </Text>
            </View>
          </Animated.View>
        ))
      )}
    </View>
  );

  const renderPledges = () => (
    <View style={styles.tabContent}>
      <Animated.View entering={FadeInDown.delay(80).duration(400)}>
        <CampaignHero
          title={campaignStats.title}
          goal={campaignStats.goal}
          raised={campaignStats.raised}
          contributors={campaignStats.contributors}
        />
      </Animated.View>

      {/* Approval Status Summary */}
      <Animated.View entering={FadeInDown.delay(140).duration(400)}>
        <View style={[styles.statusSummary, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statusSummaryTitle, { color: colors.textMuted, fontFamily: typography.fontFamily.semiBold }]}>
            Approval Workflow Status
          </Text>
          <View style={styles.statusGrid}>
            {/* Pending Approvals */}
            <View style={styles.statusCard}>
              <View style={[styles.statusIcon, { backgroundColor: colors.warningBg }]}>
                <Ionicons name="time-outline" size={20} color={colors.warning} />
              </View>
              <Text style={[styles.statusCount, { color: colors.warning, fontFamily: typography.fontFamily.extraBold }]}>
                {campaignStats.pendingApprovals}
              </Text>
              <Text style={[styles.statusLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                Pending Review
              </Text>
            </View>

            {/* Approved */}
            <View style={styles.statusCard}>
              <View style={[styles.statusIcon, { backgroundColor: colors.accentLight }]}>
                <Ionicons name="checkmark-outline" size={20} color={colors.accent} />
              </View>
              <Text style={[styles.statusCount, { color: colors.accent, fontFamily: typography.fontFamily.extraBold }]}>
                {campaignStats.approved}
              </Text>
              <Text style={[styles.statusLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                Approved
              </Text>
            </View>

            {/* Fulfilled */}
            <View style={styles.statusCard}>
              <View style={[styles.statusIcon, { backgroundColor: colors.successBg }]}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              </View>
              <Text style={[styles.statusCount, { color: colors.success, fontFamily: typography.fontFamily.extraBold }]}>
                {campaignStats.fulfilled}
              </Text>
              <Text style={[styles.statusLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                Fulfilled
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>

      <Text style={[styles.sectionTitle, { color: colors.textMuted, fontFamily: typography.fontFamily.semiBold }]}>
        Pledge Ledger
      </Text>
      {ledgerItems.length === 0 ? (
        <Text style={{ color: colors.textMuted, fontFamily: typography.fontFamily.medium, fontSize: 13 }}>
          No pledges recorded yet.
        </Text>
      ) : (
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={[styles.ledgerCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}
        >
          {ledgerItems.map((item) => (
            <PledgeLedgerItem key={item.id} item={item} />
          ))}
        </Animated.View>
      )}
    </View>
  );

  const renderPendingApprovals = () => (
    <View style={styles.tabContent}>
      {activeTab === 'Pending Approvals' && (
        <>
          <View style={styles.listContainer}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted, fontFamily: typography.fontFamily.semiBold }]}>
              Pending Donations ({pendingDonations.length})
            </Text>
            {pendingDonations.length === 0 ? (
              <Text style={{ color: colors.textMuted, fontFamily: typography.fontFamily.medium, fontSize: 13, textAlign: 'center', paddingVertical: 32 }}>
                No pending donations
              </Text>
            ) : (
              pendingDonations.map((donation, idx) => renderPendingDonationItem(donation as any, idx))
            )}
          </View>

          <View style={styles.listContainer}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted, fontFamily: typography.fontFamily.semiBold }]}>
              Pending Pledges ({pendingPledges.length})
            </Text>
            {pendingPledges.length === 0 ? (
              <Text style={{ color: colors.textMuted, fontFamily: typography.fontFamily.medium, fontSize: 13, textAlign: 'center', paddingVertical: 32 }}>
                No pending pledges
              </Text>
            ) : (
              pendingPledges.map((pledge, idx) => renderPendingPledgeItem(pledge as any, idx))
            )}
          </View>
        </>
      )}
    </View>
  );

  return (
    <ScreenWrapper edges={['top', 'left', 'right']}>
      <ScreenHeader title="Parish Finances" />

      {/* ── Segmented Tabs ── */}
      <Animated.View entering={FadeInDown.delay(40).duration(400)} style={[styles.tabsContainer, { backgroundColor: colors.surface }]}>
        <View style={[styles.tabsWrapper, { backgroundColor: colors.surfaceMuted, borderRadius: radius.md }]}>
          {(['Collections', 'Pledges', 'Pending Approvals'] as FinanceTab[]).map((tab) => {
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

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {activeTab === 'Collections' ? renderCollections() : activeTab === 'Pledges' ? renderPledges() : renderPendingApprovals()}
      </ScrollView>

      {/* Action Modal */}
      <Modal
        visible={actionModal.type !== null}
        transparent
        animationType="fade"
        onRequestClose={closeActionModal}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            {actionModal.type === 'fulfill' ? (
              <>
                <Text style={[styles.modalTitle, { color: colors.text, fontFamily: typography.fontFamily.extraBold }]}>
                  Record Fulfillment
                </Text>
                <Text style={[styles.modalDescription, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
                  Enter the actual amount received for this {actionModal.itemType}
                </Text>
                <Input
                  placeholder="Enter fulfilled amount"
                  value={fulfilledAmount}
                  onChangeText={setFulfilledAmount}
                  keyboardType="numeric"
                  leftIcon="cash-outline"
                />
                <View style={styles.modalActions}>
                  <Button
                    label="Record"
                    onPress={handleFulfill}
                    fullWidth
                    loading={fulfilling || fulfillingPledge}
                    disabled={!fulfilledAmount}
                    size="lg"
                    style={{ marginBottom: 8 }}
                  />
                  <Button
                    label="Cancel"
                    onPress={closeActionModal}
                    variant="ghost"
                    fullWidth
                    size="lg"
                  />
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.modalTitle, { color: colors.text, fontFamily: typography.fontFamily.extraBold }]}>
                  Reject {actionModal.itemType === 'donation' ? 'Donation' : 'Pledge'}
                </Text>
                <Text style={[styles.modalDescription, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
                  Please provide a reason for rejection
                </Text>
                <TextInput
                  placeholder="Rejection reason..."
                  value={rejectionReason}
                  onChangeText={setRejectionReason}
                  multiline
                  numberOfLines={4}
                  style={[styles.textArea, { borderColor: colors.border, color: colors.text }]}
                  placeholderTextColor={colors.textMuted}
                />
                <View style={styles.modalActions}>
                  <Button
                    label="Reject"
                    onPress={handleReject}
                    fullWidth
                    loading={rejecting || rejectingPledge}
                    disabled={!rejectionReason}
                    variant="danger"
                    size="lg"
                    style={{ marginBottom: 8 }}
                  />
                  <Button
                    label="Cancel"
                    onPress={closeActionModal}
                    variant="ghost"
                    fullWidth
                    size="lg"
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ── Floating Add Button ── */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, borderRadius: radius.xl }]}
        onPress={() => router.push('/(modals)/log-donation')}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>
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
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 13,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  tabContent: {
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    marginLeft: 4,
  },
  donationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  donationLeft: {
    flex: 1,
  },
  donationDesc: {
    fontSize: 15,
  },
  donationDate: {
    fontSize: 12,
    marginTop: 4,
  },
  donationAmount: {
    fontSize: 16,
  },
  ledgerCard: {
    borderWidth: 1,
    overflow: 'hidden',
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
  listContainer: {
    paddingTop: 8,
  },
  itemCard: {
    marginBottom: 12,
    borderWidth: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemDonor: {
    fontSize: 15,
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: 12,
  },
  itemDetails: {
    marginBottom: 12,
  },
  itemAmount: {
    fontSize: 18,
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 13,
    marginBottom: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontFamily: 'Poppins-Regular',
  },
  modalActions: {
    marginTop: 24,
  },
  statusSummary: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  statusSummaryTitle: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    marginLeft: 4,
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statusCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statusCount: {
    fontSize: 20,
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
});
