import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import type { Donation } from '@/constants/mockData';

interface DonationRowProps {
  item: Donation;
  onPress?: () => void;
}

const CATEGORY_ICONS: Record<string, any> = {
  'Tithe & Offering': 'heart-outline',
  'Harvest':          'leaf-outline',
  'Special Collection': 'star-outline',
  'Mission':          'earth-outline',
};

export function DonationRow({ item, onPress }: DonationRowProps) {
  const { colors, typography } = useTheme();
  const icon = CATEGORY_ICONS[item.category] ?? 'cash-outline';

  // Determine status badge
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Under Review', color: colors.warning, bg: colors.warningBg };
      case 'approved':
        return { label: 'Approved', color: colors.info, bg: colors.infoBg };
      case 'fulfilled':
        return { label: 'Recorded', color: colors.success, bg: colors.successBg };
      case 'rejected':
        return { label: 'Rejected', color: colors.danger, bg: colors.dangerBg };
      default:
        return { label: 'Paid', color: colors.success, bg: colors.successBg };
    }
  };

  const statusBadge = getStatusBadge(item.status);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        styles.row,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.divider,
        },
      ]}
    >
      {/* Icon circle */}
      <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>

      {/* Description */}
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text
          style={{ fontSize: 14, fontFamily: typography.fontFamily.bold, color: colors.text }}
          numberOfLines={1}
        >
          {item.description}
        </Text>
        <Text
          style={{ fontSize: 12, fontFamily: typography.fontFamily.regular, color: colors.textMuted, marginTop: 3 }}
        >
          {item.date} · {item.category}
        </Text>
      </View>

      {/* Amount */}
      <View style={{ alignItems: 'flex-end' }}>
        <Text
          style={{ fontSize: 15, fontFamily: typography.fontFamily.extraBold, color: colors.success }}
        >
          {item.currency}{item.amount.toLocaleString()}
        </Text>
        <Text
          style={{
            fontSize: 10,
            fontFamily: typography.fontFamily.semiBold,
            color: statusBadge.color,
            marginTop: 2,
            backgroundColor: statusBadge.bg,
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 6,
          }}
        >
          {statusBadge.label}
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
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
