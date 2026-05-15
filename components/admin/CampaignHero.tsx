import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { ACTIVE_CAMPAIGN } from '@/constants/mockData';

export function CampaignHero() {
  const { colors, typography, radius } = useTheme();

  const percentage = Math.min((ACTIVE_CAMPAIGN.raised / ACTIVE_CAMPAIGN.goal) * 100, 100);
  const formattedRaised = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(ACTIVE_CAMPAIGN.raised);
  const formattedGoal = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(ACTIVE_CAMPAIGN.goal);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
      <Text style={[styles.label, { color: colors.textMuted, fontFamily: typography.fontFamily.semiBold }]}>
        {ACTIVE_CAMPAIGN.title.toUpperCase()}
      </Text>
      
      <View style={styles.amountRow}>
        <Text style={[styles.raised, { color: colors.text, fontFamily: typography.fontFamily.extraBold }]}>
          {formattedRaised}
        </Text>
        <Text style={[styles.goal, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
          / {formattedGoal}
        </Text>
      </View>

      <View style={[styles.progressBg, { backgroundColor: colors.surfaceMuted, borderRadius: radius.sm }]}>
        <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: colors.primary, borderRadius: radius.sm }]} />
      </View>

      <View style={styles.statsRow}>
        <Text style={[styles.statText, { color: colors.textSecondary, fontFamily: typography.fontFamily.medium }]}>
          {percentage.toFixed(0)}% reached
        </Text>
        <Text style={[styles.statText, { color: colors.textSecondary, fontFamily: typography.fontFamily.medium }]}>
          {ACTIVE_CAMPAIGN.contributors} Contributors
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    borderWidth: 1,
    marginBottom: 24,
  },
  label: {
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  raised: {
    fontSize: 32,
  },
  goal: {
    fontSize: 16,
    marginLeft: 8,
  },
  progressBg: {
    height: 8,
    width: '100%',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: 12,
  },
});
