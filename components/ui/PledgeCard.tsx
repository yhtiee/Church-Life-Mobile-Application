import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Badge } from './Badge';
import type { Pledge } from '@/constants/mockData';

interface PledgeCardProps {
  pledge: Pledge;
  onPress?: () => void;
}

export function PledgeCard({ pledge, onPress }: PledgeCardProps) {
  const { colors, typography } = useTheme();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.row, { borderBottomColor: colors.divider }]}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontFamily: typography.fontFamily.bold, color: colors.text }}>{pledge.title}</Text>
        <Text style={{ fontSize: 12, fontFamily: typography.fontFamily.regular, color: colors.textMuted, marginTop: 4 }}>
          {pledge.isPaid ? pledge.paidDate : `Due: ${pledge.dueDate}`}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 15, fontFamily: typography.fontFamily.extraBold, color: colors.text }}>
          {pledge.currency}{pledge.targetAmount.toLocaleString()}
        </Text>
        <View style={{ marginTop: 4 }}>
          <Badge 
            label={pledge.isPaid ? 'Paid' : 'Outstanding'} 
            variant={pledge.isPaid ? 'success' : 'warning'} 
            size="sm" 
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
});
