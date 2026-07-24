import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import GlobalLoader from '@/components/ui/GlobalLoader';
import { useAnnouncementsQuery } from '@/hooks/queries/useAnnouncements';
import { ANNOUNCEMENTS, Announcement } from '@/constants/mockData';
import { useAuth } from '@/context/AuthContext';

import { EmptyState } from '@/components/ui/EmptyState';

const CATEGORY_COLORS: Record<string, string> = {
  Liturgy:   '#2A6FDB',
  Events:    '#7C3AED',
  Finance:   '#D97706',
  Groups:    '#059669',
  Education: '#DC2626',
};

const HERO_IMAGES = [
  require('@/assets/images/church_exterior_hero.png'),
  require('@/assets/images/church_interior_hero.png'),
  require('@/assets/images/church_community_hero.png'),
  require('@/assets/images/bible_study_hero.png'),
];

const FILTERS = ['All', 'Liturgy', 'Events', 'Finance', 'Groups', 'Education'];

export default function AnnouncementsModal() {
  const { colors, typography, radius } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('All');

  const { data: announcements = [], isLoading: loading, refetch, isRefetching } = useAnnouncementsQuery(user?.parishId);

  const filtered = activeFilter === 'All'
    ? announcements
    : announcements.filter((a) => a.category === activeFilter);

  return (
    <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
      <ScreenHeader title="Announcements" />
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { flexGrow: 1, backgroundColor: colors.background }]}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >

        {/* Filter chips */}
        <Animated.View entering={FadeInDown.delay(80).duration(350)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {FILTERS.map((f) => {
              const active = activeFilter === f;
              return (
                <TouchableOpacity
                  key={f}
                  onPress={() => setActiveFilter(f)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: active ? colors.primary : colors.surface,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      {
                        color: active ? '#FFFFFF' : colors.textSecondary,
                        fontFamily: typography.fontFamily.semiBold,
                      },
                    ]}
                  >
                    {f}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Announcement list */}
        <View style={styles.list}>
          {!loading && filtered.length === 0 ? (
            <EmptyState
              icon="megaphone-outline"
              title="No Announcements"
              message="Check back later for news, updates, and upcoming parish events."
            />
          ) : (
            filtered.map((item, index) => {
              const catColor = CATEGORY_COLORS[item.category] ?? colors.primary;
              return (
                <Animated.View
                  key={item.id}
                  entering={FadeInDown.delay(index * 70 + 140).duration(400)}
                >
                  <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={() =>
                      router.push({
                        pathname: '/(modals)/announcement-detail',
                        params: { id: item.id },
                      })
                    }
                    style={[
                      styles.card,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        borderLeftColor: item.important ? '#D4AF37' : catColor,
                      },
                    ]}
                  >
                    {/* Thumbnail */}
                    <View style={styles.thumbWrapper}>
                      <Image
                        source={HERO_IMAGES[index % HERO_IMAGES.length]}
                        style={styles.thumb}
                        contentFit="cover"
                      />
                      <View style={[styles.thumbOverlay, { backgroundColor: catColor + 'CC' }]}>
                        <Ionicons name="newspaper-outline" size={18} color="#FFFFFF" />
                      </View>
                    </View>

                    {/* Content */}
                    <View style={styles.cardBody}>
                      {/* Top row */}
                      <View style={styles.cardTopRow}>
                        <View style={[styles.categoryPill, { backgroundColor: catColor + '18' }]}>
                          <Text style={[styles.categoryPillText, { color: catColor, fontFamily: typography.fontFamily.bold }]}>
                            {item.category}
                          </Text>
                        </View>
                        {item.important && (
                          <View style={styles.importantBadge}>
                            <Ionicons name="alert-circle" size={12} color="#D4AF37" />
                            <Text style={[styles.importantText, { fontFamily: typography.fontFamily.semiBold }]}>
                              Important
                            </Text>
                          </View>
                        )}
                      </View>

                      <Text
                        style={[styles.cardTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}
                        numberOfLines={2}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={[styles.cardExcerpt, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}
                        numberOfLines={2}
                      >
                        {item.body}
                      </Text>

                      {/* Footer */}
                      <View style={[styles.cardFooter, { borderTopColor: colors.divider }]}>
                        <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
                        <Text style={[styles.dateText, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                          {item.date}
                        </Text>
                        <Text style={[styles.authorText, { color: colors.textMuted, fontFamily: typography.fontFamily.regular }]}>
                          · {item.author}
                        </Text>
                        <View style={{ flex: 1 }} />
                        <Text style={[styles.readMore, { color: colors.primary, fontFamily: typography.fontFamily.semiBold }]}>
                          Read →
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })
          )}
        </View>
      </ScrollView>
      <GlobalLoader visible={loading} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 48 },
  intro: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  introTitle: { fontSize: 22, letterSpacing: -0.3, marginBottom: 4 },
  introSub: { fontSize: 14, lineHeight: 20 },

  filterRow: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    letterSpacing: 0.2,
  },

  list: { paddingHorizontal: 20, gap: 14 },

  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderLeftWidth: 4,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  thumbWrapper: {
    width: 80,
    position: 'relative',
  },
  thumb: {
    ...StyleSheet.absoluteFillObject,
  },
  thumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    padding: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryPillText: {
    fontSize: 10,
    letterSpacing: 0.3,
  },
  importantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  importantText: {
    fontSize: 10,
    color: '#D4AF37',
  },
  cardTitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  cardExcerpt: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
  },
  dateText: { fontSize: 11 },
  authorText: { fontSize: 11 },
  readMore: { fontSize: 11 },
  loadingWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
