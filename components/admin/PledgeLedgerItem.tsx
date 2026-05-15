import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { AdminPledge } from '@/constants/mockData';

interface PledgeLedgerItemProps {
  item: AdminPledge;
}

export function PledgeLedgerItem({ item }: PledgeLedgerItemProps) {
  const { colors, typography } = useTheme();

  const formattedTotal = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(item.totalPledge);
  const formattedPaid = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(item.paidAmount);

  return (
    <View style={[styles.container, { borderBottomColor: colors.divider }]}>
      <View style={styles.leftCol}>
        <Text style={[styles.name, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
          {item.name}
        </Text>
        <Text style={[styles.subText, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
          Paid: {formattedPaid} of {formattedTotal}
        </Text>
      </View>
      
      <View style={styles.rightCol}>
        <View style={[
          styles.statusDot, 
          { 
            backgroundColor: item.status === 'Paid' ? colors.text : 'transparent',
            borderColor: item.status === 'Overdue' ? colors.border : colors.text,
            borderWidth: item.status === 'Paid' ? 0 : 1.5
          }
        ]} />
        <Text style={[
          styles.statusText, 
          { 
            color: item.status === 'Overdue' ? colors.danger : colors.text,
            fontFamily: typography.fontFamily.semiBold
          }
        ]}>
          {item.status}
        </Text>
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
  rightCol: {
    alignItems: 'flex-end',
    gap: 6,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
