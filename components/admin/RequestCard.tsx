import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { GroupRequest } from '@/constants/mockData';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

interface RequestCardProps {
  request: GroupRequest;
  onApprove: () => void;
  onReject: () => void;
}

export function RequestCard({ request, onApprove, onReject }: RequestCardProps) {
  const { colors, typography, radius } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
      <View style={styles.header}>
        <Image 
          source={request.userAvatar || 'https://via.placeholder.com/150'} 
          style={[styles.avatar, { borderRadius: 20, backgroundColor: colors.surfaceMuted }]} 
        />
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
            {request.userName}
          </Text>
          <Text style={[styles.meta, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
            {request.requestDate} • From {request.currentGroupId?.toUpperCase() || 'NEW'}
          </Text>
        </View>
      </View>

      <View style={[styles.body, { backgroundColor: colors.surfaceMuted, borderRadius: radius.md }]}>
        <Text style={{ fontSize: 13, color: colors.textSecondary, fontFamily: typography.fontFamily.medium }}>
          Requests to join: <Text style={{ fontFamily: typography.fontFamily.bold, color: colors.primary }}>{request.targetGroupId.toUpperCase()}</Text>
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.btn, styles.btnOutline, { borderColor: colors.border, borderRadius: radius.md }]} 
          onPress={onReject}
        >
          <Text style={[styles.btnText, { color: colors.textSecondary, fontFamily: typography.fontFamily.semiBold }]}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.btn, { backgroundColor: colors.primary, borderRadius: radius.md }]} 
          onPress={onApprove}
        >
          <Text style={[styles.btnText, { color: '#FFFFFF', fontFamily: typography.fontFamily.semiBold }]}>Approve</Text>
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
  avatar: {
    width: 40,
    height: 40,
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
