import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Badge } from '@/components/ui/Badge';
import { ANNOUNCEMENTS } from '@/constants/mockData';

export default function AnnouncementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, typography } = useTheme();

  const announcement = ANNOUNCEMENTS.find((a) => a.id === id) ?? ANNOUNCEMENTS[0];

  return (
    <ScreenWrapper edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.badges}>
            <Badge label={announcement.category} variant="primary" size="sm" />
            {announcement.important && <Badge label="Important" variant="accent" size="sm" />}
          </View>
          <Text style={{ fontSize: 24, fontFamily: typography.fontFamily.extraBold, color: colors.text, marginTop: 12, lineHeight: 32 }}>
            {announcement.title}
          </Text>
          <View style={styles.meta}>
            <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
            <Text style={{ fontSize: 13, fontFamily: typography.fontFamily.regular, color: colors.textMuted, marginLeft: 6 }}>
              {announcement.date}
            </Text>
            <Text style={{ fontSize: 13, fontFamily: typography.fontFamily.regular, color: colors.textMuted, marginLeft: 12 }}>
              · {announcement.author}
            </Text>
          </View>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Text style={{ fontSize: 15, fontFamily: typography.fontFamily.regular, color: colors.text, lineHeight: 26 }}>
          {announcement.body}
        </Text>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 24, paddingBottom: 48 },
  header: {},
  badges: { flexDirection: 'row', gap: 8 },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  divider: { height: 1, marginVertical: 20 },
});
