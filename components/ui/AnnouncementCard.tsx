import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import type { Announcement } from '@/constants/mockData';

interface AnnouncementCardProps {
  item: Announcement;
  onPress?: () => void;
}

export function AnnouncementCard({ item, onPress }: AnnouncementCardProps) {
  const { colors, typography, radius } = useTheme();

  const categoryColors: Record<string, string> = {
    Liturgy: colors.primary, Events: colors.accent, Finance: colors.success,
    Education: colors.secondary, Groups: colors.info,
  };
  const catColor = categoryColors[item.category] ?? colors.textMuted;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.card, { backgroundColor: colors.surface, borderRadius: radius.md, borderColor: colors.border }]}
    >
      {item.important && (
        <View style={[styles.importantBanner, { backgroundColor: colors.accentLight }]}>
          <Ionicons name="alert-circle" size={12} color={colors.accent} />
          <Text style={{ fontSize: 11, fontFamily: typography.fontFamily.semiBold, color: colors.accent, marginLeft: 4 }}>
            Important
          </Text>
        </View>
      )}
      <View style={styles.content}>
        <View style={[styles.categoryDot, { backgroundColor: catColor }]} />
        <Text style={{ fontSize: 11, fontFamily: typography.fontFamily.semiBold, color: catColor, letterSpacing: 0.8, textTransform: 'uppercase' }}>
          {item.category}
        </Text>
      </View>
      <Text style={{ fontSize: 15, fontFamily: typography.fontFamily.bold, color: colors.text, marginTop: 6, lineHeight: 21 }} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={{ fontSize: 13, fontFamily: typography.fontFamily.regular, color: colors.textSecondary, marginTop: 4, lineHeight: 19 }} numberOfLines={2}>
        {item.body}
      </Text>
      <View style={styles.footer}>
        <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
        <Text style={{ fontSize: 11, fontFamily: typography.fontFamily.regular, color: colors.textMuted, marginLeft: 4 }}>
          {item.date}
        </Text>
        <Text style={{ fontSize: 11, fontFamily: typography.fontFamily.regular, color: colors.textMuted, marginLeft: 8 }}>
          · {item.author}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { width: 260, padding: 14, borderWidth: 1, marginRight: 12 },
  importantBanner: { flexDirection: 'row', alignItems: 'center', padding: 4, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 8 },
  content: { flexDirection: 'row', alignItems: 'center' },
  categoryDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
});
