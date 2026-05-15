import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}

export function SectionHeader({ title, actionLabel, onAction, icon, style }: SectionHeaderProps) {
  const { colors, typography } = useTheme();
  return (
    <View style={[styles.row, style]}>
      <View style={styles.left}>
        {icon && <Ionicons name={icon} size={16} color={colors.primary} style={styles.icon} />}
        <Text style={{ fontSize: 17, fontFamily: typography.fontFamily.bold, color: colors.text, letterSpacing: -0.2 }}>
          {title}
        </Text>
      </View>
      {actionLabel && (
        <TouchableOpacity onPress={onAction}>
          <Text style={{ fontSize: 13, fontFamily: typography.fontFamily.semiBold, color: colors.primary }}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, marginTop: 8 },
  left: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: 8 },
});
