import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MOCK_DONATIONS } from '@/constants/mockData';

export default function DonationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, typography } = useTheme();

  const donation = MOCK_DONATIONS.find((d) => d.id === id) ?? MOCK_DONATIONS[0];

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View style={[styles.row, { borderBottomColor: colors.divider }]}>
      <Text style={{ fontSize: 13, fontFamily: typography.fontFamily.regular, color: colors.textMuted, flex: 1 }}>{label}</Text>
      <Text style={{ fontSize: 13, fontFamily: typography.fontFamily.semiBold, color: colors.text }}>{value}</Text>
    </View>
  );

  return (
    <ScreenWrapper edges={['left', 'right']}>
      <View style={styles.scroll}>
        {/* Amount Hero */}
        <View style={[styles.hero, { backgroundColor: colors.successBg }]}>
          <Ionicons name="checkmark-circle" size={48} color={colors.success} />
          <Text style={{ fontSize: 36, fontFamily: typography.fontFamily.extraBold, color: colors.success, marginTop: 8 }}>
            {donation.currency}{donation.amount.toLocaleString()}
          </Text>
          <Text style={{ fontSize: 15, fontFamily: typography.fontFamily.regular, color: colors.textSecondary, marginTop: 4 }}>
            {donation.description}
          </Text>
        </View>

        <Card elevation="sm" style={{ margin: 20, padding: 0, overflow: 'hidden' }}>
          <InfoRow label="Description" value={donation.description} />
          <InfoRow label="Category" value={donation.category} />
          <InfoRow label="Amount" value={`${donation.currency}${donation.amount.toLocaleString()}`} />
          <InfoRow label="Date" value={donation.date} />
          <InfoRow label="Status" value="Confirmed" />
        </Card>

        <View style={{ paddingHorizontal: 20 }}>
          <Badge label="Transaction Confirmed ✓" variant="success" />
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, paddingBottom: 48 },
  hero: { padding: 32, alignItems: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
});
