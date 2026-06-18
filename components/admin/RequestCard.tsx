import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Avatar } from '@/components/ui/Avatar';

interface RequestCardProps {
  userName: string;
  requestDate: string;
  targetGroupName: string;
  currentGroupName?: string;
  onApprove: () => void;
  onReject: () => void;
  isProcessing?: boolean;
}

export function RequestCard({ userName, requestDate, targetGroupName, currentGroupName, onApprove, onReject, isProcessing }: RequestCardProps) {
  const { colors, typography, radius } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
      <View style={styles.header}>
        <Avatar name={userName} size={40} />
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
            {userName}
          </Text>
          <Text style={[styles.meta, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
            {requestDate} • From {currentGroupName?.toUpperCase() || 'NEW'}
          </Text>
        </View>
      </View>

      <View style={[styles.body, { backgroundColor: colors.surfaceMuted, borderRadius: radius.md }]}>
        <Text style={{ fontSize: 13, color: colors.textSecondary, fontFamily: typography.fontFamily.medium }}>
          Requests to join: <Text style={{ fontFamily: typography.fontFamily.bold, color: colors.primary }}>{targetGroupName.toUpperCase()}</Text>
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.btn, styles.btnOutline, { borderColor: colors.border, borderRadius: radius.md }]}
          onPress={onReject}
          disabled={isProcessing}
        >
          <Text style={[styles.btnText, { color: colors.textSecondary, fontFamily: typography.fontFamily.semiBold }]}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.primary, borderRadius: radius.md }]}
          onPress={onApprove}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={[styles.btnText, { color: '#FFFFFF', fontFamily: typography.fontFamily.semiBold }]}>Approve</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 15,
  },
  meta: {
    fontSize: 11,
    marginTop: 2,
  },
  body: {
    padding: 12,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutline: {
    borderWidth: 1,
  },
  btnText: {
    fontSize: 13,
  },
});
