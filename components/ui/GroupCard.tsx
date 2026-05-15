import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import type { ChurchGroup } from '@/constants/groups';
import { Badge } from './Badge';

interface GroupCardProps {
  group: ChurchGroup;
  onPress?: () => void;
  isMyGroup?: boolean;
  isLocked?: boolean;
  onRequestAccess?: () => void;
}

export function GroupCard({ group, onPress, isMyGroup, isLocked, onRequestAccess }: GroupCardProps) {
  const { colors, typography, radius } = useTheme();

  return (
    <TouchableOpacity
      onPress={isLocked ? undefined : onPress}
      activeOpacity={0.8}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          borderColor: isMyGroup ? group.color : colors.border,
          borderWidth: isMyGroup ? 2 : 1,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: group.color + '20' }]}>
          <Ionicons name={group.icon as any} size={22} color={group.color} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ fontSize: 15, fontFamily: typography.fontFamily.bold, color: colors.text }} numberOfLines={1}>
            {group.name}
          </Text>
          <Text style={{ fontSize: 12, fontFamily: typography.fontFamily.semiBold, color: group.color, letterSpacing: 0.5 }}>
            {group.shortName}
          </Text>
        </View>
        {isMyGroup && <Badge label="My Group" variant="primary" size="sm" />}
        {isLocked && <Ionicons name="lock-closed" size={16} color={colors.textMuted} />}
      </View>
      <Text style={{ fontSize: 13, fontFamily: typography.fontFamily.regular, color: colors.textSecondary, marginTop: 10, lineHeight: 19 }} numberOfLines={2}>
        {group.description}
      </Text>
      {isLocked && (
        <TouchableOpacity onPress={onRequestAccess} style={[styles.requestBtn, { borderColor: colors.primary, borderRadius: radius.sm }]}>
          <Text style={{ fontSize: 13, fontFamily: typography.fontFamily.semiBold, color: colors.primary }}>Request Access</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  requestBtn: { marginTop: 12, borderWidth: 1, paddingVertical: 8, alignItems: 'center' },
});
