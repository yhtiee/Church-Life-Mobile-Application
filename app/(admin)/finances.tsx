import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { CampaignHero } from '@/components/admin/CampaignHero';
import { PledgeLedgerItem } from '@/components/admin/PledgeLedgerItem';
import { AdminPledge } from '@/constants/mockData';
import { useDonationsByParishQuery, usePledgesByParishQuery } from '@/hooks/queries/useFinance';
import GlobalLoader from '@/components/ui/GlobalLoader';

type FinanceTab = 'Collections' | 'Pledges';

export default function FinancesScreen() {
  const { colors, typography, radius } = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<FinanceTab>('Pledges');

  const { data: donations = [], isLoading: loadingDonations } = useDonationsByParishQuery(user?.parishId as string);
  const { data: pledges = [], isLoading: loadingPledges } = usePledgesByParishQuery(user?.parishId as string);

  const loading = loadingDonations || loadingPledges;

  const campaignStats = useMemo(() => {
    const goal = pledges.reduce((sum, p) => sum + Number(p.targetAmount), 0);
    const raised = pledges.reduce((sum, p) => sum + Number(p.paidAmount || 0), 0);
    const contributors = new Set(pledges.map((p) => p.user_id)).size;
    return { title: 'Active Pledges', goal, raised, contributors };
  }, [pledges]);

  const ledgerItems: AdminPledge[] = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return pledges.map((p) => {
      const status: AdminPledge['status'] = p.isPaid
        ? 'Paid'
        : p.dueDate < today
          ? 'Overdue'
          : 'Pending';
      return {
        id: p.id,
        name: `${p.profiles?.fullName ?? 'Unknown'} — ${p.title}`,
        totalPledge: Number(p.targetAmount),
        paidAmount: Number(p.paidAmount || 0),
        status,
      };
    });
  }, [pledges]);

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
      <Text style={[styles.sectionTitle, { color: colors.textMuted, fontFamily: typography.fontFamily.semiBold }]}>
        Pledge Ledger
      </Text>
      {ledgerItems.length === 0 ? (
        <Text style={{ color: colors.textMuted, fontFamily: typography.fontFamily.medium, fontSize: 13 }}>
          No pledges recorded yet.
        </Text>
      ) : (
        <Animated.View
          entering={FadeInDown.delay(140).duration(400)}
          style={[styles.ledgerCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}
        >
          {ledgerItems.map((item) => (
            <PledgeLedgerItem key={item.id} item={item} />
          ))}
        </Animated.View>
      )}
    </View>
  );

  return (
    <ScreenWrapper edges={['top', 'left', 'right']}>
      <ScreenHeader title="Parish Finances" />

      {/* ── Segmented Tabs ── */}
      <Animated.View entering={FadeInDown.delay(40).duration(400)} style={[styles.tabsContainer, { backgroundColor: colors.surface }]}>
        <View style={[styles.tabsWrapper, { backgroundColor: colors.surfaceMuted, borderRadius: radius.md }]}>
          {(['Collections', 'Pledges'] as FinanceTab[]).map((tab) => {
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
        {activeTab === 'Collections' ? renderCollections() : renderPledges()}
      </ScrollView>

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
});
