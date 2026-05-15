import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Badge } from './Badge';
import type { Donation } from '@/constants/mockData';

interface DonationRowProps { item: Donation; onPress?: () => void; }

export function DonationRow({ item, onPress }: DonationRowProps) {
  const { colors, typography } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[styles.row, { borderBottomColor: colors.divider }]}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontFamily: typography.fontFamily.bold, color: colors.text }}>{item.description}</Text>
        <Text style={{ fontSize: 12, fontFamily: typography.fontFamily.regular, color: colors.textMuted, marginTop: 4 }}>{item.date}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 15, fontFamily: typography.fontFamily.extraBold, color: colors.text }}>
          {item.currency}{item.amount.toLocaleString()}
        </Text>
        <View style={{ marginTop: 4 }}>
          <Badge label="Paid" variant="success" size="sm" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
});
