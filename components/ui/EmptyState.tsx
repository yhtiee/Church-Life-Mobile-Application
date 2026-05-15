import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
}

export function EmptyState({ icon = 'folder-open-outline', title, message }: EmptyStateProps) {
  const { colors, typography } = useTheme();
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={56} color={colors.border} />
      <Text style={{ fontSize: 17, fontFamily: typography.fontFamily.semiBold, color: colors.textSecondary, marginTop: 16, textAlign: 'center' }}>
        {title}
      </Text>
      {message && (
        <Text style={{ fontSize: 14, fontFamily: typography.fontFamily.regular, color: colors.textMuted, marginTop: 8, textAlign: 'center', lineHeight: 21 }}>
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingVertical: 60 },
});
