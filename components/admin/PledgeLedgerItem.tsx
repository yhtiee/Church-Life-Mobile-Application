import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { AdminPledge } from '@/constants/mockData';

interface PledgeLedgerItemProps {
  item: AdminPledge;
}

export function PledgeLedgerItem({ item }: PledgeLedgerItemProps) {
  const { colors, typography } = useTheme();

  const formattedTotal = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(item.totalPledge);
  const formattedPaid = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(item.paidAmount);
  const formattedFulfilled = item.fulfilledAmount ? new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(item.fulfilledAmount) : null;

  // Determine status color and icon based on workflow status
  const getStatusInfo = () => {
    switch (item.status) {
      case 'fulfilled':
        return { color: colors.success, icon: 'checkmark-circle', label: 'Fulfilled', bgColor: colors.successBg };
      case 'approved':
        return { color: colors.accent, icon: 'checkmark-outline', label: 'Approved', bgColor: colors.accentLight };
      case 'pending':
        return { color: colors.warning, icon: 'time-outline', label: 'Pending Review', bgColor: colors.warningBg };
      case 'rejected':
        return { color: colors.danger, icon: 'close-circle', label: 'Rejected', bgColor: colors.dangerBg };
      case 'Paid':
        return { color: colors.success, icon: 'checkmark-circle', label: 'Paid', bgColor: colors.successBg };
      case 'Overdue':
        return { color: colors.danger, icon: 'alert-circle', label: 'Overdue', bgColor: colors.dangerBg };
      case 'Pending':
      default:
        return { color: colors.textSecondary, icon: 'ellipsis-horizontal', label: 'Pending', bgColor: colors.surfaceMuted };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <View style={[styles.container, { borderBottomColor: colors.divider }]}>
      <View style={styles.leftCol}>
        <Text style={[styles.name, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
          {item.name}
        </Text>
        <Text style={[styles.subText, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
          Pledged: {formattedTotal}
        </Text>
        {/* Show fulfilled amount if pledge is fulfilled */}
        {['fulfilled', 'Paid'].includes(item.status) && (
          <Text style={[styles.fulfilledText, { color: colors.success, fontFamily: typography.fontFamily.semiBold }]}>
            ✓ Fulfilled: {formattedFulfilled || formattedPaid}
          </Text>
        )}
        {/* Show pending amount for partially paid pledges */}
        {item.paidAmount > 0 && item.paidAmount < item.totalPledge && !['fulfilled', 'Paid'].includes(item.status) && (
          <Text style={[styles.subText, { color: colors.primary, fontFamily: typography.fontFamily.medium }]}>
            Received: {formattedPaid}
          </Text>
        )}
      </View>
      
      <View style={styles.rightCol}>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
          <Ionicons name={statusInfo.icon as any} size={14} color={statusInfo.color} />
          <Text style={[
            styles.statusText, 
            { 
              color: statusInfo.color,
              fontFamily: typography.fontFamily.semiBold
            }
          ]}>
            {statusInfo.label}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  leftCol: {
    flex: 1,
  },
  name: {
    fontSize: 16,
  },
  subText: {
    fontSize: 12,
    marginTop: 4,
  },
  fulfilledText: {
    fontSize: 12,
    marginTop: 4,
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 6,
    marginLeft: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
