import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { TabSwitcher } from '@/components/ui/TabSwitcher';
import { DonationRow } from '@/components/ui/DonationRow';
import { PledgeCard } from '@/components/ui/PledgeCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { MOCK_DONATIONS, MOCK_PLEDGES } from '@/constants/mockData';

export default function FinanceScreen() {
  const { colors, typography, radius } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);

  const totalDonated = MOCK_DONATIONS.reduce((sum, d) => sum + d.amount, 0);
  const paidPledges = MOCK_PLEDGES.filter((p) => p.isPaid);
  const totalPledges = MOCK_PLEDGES.length;

  const paidFraction = totalPledges > 0 ? `${paidPledges.length} / ${totalPledges}` : '0 / 0';
  const paidPercentage = totalPledges > 0 ? Math.round((paidPledges.length / totalPledges) * 100) : 0;

  return (
    <ScreenWrapper edges={['top', 'left', 'right']}>

      <ScreenHeader 
        title="Finance" 
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── KPI Row (2 side-by-side cards) ── */}
        <View style={styles.kpiRow}>
          {/* Card 1: Total Donated */}
          <View style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}>
            <Text style={{ fontSize: 12, fontFamily: typography.fontFamily.semiBold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Total Donated
            </Text>
            <Text style={{ fontSize: 24, fontFamily: typography.fontFamily.extraBold, color: colors.primary, marginTop: 8 }}>
              ₦{totalDonated.toLocaleString()}
            </Text>
          </View>

          {/* Card 2: Pledges Paid */}
          <View style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}>
            <Text style={{ fontSize: 12, fontFamily: typography.fontFamily.semiBold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Pledges Paid
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 8 }}>
              <Text style={{ fontSize: 24, fontFamily: typography.fontFamily.extraBold, color: colors.primary }}>
                {paidFraction}
              </Text>
              <Text style={{ fontSize: 14, fontFamily: typography.fontFamily.bold, color: colors.success, marginLeft: 8, marginBottom: 3 }}>
                ({paidPercentage}%)
              </Text>
            </View>
          </View>
        </View>

        {/* ── Action Area ── */}
        <View style={styles.actionArea}>
          <Button 
            label={activeTab === 0 ? "Donate Now" : "Make a New Pledge"} 
            onPress={() => {
              if (activeTab === 0) {
                router.push('/(modals)/donate');
              } else {
                router.push('/(modals)/new-pledge');
              }
            }} 
            fullWidth 
            size="lg" 
          />
        </View>

        {/* ── Tabs ── */}
        <TabSwitcher
          tabs={['My Donations', 'My Pledges']}
          activeIndex={activeTab}
          onTabChange={setActiveTab}
        />

        {/* ── Unified Feed List ── */}
        <View style={styles.feedContainer}>
          {/* My Donations */}
          {activeTab === 0 && (
            <View>
              {MOCK_DONATIONS.length === 0 ? (
                <EmptyState icon="heart-outline" title="No Donations Yet" message="Your giving history will appear here once you make your first donation." />
              ) : (
                MOCK_DONATIONS.map((d) => (
                  <DonationRow 
                    key={d.id} 
                    item={d} 
                    onPress={() => router.push({ pathname: '/(modals)/donation-detail', params: { id: d.id } })}
                  />
                ))
              )}
            </View>
          )}

          {/* My Pledges */}
          {activeTab === 1 && (
            <View>
              {MOCK_PLEDGES.length === 0 ? (
                <EmptyState icon="document-text-outline" title="No Pledges Made" message="Pledges you make will appear here." />
              ) : (
                MOCK_PLEDGES.map((pledge) => (
                  <PledgeCard 
                    key={pledge.id} 
                    pledge={pledge} 
                    onPress={() => router.push({ pathname: '/(modals)/pledge-detail', params: { id: pledge.id } })}
                  />
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  summaryWrap: { 
    paddingHorizontal: 20, 
    marginTop: -20 
  },
  scroll: { 
    paddingHorizontal: 20, 
    paddingTop: 20, 
    paddingBottom: 40 
  },
  kpiRow: { 
    flexDirection: 'row', 
    gap: 12, 
    marginBottom: 20 
  },
  kpiCard: { 
    flex: 1, 
    padding: 16, 
    borderWidth: 1 
  },
  actionArea: { 
    marginBottom: 24
   },
  feedContainer: { 
    marginTop: 10 
  },
});
