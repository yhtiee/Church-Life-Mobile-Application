import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';
import { Card } from '@/components/ui/Card';
import type { DatabaseBankAccount } from '@/lib/supabase/entities/types';

interface Props {
  account: DatabaseBankAccount;
  selected?: boolean;
  onSelect?: () => void;
}

/**
 * One published parish account, with the number tappable to copy.
 *
 * Members type these into a banking app, so copying matters more than it
 * looks: a mistyped account number is a payment that never arrives.
 */
export function BankAccountCard({ account, selected, onSelect }: Props) {
  const { colors, typography, radius } = useTheme();
  const [copied, setCopied] = useState(false);

  const copyNumber = async () => {
    await Clipboard.setStringAsync(account.account_number);
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card
      elevation="sm"
      style={{
        padding: 16,
        borderRadius: radius.lg,
        marginBottom: 12,
        borderWidth: selected ? 2 : 0,
        borderColor: selected ? colors.primary : 'transparent',
      }}
      pressable={!!onSelect}
      onPress={onSelect}
    >
      <View style={styles.headerRow}>
        <Text
          style={{ fontSize: 13, color: colors.primary, fontFamily: typography.fontFamily.semiBold }}
        >
          {account.label}
        </Text>
        {selected && <Ionicons name="checkmark-circle" size={18} color={colors.primary} />}
      </View>

      <Text
        style={{
          fontSize: 22,
          color: colors.text,
          fontFamily: typography.fontFamily.bold,
          letterSpacing: 1.5,
          marginTop: 10,
        }}
      >
        {account.account_number}
      </Text>

      <Text
        style={{
          fontSize: 14,
          color: colors.text,
          fontFamily: typography.fontFamily.medium,
          marginTop: 6,
        }}
      >
        {account.account_name}
      </Text>
      <Text
        style={{
          fontSize: 13,
          color: colors.textSecondary,
          fontFamily: typography.fontFamily.regular,
          marginTop: 2,
        }}
      >
        {account.bank_name}
      </Text>

      {account.instructions ? (
        <Text
          style={{
            fontSize: 12,
            color: colors.textMuted,
            fontFamily: typography.fontFamily.regular,
            marginTop: 8,
            lineHeight: 18,
          }}
        >
          {account.instructions}
        </Text>
      ) : null}

      <TouchableOpacity
        onPress={copyNumber}
        style={[styles.copyBtn, { borderColor: colors.border, borderRadius: radius.md }]}
      >
        <Ionicons
          name={copied ? 'checkmark' : 'copy-outline'}
          size={15}
          color={copied ? colors.success : colors.primary}
        />
        <Text
          style={{
            fontSize: 13,
            marginLeft: 6,
            color: copied ? colors.success : colors.primary,
            fontFamily: typography.fontFamily.semiBold,
          }}
        >
          {copied ? 'Copied' : 'Copy account number'}
        </Text>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingVertical: 9,
    marginTop: 14,
  },
});
