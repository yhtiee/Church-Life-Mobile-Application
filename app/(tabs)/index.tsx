import React, { useRef, useEffect, useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity,
  FlatList, Dimensions, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { PARISH_HISTORY, MASS_TIMES, getDailyVerse } from '@/constants/mockData';
import { AnnoucementService } from '@/lib/supabase/services/announcements';
import { Gradients } from '@/constants/theme';
import GlobalLoader from '@/components/ui/GlobalLoader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Hero announcement images
const HERO_IMAGES = [
  require('@/assets/images/church_exterior_hero.png'),
  require('@/assets/images/church_interior_hero.png'),
  require('@/assets/images/church_community_hero.png'),
  require('@/assets/images/bible_study_hero.png'),
];

const FEATURE_SLIDES = [
  {
    id: 'f1',
    title: 'Liturgical Mass Booking',
    body: 'Book Mass intentions for Thanksgiving, Memorial, or Healing, and receive your digital ticket instantly.',
    image: require('@/assets/images/mass_booking_slide.png'),
    route: '/(modals)/mass',
    tag: 'Mass Scheduling',
  },
  {
    id: 'f2',
    title: 'Interactive Bible Companion',
    body: 'Read the full Bible, search for books or chapters, and bookmark your favorite daily verses.',
    image: require('@/assets/images/bible_feature_slide.png'),
    route: '/(tabs)/bible',
    tag: 'Bible Study',
  },
  {
    id: 'f3',
    title: 'Parish Tithing & Pledges',
    body: 'Securely track your tithes, Sunday offerings, special collections, and outstanding pledge campaigns.',
    image: require('@/assets/images/giving_feature_slide.png'),
    route: '/(tabs)/finance',
    tag: 'Giving & Finance',
  },
  {
    id: 'f4',
    title: 'Parish Groups & Chat',
    body: 'Join official church organizations (CYON, CMO, CWO) to participate in group messages and announcements.',
    image: require('@/assets/images/community_feature_slide.png'),
    route: '/(tabs)/groups',
    tag: 'Community Groups',
  },
];

const QUICK_ACTIONS = [
  {
    icon: 'cash-outline' as const,
    label: 'Deposit',
    bg: '#E8F0FE',
    iconColor: '#2A6FDB',
    gradient: Gradients.heroBlue,
    route: '/(modals)/donate',
  },
  {
    icon: 'wallet-outline' as const,
    label: 'Finance',
    bg: '#FEF3C7',
    iconColor: '#D97706',
    gradient: Gradients.cardGold,
    route: '/(tabs)/finance',
  },
  {
    icon: 'musical-notes-outline' as const,
    label: 'Hymn',
    bg: '#EDE9FE',
    iconColor: '#7C3AED',
    gradient: Gradients.cardPurple,
    route: '/(modals)/hymn',
  },
  {
    icon: 'calendar-outline' as const,
    label: 'Mass',
    bg: '#D1FAE5',
    iconColor: '#059669',
    gradient: Gradients.cardGreen,
    route: '/(modals)/mass',
  },
] as const;

const TODAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];

export default function HomeScreen() {
  const { colors, typography, radius, isDark } = useTheme();
  const router = useRouter();

  const dailyVerse = getDailyVerse();
  const heroRef = useRef<FlatList>(null);
  const [heroIndex, setHeroIndex] = useState(0);

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const hasAnnouncements = announcements && announcements.length > 0;
  const carouselData = hasAnnouncements ? announcements : FEATURE_SLIDES;

  useEffect(() => {
    let active = true;
    const fetchAnnouncements = async () => {
      try {
        const service = new AnnoucementService();
        const { data, error } = await service.fetchAnnouncements();
        if (active) {
          if (!error && data) {
            setAnnouncements(data);
          } else {
            setAnnouncements([]);
          }
        }
      } catch (err) {
        console.error('Failed to load announcements:', err);
        if (active) setAnnouncements([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchAnnouncements();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (carouselData.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => {
        const next = (prev + 1) % carouselData.length;
        heroRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, [carouselData.length]);

  const onHeroScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setHeroIndex(idx);
  };



  return (
    <ScreenWrapper edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── Greeting Header ── */}
        <ScreenHeader showGreeting />

        {/* ── Search Bar ── */}
        <Animated.View
          entering={FadeInDown.delay(80).duration(400)}
          style={styles.searchWrapper}
        >
          <TouchableOpacity
            style={[
              styles.searchBar,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: colors.cardShadowColor,
              },
            ]}
            activeOpacity={0.8}
            onPress={() => router.push('/(modals)/announcements')}
          >
            <Ionicons name="search-outline" size={18} color={colors.textMuted} />
            <Text
              style={[
                styles.searchPlaceholder,
                { color: colors.textMuted, fontFamily: typography.fontFamily.regular },
              ]}
            >
              Search for announcements, events...
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Quick Actions ── */}
        <Animated.View entering={FadeInDown.delay(140).duration(400)}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
              Quick Access
            </Text>
          </View>
          <View style={styles.quickRow}>
            {QUICK_ACTIONS.map((qa, i) => (
              <Animated.View key={qa.label} entering={ZoomIn.delay(i * 50 + 160).duration(350)}>
                <TouchableOpacity
                  style={styles.quickTile}
                  activeOpacity={0.8}
                  onPress={() => router.push(qa.route as any)}
                >
                  <View
                    style={[
                      styles.quickIconBox,
                      { backgroundColor: isDark ? colors.surface : qa.bg, borderColor: colors.border },
                    ]}
                  >
                    <Ionicons name={qa.icon} size={24} color={isDark ? colors.primary : qa.iconColor} />
                  </View>
                  <Text
                    style={[
                      styles.quickLabel,
                      { color: colors.textSecondary, fontFamily: typography.fontFamily.semiBold },
                    ]}
                    numberOfLines={1}
                  >
                    {qa.label}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* ── Announcements Carousel ── */}
        <Animated.View
          entering={FadeInDown.delay(220).duration(450)}
          style={styles.section}
        >
          {/* Section header */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
              {hasAnnouncements ? 'Announcements' : 'Explore ChurchLife'}
            </Text>
            {hasAnnouncements && (
              <TouchableOpacity onPress={() => router.push('/(modals)/announcements')}>
                <Text style={[styles.seeAll, { color: colors.primary, fontFamily: typography.fontFamily.semiBold }]}>
                  See All →
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Full-width carousel */}
          <View style={styles.carouselWrapper}>
            <FlatList
              ref={heroRef}
              data={carouselData}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              onScroll={onHeroScroll}
              scrollEventThrottle={16}
              decelerationRate="fast"
              snapToAlignment="center"
              renderItem={({ item, index }) => {
                const isAnnouncement = 'important' in item;
                const imageSource = isAnnouncement
                  ? HERO_IMAGES[index % HERO_IMAGES.length]
                  : (item as any).image;

                const handlePress = () => {
                  if (isAnnouncement) {
                    router.push({
                      pathname: '/(modals)/announcement-detail',
                      params: { id: item.id },
                    });
                  } else {
                    router.push((item as any).route);
                  }
                };

                return (
                  <TouchableOpacity
                    activeOpacity={0.95}
                    onPress={handlePress}
                    style={styles.carouselSlide}
                  >
                    {/* Background image */}
                    <Image
                      source={imageSource}
                      style={StyleSheet.absoluteFillObject}
                      contentFit="cover"
                    />
                    {/* Dark gradient overlay */}
                    <LinearGradient
                      colors={Gradients.overlayDark as any}
                      style={StyleSheet.absoluteFillObject}
                    />

                    {/* Content overlay */}
                    <View style={styles.carouselContent}>
                      {/* Category chip */}
                      <View
                        style={[
                          styles.categoryChip,
                          {
                            backgroundColor: isAnnouncement
                              ? (item.important ? 'rgba(212,175,55,0.85)' : 'rgba(42,111,219,0.85)')
                              : 'rgba(124,58,237,0.85)',
                          },
                        ]}
                      >
                        <Text style={[styles.categoryText, { fontFamily: typography.fontFamily.bold }]}>
                          {isAnnouncement
                            ? (item.important ? '★ Important' : item.category)
                            : (item as any).tag}
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.carouselTitle,
                          { fontFamily: typography.fontFamily.extraBold },
                        ]}
                        numberOfLines={2}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={[
                          styles.carouselBody,
                          { fontFamily: typography.fontFamily.regular },
                        ]}
                        numberOfLines={2}
                      >
                        {item.body}
                      </Text>

                      <View style={styles.carouselFooter}>
                        {isAnnouncement ? (
                          <>
                            <Ionicons name="calendar-outline" size={12} color="rgba(255,255,255,0.70)" />
                            <Text style={[styles.carouselDate, { fontFamily: typography.fontFamily.medium }]}>
                              {item.date}
                            </Text>
                            <Text style={[styles.carouselAuthor, { fontFamily: typography.fontFamily.regular }]}>
                              · {item.author}
                            </Text>
                          </>
                        ) : (
                          <>
                            <Ionicons name="arrow-forward-circle-outline" size={14} color="#D4AF37" />
                            <Text style={[styles.carouselDate, { color: '#D4AF37', fontFamily: typography.fontFamily.bold }]}>
                              Explore Feature
                            </Text>
                          </>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />

            {/* Dot indicators */}
            <View style={styles.dotRow}>
              {carouselData.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: i === heroIndex ? colors.primary : colors.border,
                      width: i === heroIndex ? 20 : 6,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        </Animated.View>

        {/* ── Two-column: Parish & Bible ── */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(450)}
          style={[styles.section, styles.twoColRow]}
        >
          {/* Parish History card */}
          <TouchableOpacity
            style={[
              styles.halfCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            activeOpacity={0.88}
            onPress={() => router.push('/(modals)/parish-history')}
          >
            <Image
              source={require('@/assets/images/church_interior_hero.png')}
              style={styles.halfCardImage}
              contentFit="cover"
            />
            <LinearGradient
              colors={Gradients.overlayDark as any}
              style={[StyleSheet.absoluteFillObject, styles.halfCardGradient]}
            />
            <View style={styles.halfCardContent}>
              <View style={styles.halfCardIcon}>
                <Ionicons name="business-outline" size={16} color="#D4AF37" />
              </View>
              <Text style={[styles.halfCardLabel, { fontFamily: typography.fontFamily.semiBold }]}>
                Founded {PARISH_HISTORY.founded}
              </Text>
              <Text style={[styles.halfCardTitle, { fontFamily: typography.fontFamily.bold }]} numberOfLines={2}>
                {PARISH_HISTORY.patron}
              </Text>
              <Text style={[styles.halfCardLink, { fontFamily: typography.fontFamily.semiBold }]}>
                Read More →
              </Text>
            </View>
          </TouchableOpacity>

          {/* Bible verse card */}
          <TouchableOpacity
            style={[
              styles.halfCard,
              { backgroundColor: colors.primary },
            ]}
            activeOpacity={0.88}
            onPress={() => router.push('/(modals)/bible-verse')}
          >
            <Image
              source={require('@/assets/images/bible_study_hero.png')}
              style={styles.halfCardImage}
              contentFit="cover"
            />
            <LinearGradient
              colors={['rgba(42,111,219,0.70)', 'rgba(42,111,219,0.96)']}
              style={[StyleSheet.absoluteFillObject, styles.halfCardGradient]}
            />
            <View style={styles.halfCardContent}>
              <View style={[styles.halfCardIcon, { backgroundColor: 'rgba(255,255,255,0.20)' }]}>
                <Ionicons name="book-outline" size={16} color="#FFFFFF" />
              </View>
              <Text style={[styles.halfCardLabel, { fontFamily: typography.fontFamily.semiBold, color: 'rgba(255,255,255,0.7)' }]}>
                Daily Word
              </Text>
              <Text style={[styles.halfCardTitle, { fontFamily: typography.fontFamily.bold }]} numberOfLines={3}>
                {`"${dailyVerse.text.substring(0, 80)}..."`}
              </Text>
              <Text style={[styles.halfCardLink, { fontFamily: typography.fontFamily.semiBold }]}>
                {dailyVerse.reference} →
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
      <GlobalLoader visible={loading} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  // Search
  searchWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  searchPlaceholder: {
    fontSize: 14,
    flex: 1,
  },

  // Section
  section: {
    marginBottom: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 17,
    letterSpacing: -0.2,
  },
  seeAll: {
    fontSize: 13,
  },

  // Quick actions
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  quickTile: {
    alignItems: 'center',
    width: 70,
  },
  quickIconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
    borderWidth: 1,
  },
  quickLabel: {
    fontSize: 11,
    letterSpacing: 0.1,
    textAlign: 'center',
  },

  // Carousel
  carouselWrapper: {},
  carouselSlide: {
    width: SCREEN_WIDTH,
    height: 240,
    position: 'relative',
    overflow: 'hidden',
  },
  carouselContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  carouselTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    lineHeight: 26,
    marginBottom: 6,
  },
  carouselBody: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.78)',
    lineHeight: 19,
    marginBottom: 10,
  },
  carouselFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  carouselDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.70)',
  },
  carouselAuthor: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    paddingTop: 12,
    paddingBottom: 4,
  },
  dot: {
    height: 5,
    borderRadius: 3,
  },

  // Two-column cards
  twoColRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  halfCard: {
    flex: 1,
    height: 200,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  halfCardImage: {
    ...StyleSheet.absoluteFillObject,
  },
  halfCardGradient: {
    borderRadius: 18,
  },
  halfCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
  },
  halfCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(212,175,55,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  halfCardLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.60)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  halfCardTitle: {
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 18,
    marginBottom: 6,
  },
  halfCardLink: {
    fontSize: 11,
    color: '#D4AF37',
  },

  // Mass times
  massCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#2A6FDB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  massRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  massDayChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    minWidth: 72,
    alignItems: 'center',
  },
  massDayText: {
    fontSize: 13,
  },
  massTimesRow: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  timeChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 12,
  },
});
