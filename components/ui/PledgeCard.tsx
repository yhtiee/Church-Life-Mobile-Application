import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import type { Pledge } from '@/constants/mockData';

interface PledgeCardProps {
  pledge: Pledge;
  onPress?: () => void;
}

export function PledgeCard({ pledge, onPress }: PledgeCardProps) {
  const { colors, typography } = useTheme();
  const isPaid = pledge.isPaid;
  const iconColor = isPaid ? colors.success : colors.warning;
  const iconBg = isPaid ? colors.successBg : colors.warningBg;

  // Progress fraction
  const paid = pledge.paidAmount ?? 0;
  const pct = Math.min(Math.round((paid / pledge.targetAmount) * 100), 100);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.78}
      style={[
        styles.row,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.divider,
          borderLeftColor: iconColor,
        },
      ]}
    >
      {/* Status icon */}
      <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
        <Ionicons
          name={isPaid ? 'checkmark-circle-outline' : 'time-outline'}
          size={20}
          color={iconColor}
        />
      </View>

      {/* Details */}
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text
          style={{ fontSize: 14, fontFamily: typography.fontFamily.bold, color: colors.text }}
          numberOfLines={1}
        >
          {pledge.title}
        </Text>
        <Text
          style={{ fontSize: 12, fontFamily: typography.fontFamily.regular, color: colors.textMuted, marginTop: 2 }}
        >
          {isPaid ? `Paid on ${pledge.paidDate}` : `Due: ${pledge.dueDate}`}
        </Text>

        {/* Progress bar */}
        <View style={[styles.progressTrack, { backgroundColor: colors.surfaceMuted }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: iconColor, width: `${pct}%` },
            ]}
          />
        </View>
      </View>

      {/* Amount + status */}
      <View style={{ alignItems: 'flex-end', marginLeft: 10 }}>
        <Text
          style={{ fontSize: 15, fontFamily: typography.fontFamily.extraBold, color: colors.text }}
        >
          {pledge.currency}{pledge.targetAmount.toLocaleString()}
        </Text>
        <Text
          style={{
            fontSize: 10,
            fontFamily: typography.fontFamily.semiBold,
            color: iconColor,
            marginTop: 3,
            backgroundColor: iconBg,
            paddingHorizontal: 7,
            paddingVertical: 2,
            borderRadius: 6,
          }}
        >
          {isPaid ? 'Paid ✓' : `${pct}%`}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: 3,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
    width: '100%',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
