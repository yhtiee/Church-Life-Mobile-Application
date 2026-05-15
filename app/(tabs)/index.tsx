import React, { useRef, useEffect, useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity,
  FlatList, Dimensions, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { BibleVerseCard } from '@/components/ui/BibleVerseCard';
import {
  ANNOUNCEMENTS, PARISH_HISTORY, MASS_TIMES, getDailyVerse,
} from '@/constants/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 12;
const GRID_PAD = 20;
const CELL_SIZE = (SCREEN_WIDTH - GRID_PAD * 2 - GRID_GAP) / 2;

export default function HomeScreen() {
  const { colors, typography, radius } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const dailyVerse = getDailyVerse();
  const heroRef = useRef<FlatList>(null);
  const [heroIndex, setHeroIndex] = useState(0);

  // Auto-scroll the hero every 3.5 seconds
  useEffect(() => {
    if (ANNOUNCEMENTS.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => {
        const next = (prev + 1) % ANNOUNCEMENTS.length;
        heroRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const onHeroScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setHeroIndex(idx);
  };

  const NOTICES = [
    {
      icon: 'musical-notes-outline' as const,
      color: colors.accent,
      title: 'Choir Auditions',
      body: 'The parish choir is looking for new members. Auditions every Saturday at 9AM.',
    },
    {
      icon: 'heart-outline' as const,
      color: colors.secondary,
      title: 'Marriage Preparation',
      body: 'Couples planning to wed in 2025/2026 should register at the parish office.',
    },
  ];

  return (
    <ScreenWrapper edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <ScreenHeader showGreeting/>

        <View style={styles.bentoWrapper}>
          <View style={[styles.heroCell, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
            {/* Label row */}
            <View style={[styles.heroCellHeader, { borderBottomColor: colors.divider }]}>
              <View style={styles.heroCellLabel}>
                <Ionicons name="megaphone-outline" size={14} color={colors.primary} />
                <Text style={{ fontSize: 12, fontFamily: typography.fontFamily.semiBold, color: colors.primary, marginLeft: 6, letterSpacing: 0.4 }}>
                  Announcements
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(modals)/announcements')}>
                <Text style={{ fontSize: 12, fontFamily: typography.fontFamily.medium, color: colors.accent }}>
                  See All →
                </Text>
              </TouchableOpacity>
            </View>

            {/* Slides */}
            <FlatList
              ref={heroRef}
              data={ANNOUNCEMENTS}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              onScroll={onHeroScroll}
              scrollEventThrottle={16}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => router.push({ pathname: '/(modals)/announcement-detail', params: { id: item.id } })}
                  style={[styles.heroSlide, { width: SCREEN_WIDTH - GRID_PAD * 2 }]}
                >
                  {/* Category + Important */}
                  <View style={styles.heroSlideTop}>
                    {item.important && (
                      <View style={[styles.importantChip, { backgroundColor: colors.accentLight }]}>
                        <Ionicons name="alert-circle" size={11} color={colors.accent} />
                        <Text style={{ fontSize: 10, fontFamily: typography.fontFamily.semiBold, color: colors.accent, marginLeft: 3 }}>
                          Important
                        </Text>
                      </View>
                    )}
                    <View style={[styles.categoryChip, { backgroundColor: colors.primaryLight }]}>
                      <Text style={{ fontSize: 10, fontFamily: typography.fontFamily.semiBold, color: colors.primary, letterSpacing: 0.6 }}>
                        {item.category.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 15, fontFamily: typography.fontFamily.bold, color: colors.text, lineHeight: 22, marginTop: 8 }} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={{ fontSize: 13, fontFamily: typography.fontFamily.regular, color: colors.textSecondary, lineHeight: 20, marginTop: 4 }} numberOfLines={2}>
                    {item.body}
                  </Text>
                  <View style={styles.heroSlideFooter}>
                    <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
                    <Text style={{ fontSize: 11, fontFamily: typography.fontFamily.regular, color: colors.textMuted, marginLeft: 4 }}>
                      {item.date}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted, marginLeft: 6 }}>· {item.author}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />

            {/* Dot indicator */}
            <View style={styles.dotRow}>
              {ANNOUNCEMENTS.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: i === heroIndex ? colors.primary : colors.border,
                      width: i === heroIndex ? 16 : 6,
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={styles.gridRow}>
            {/* Grid Left — Parish History */}
            <TouchableOpacity 
              style={{ flex: 1, height: 220, borderRadius: radius.lg, overflow: 'hidden' }}
              activeOpacity={0.9}
              onPress={() => router.push('/(modals)/parish-history')}
            >
              <LinearGradient
                colors={['#0A1929', '#162844']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1, padding: 14 }}
              >
                {/* Cross watermark */}
                <View style={styles.crossWrap} pointerEvents="none">
                  <View style={styles.crossV} />
                  <View style={styles.crossH} />
                </View>

                <View style={styles.cellIcon}>
                  <Ionicons name="add-circle-outline" size={20} color="#D4AF37" />
                </View>
                <Text style={{ fontSize: 10, fontFamily: typography.fontFamily.semiBold, color: 'rgba(255,255,255,0.5)', letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 10 }}>
                  Founded {PARISH_HISTORY.founded}
                </Text>
                <Text style={{ fontSize: 14, fontFamily: typography.fontFamily.bold, color: '#FFFFFF', marginTop: 4, lineHeight: 20 }} numberOfLines={2}>
                  {PARISH_HISTORY.patron}
                </Text>
                <Text style={{ fontSize: 11, fontFamily: typography.fontFamily.regular, color: 'rgba(255,255,255,0.55)', marginTop: 6, lineHeight: 16 }} numberOfLines={3}>
                  {PARISH_HISTORY.brief}
                </Text>
                <View style={styles.readMoreBtn}>
                  <Text style={{ fontSize: 12, fontFamily: typography.fontFamily.semiBold, color: '#D4AF37' }}>
                    Read More →
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Grid Right — Bible Study */}
            <TouchableOpacity 
              style={{ flex: 1, height: 220, borderRadius: radius.lg, overflow: 'hidden' }}
              activeOpacity={0.9}
              onPress={() => router.push('/(modals)/bible-verse')}
            >
              <BibleVerseCard verse={dailyVerse} compact />
            </TouchableOpacity>
          </View>

          <Card
            elevation="sm"
            padding={0}
            style={[styles.bannerCard, { borderLeftColor: colors.accent, borderRadius: radius.lg }]}
          >
            {/* Banner header */}
            <View style={[styles.bannerHeader, { borderBottomColor: colors.divider }]}>
              <View style={styles.heroCellLabel}>
                <Ionicons name="newspaper-outline" size={14} color={colors.primary} />
                <Text style={{ fontSize: 12, fontFamily: typography.fontFamily.semiBold, color: colors.primary, marginLeft: 6, letterSpacing: 0.4 }}>
                  Parish Notices
                </Text>
              </View>
              <Text style={{ fontSize: 10, fontFamily: typography.fontFamily.regular, color: colors.textMuted, letterSpacing: 0.5 }}>
                Sponsored
              </Text>
            </View>

            {/* Notice rows */}
            {NOTICES.map((n, i) => (
              <View
                key={i}
                style={[
                  styles.noticeRow,
                  {
                    borderBottomColor: i < NOTICES.length - 1 ? colors.divider : 'transparent',
                    borderBottomWidth: i < NOTICES.length - 1 ? StyleSheet.hairlineWidth : 0,
                  },
                ]}
              >
                <View style={[styles.noticeIcon, { backgroundColor: n.color + '18' }]}>
                  <Ionicons name={n.icon} size={18} color={n.color} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ fontSize: 14, fontFamily: typography.fontFamily.bold, color: colors.text }}>
                    {n.title}
                  </Text>
                  <Text style={{ fontSize: 12, fontFamily: typography.fontFamily.regular, color: colors.textSecondary, marginTop: 3, lineHeight: 18 }}>
                    {n.body}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.border} style={{ marginLeft: 8 }} />
              </View>
            ))}
          </Card>

          {/* ══════════════════════════════════════════════
              MASS TIMES — Quick Reference Card
          ══════════════════════════════════════════════ */}
          <Card elevation="sm" style={[styles.massCard, { borderRadius: radius.lg }]}>
            <View style={[styles.heroCellLabel, { marginBottom: 14 }]}>
              <Ionicons name="time-outline" size={14} color={colors.primary} />
              <Text style={{ fontSize: 12, fontFamily: typography.fontFamily.semiBold, color: colors.primary, marginLeft: 6, letterSpacing: 0.4 }}>
                Mass Times
              </Text>
            </View>
            <View style={styles.massGrid}>
              {MASS_TIMES.map((mt) => (
                <View key={mt.day} style={[styles.massColumn, { borderColor: colors.border }]}>
                  <Text style={{ fontSize: 11, fontFamily: typography.fontFamily.bold, color: colors.primary, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 }}>
                    {mt.day}
                  </Text>
                  {mt.times.map((t) => (
                    <View key={t} style={[styles.timePill, { backgroundColor: colors.primaryLight }]}>
                      <Text style={{ fontSize: 11, fontFamily: typography.fontFamily.medium, color: colors.primary }}>
                        {t}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </Card>

        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 18,
  },
  awaitingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginLeft: 8,
  },
  notifDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#1D3557',
  },

  // Bento wrapper
  bentoWrapper: {
    paddingHorizontal: GRID_PAD,
    paddingTop: 16,
    gap: GRID_GAP,
  },

  // Hero cell
  heroCell: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  heroCellHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  heroCellLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroSlide: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  heroSlideTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  importantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryChip: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  heroSlideFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 10,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },

  // Grid row
  gridRow: {
    flexDirection: 'row',
    gap: GRID_GAP,
  },
  gridCell: {
    flex: 1,
    height: 220,
    overflow: 'hidden',
    padding: 14,
  },

  // Parish History cell decorations
  crossWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crossV: {
    position: 'absolute',
    width: 28,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  crossH: {
    position: 'absolute',
    height: 28,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  cellIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(212,175,55,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  readMoreBtn: {
    marginTop: 10,
  },

  // Banner (Notices)
  bannerCard: {
    borderLeftWidth: 4,
    padding: 0,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  noticeIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Mass Times card
  massCard: {
    marginBottom: 4,
  },
  massGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  massColumn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 4,
    gap: 6,
  },
  timePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    alignItems: 'center',
  },
});
