import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { CampaignHero } from '@/components/admin/CampaignHero';
import { PledgeLedgerItem } from '@/components/admin/PledgeLedgerItem';
import { MOCK_ADMIN_PLEDGES, MOCK_DONATIONS } from '@/constants/mockData';

type FinanceTab = 'Collections' | 'Pledges';

export default function FinancesScreen() {
  const { colors, typography, radius } = useTheme();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<FinanceTab>('Pledges');

  const renderCollections = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted, fontFamily: typography.fontFamily.semiBold }]}>
        Recent Collections
      </Text>
      {MOCK_DONATIONS.map((item) => (
        <View key={item.id} style={[styles.donationItem, { borderBottomColor: colors.divider }]}>
          <View style={styles.donationLeft}>
            <Text style={[styles.donationDesc, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
              {item.description}
            </Text>
            <Text style={[styles.donationDate, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
              {item.date} • {item.category}
            </Text>
          </View>
          <Text style={[styles.donationAmount, { color: colors.success, fontFamily: typography.fontFamily.extraBold }]}>
            +{item.currency}{item.amount.toLocaleString()}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderPledges = () => (
    <View style={styles.tabContent}>
      <CampaignHero />
      <Text style={[styles.sectionTitle, { color: colors.textMuted, fontFamily: typography.fontFamily.semiBold }]}>
        Pledge Ledger
      </Text>
      <View style={[styles.ledgerCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
        {MOCK_ADMIN_PLEDGES.map((item) => (
          <PledgeLedgerItem key={item.id} item={item} />
        ))}
      </View>
    </View>
  );

  return (
    <ScreenWrapper edges={['top', 'left', 'right']}>
      <ScreenHeader title="Parish Finances" />

      {/* ── Segmented Tabs ── */}
      <View style={[styles.tabsContainer, { backgroundColor: colors.surface }]}>
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
      </View>

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
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  tabsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    // marginTop: 20,
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
