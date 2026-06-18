import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { TabSwitcher } from '@/components/ui/TabSwitcher';
import { DonationRow } from '@/components/ui/DonationRow';
import { PledgeCard } from '@/components/ui/PledgeCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { AnimatedProgressRing } from '@/components/ui/AnimatedProgressRing';
import { useDonationsQuery, usePledgesQuery } from '@/hooks/queries/useFinance';
import { Gradients } from '@/constants/theme';
import GlobalLoader from '@/components/ui/GlobalLoader';

export default function FinanceScreen() {
  const { colors, typography, radius } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);

  const { data: donations = [], isLoading: donationsLoading, refetch: refetchDonations, isRefetching: isRefetchingDonations } = useDonationsQuery(user?.id || '');
  const { data: pledges = [], isLoading: pledgesLoading, refetch: refetchPledges, isRefetching: isRefetchingPledges } = usePledgesQuery(user?.id || '');

  const loading = donationsLoading || pledgesLoading;
  const isRefetching = isRefetchingDonations || isRefetchingPledges;

  const refetchAll = async () => {
    await Promise.all([refetchDonations(), refetchPledges()]);
  };

  const totalDonated = donations.reduce((sum, d) => sum + Number(d.amount), 0);
  const paidPledges = pledges.filter((p) => p.isPaid);
  const totalPledges = pledges.length;
  const paidFraction = totalPledges > 0 ? `${paidPledges.length}/${totalPledges}` : '0/0';
  const paidPercentage = totalPledges > 0 ? Math.round((paidPledges.length / totalPledges) * 100) : 0;

  return (
    <ScreenWrapper edges={['top', 'left', 'right']}>
      <ScreenHeader title="My Finance" />

      <ScrollView
        contentContainerStyle={[styles.scroll, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetchAll}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* ── Hero summary banner ── */}
        <Animated.View entering={FadeInDown.delay(60).duration(400)}>
          <LinearGradient
            colors={Gradients.heroLight as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.heroBanner, { borderRadius: radius.xl }]}
          >
            {/* Decorative orb */}
            <View style={styles.heroBannerOrb} />

            <Text style={[styles.heroBannerLabel, { fontFamily: typography.fontFamily.medium }]}>
              Total Giving This Year
            </Text>
            <Text style={[styles.heroBannerAmount, { fontFamily: typography.fontFamily.extraBold }]}>
              ₦{totalDonated.toLocaleString()}
            </Text>
            <Text style={[styles.heroBannerSub, { fontFamily: typography.fontFamily.regular }]}>
              {donations.length} contributions recorded
            </Text>

            {/* Quick donate button */}
            {/* <TouchableOpacity
              style={styles.donateQuickBtn}
              activeOpacity={0.85}
              onPress={() => router.push('/(modals)/donate')}
            >
              <Ionicons name="heart-outline" size={16} color="#2A6FDB" />
              <Text style={[styles.donateQuickText, { fontFamily: typography.fontFamily.bold }]}>
                Donate Now
              </Text>
            </TouchableOpacity> */}
          </LinearGradient>
        </Animated.View>

        {/* ── KPI Cards ── */}
        <View style={styles.kpiRow}>
          {/* Card 1 — Pledges */}
          <Animated.View entering={FadeInDown.delay(140).duration(400)} style={{ flex: 1 }}>
            <View style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.kpiIconBox, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="checkmark-circle-outline" size={18} color={colors.primary} />
              </View>
              <Text style={[styles.kpiLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                Pledges Paid
              </Text>
              <Text style={[styles.kpiValue, { color: colors.text, fontFamily: typography.fontFamily.extraBold }]}>
                {paidFraction}
              </Text>
              <View style={styles.kpiProgressRow}>
                <View style={[styles.kpiProgressTrack, { backgroundColor: colors.surfaceMuted }]}>
                  <View
                    style={[
                      styles.kpiProgressFill,
                      { backgroundColor: colors.primary, width: `${paidPercentage}%` },
                    ]}
                  />
                </View>
                <Text style={[styles.kpiPercent, { color: colors.primary, fontFamily: typography.fontFamily.bold }]}>
                  {paidPercentage}%
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Card 2 — Pending */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ flex: 1 }}>
            <View style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.kpiIconBox, { backgroundColor: colors.warningBg }]}>
                <Ionicons name="time-outline" size={18} color={colors.warning} />
              </View>
              <Text style={[styles.kpiLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                Pending Pledges
              </Text>
              <Text style={[styles.kpiValue, { color: colors.text, fontFamily: typography.fontFamily.extraBold }]}>
                {totalPledges - paidPledges.length}
              </Text>
              {/* <TouchableOpacity
                onPress={() => router.push('/(modals)/new-pledge')}
                style={[styles.kpiActionBtn, { backgroundColor: colors.warningBg }]}
              >
                <Text style={[styles.kpiActionText, { color: colors.warning, fontFamily: typography.fontFamily.semiBold }]}>
                  + New Pledge
                </Text>
              </TouchableOpacity> */}
            </View>
          </Animated.View>
        </View>

        {/* ── Tabs ── */}
        <Animated.View entering={FadeInDown.delay(260).duration(400)}>
          <TabSwitcher
            tabs={['My Donations', 'My Pledges']}
            activeIndex={activeTab}
            onTabChange={setActiveTab}
          />
        </Animated.View>

        {/* ── Feed ── */}
        <View style={styles.feedContainer}>
          {activeTab === 0 && (
            <View>
              {donations.length === 0 ? (
                <EmptyState
                  icon="heart-outline"
                  title="No Donations Yet"
                  message="Your giving history will appear here once you make your first donation."
                />
              ) : (
                donations.map((d, i) => (
                  <Animated.View key={d.id} entering={FadeInDown.delay(i * 60).duration(350)}>
                    <DonationRow
                      item={d}
                      onPress={() =>
                        router.push({
                          pathname: '/(modals)/donation-detail',
                          params: { id: d.id },
                        })
                      }
                    />
                  </Animated.View>
                ))
              )}
            </View>
          )}

          {activeTab === 1 && (
            <View>
              {pledges.length === 0 ? (
                <EmptyState
                  icon="document-text-outline"
                  title="No Pledges Made"
                  message="Pledges you make will appear here."
                />
              ) : (
                pledges.map((pledge, i) => (
                  <Animated.View key={pledge.id} entering={FadeInDown.delay(i * 60).duration(350)}>
                    <PledgeCard
                      pledge={pledge}
                      onPress={() =>
                        router.push({
                          pathname: '/(modals)/pledge-detail',
                          params: { id: pledge.id },
                        })
                      }
                    />
                  </Animated.View>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>
      <GlobalLoader visible={loading} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120 },

  // Hero banner
  heroBanner: {
    padding: 24,
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
  },
  heroBannerOrb: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.10)',
    top: -60,
    right: -60,
  },
  heroBannerLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    marginBottom: 4,
  },
  heroBannerAmount: {
    fontSize: 34,
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 4,
  },
  heroBannerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.60)',
    marginBottom: 20,
  },
  donateQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 25,
  },
  donateQuickText: {
    fontSize: 14,
    color: '#2A6FDB',
  },

  // KPI Cards
  kpiRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  kpiCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  kpiIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  kpiLabel: {
    fontSize: 11,
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 22,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  kpiProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  kpiProgressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  kpiProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  kpiPercent: {
    fontSize: 11,
  },
  kpiActionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  kpiActionText: {
    fontSize: 11,
  },

  feedContainer: { marginTop: 4 },
});
