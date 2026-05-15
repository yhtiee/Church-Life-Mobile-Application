import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ANNOUNCEMENTS } from '@/constants/mockData';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export default function AnnouncementsModal() {
  const { colors, typography, radius } = useTheme();

  return (
    <ScreenWrapper edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <Text style={[styles.title, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
          Parish Announcements
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
          Keep up with the latest updates from the parish and your various groups.
        </Text>

        <View style={styles.list}>
          {ANNOUNCEMENTS.map((item) => (
            <Card key={item.id} elevation="sm" style={styles.announcementCard}>
              <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                  <Badge 
                    label={item.category} 
                    variant={item.important ? 'danger' : 'muted'} 
                    size="sm" 
                  />
                  <Text style={[styles.date, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                    {item.date}
                  </Text>
                </View>
                {item.important && (
                  <Ionicons name="alert-circle" size={18} color={colors.danger} />
                )}
              </View>

              <Text style={[styles.cardTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
                {item.title}
              </Text>
              
              <Text style={[styles.cardBody, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
                {item.body}
              </Text>

              <View style={[styles.footer, { borderTopColor: colors.divider }]}>
                <View style={styles.authorBox}>
                  <Ionicons name="person-outline" size={14} color={colors.textMuted} />
                  <Text style={[styles.author, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                    {item.author}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  title: { fontSize: 24, marginBottom: 8 },
  subtitle: { fontSize: 14, lineHeight: 22, marginBottom: 24 },
  list: { gap: 16 },
  announcementCard: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  date: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardTitle: { fontSize: 17, marginBottom: 8, lineHeight: 24 },
  cardBody: { fontSize: 14, lineHeight: 22, marginBottom: 16 },
  footer: { paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
  authorBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  author: { fontSize: 12 },
});
