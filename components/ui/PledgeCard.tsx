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
  
  // Determine status based on pledge.status or fallback to isPaid
  const getStatusInfo = (status?: string) => {
    switch (status) {
      case 'pending':
        return { icon: 'time-outline', color: colors.warning, bg: colors.warningBg, label: 'Under Review', borderColor: colors.warning };
      case 'approved':
        return { icon: 'checkmark-circle-outline', color: colors.info, bg: colors.infoBg, label: 'Approved', borderColor: colors.info };
      case 'fulfilled':
        return { icon: 'checkmark-circle-outline', color: colors.success, bg: colors.successBg, label: 'Recorded', borderColor: colors.success };
      case 'rejected':
        return { icon: 'close-circle-outline', color: colors.danger, bg: colors.dangerBg, label: 'Rejected', borderColor: colors.danger };
      default:
        // Fallback to isPaid logic
        return pledge.isPaid 
          ? { icon: 'checkmark-circle-outline', color: colors.success, bg: colors.successBg, label: 'Paid ✓', borderColor: colors.success }
          : { icon: 'time-outline', color: colors.warning, bg: colors.warningBg, label: `${Math.min(Math.round((pledge.paidAmount ?? 0 / pledge.targetAmount) * 100), 100)}%`, borderColor: colors.warning };
    }
  };

  const statusInfo = getStatusInfo(pledge.status);
  
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
          borderLeftColor: statusInfo.borderColor,
        },
      ]}
    >
      {/* Status icon */}
      <View style={[styles.iconCircle, { backgroundColor: statusInfo.bg }]}>
        <Ionicons
          name={statusInfo.icon as any}
          size={20}
          color={statusInfo.color}
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
          {pledge.status === 'fulfilled' && pledge.paidDate ? `Paid on ${pledge.paidDate}` : `Due: ${pledge.dueDate}`}
        </Text>

        {/* Progress bar */}
        <View style={[styles.progressTrack, { backgroundColor: colors.surfaceMuted }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: statusInfo.color, width: `${pct}%` },
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
            color: statusInfo.color,
            marginTop: 3,
            backgroundColor: statusInfo.bg,
            paddingHorizontal: 7,
            paddingVertical: 2,
            borderRadius: 6,
          }}
        >
          {statusInfo.label}
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
