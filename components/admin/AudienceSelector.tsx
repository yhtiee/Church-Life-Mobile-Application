import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { OPEN_GROUPS } from '@/constants/groups';

interface AudienceSelectorProps {
  selectedGroups: string[];
  onPress: () => void;
}

export function AudienceSelector({ selectedGroups, onPress }: AudienceSelectorProps) {
  const { colors, typography, radius } = useTheme();

  const label = selectedGroups.length === 0 
    ? 'Select Target Group(s)' 
    : selectedGroups.length === OPEN_GROUPS.length 
      ? 'All Groups' 
      : `${selectedGroups.length} Group(s) Selected`;

  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[styles.container, { backgroundColor: colors.surfaceMuted, borderRadius: radius.md, borderColor: colors.border }]}
    >
      <View style={styles.content}>
        <Ionicons name="people-outline" size={20} color={colors.primary} />
        <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.semiBold }]}>
          {label}
        </Text>
      </View>
      <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 14,
  },
});
