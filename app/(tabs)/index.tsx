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
import { PARISH_HISTORY, MASS_TIMES } from '@/constants/mockData';
import { useParishQuery } from '@/hooks/queries/useParishes';
import { AnnoucementService } from '@/lib/supabase/services/announcements';
import { AdsService } from '@/lib/supabase/services/ads';
import { BibleService } from '@/lib/supabase/services/bible';
import { Gradients } from '@/constants/theme';
import GlobalLoader from '@/components/ui/GlobalLoader';
import AnnouncementCarousel from '@/components/ui/AnnouncementCarousel';
import AdsCarousel from '@/components/ui/AdsCarousel';

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
    icon: 'wallet-outline' as const,
    label: 'Finance',
    bg: '#FEF3C7',
    iconColor: '#D97706',
    gradient: Gradients.cardGold,
    route: '/(tabs)/finance',
  },
  {
    icon: 'book-outline' as const,
    label: 'Bible',
    bg: '#E8F0FE',
    iconColor: '#2A6FDB',
    gradient: Gradients.heroBlue,
    route: '/(tabs)/bible',
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
    icon: 'heart-outline' as const,
    label: 'Prayers',
    bg: '#FCE7F3',
    iconColor: '#DB2777',
    gradient: Gradients.cardGold,
    route: '/(modals)/prayers',
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
  const { user } = useAuth();

  const { data: parishDetails } = useParishQuery(user?.parishId as string);

  const [dailyVerse, setDailyVerse] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const hasAnnouncements = announcements && announcements.length > 0;
  const carouselData = hasAnnouncements ? announcements : FEATURE_SLIDES;

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      const announcementService = new AnnoucementService();
      const adsService = new AdsService();
      const bibleService = new BibleService();

      // Run the three startup requests concurrently instead of sequentially so
      // content appears as soon as the slowest one (not their sum) resolves.
      const [announcementsRes, adsRes, verse] = await Promise.all([
        announcementService.fetchAnnouncements(user?.parishId).catch((e) => {
          console.error('Failed to load announcements:', e);
          return { data: null, error: e };
        }),
        adsService.fetchActiveAds().catch((e) => {
          console.error('Failed to load ads:', e);
          return { data: null, error: e };
        }),
        bibleService.getVerseOfDay().catch((e) => {
          console.error('Failed to load verse:', e);
          return null;
        }),
      ]);

      if (!active) return;

      setAnnouncements(!announcementsRes.error && announcementsRes.data ? announcementsRes.data : []);
      setAds(!adsRes.error && adsRes.data ? adsRes.data : []);

      if (verse) {
        setDailyVerse(verse);
      } else {
        // Only fall back to a random verse if the deterministic one failed.
        const randomVerse = await bibleService.getRandomVerse().catch(() => null);
        if (active) setDailyVerse(randomVerse);
      }

      if (active) setLoading(false);
    };
    fetchData();
    return () => {
      active = false;
    };
  }, [user?.parishId]);

  const handleCarouselSelect = (item: any) => {
    if ('important' in item) {
      // Announcement
      router.push({
        pathname: '/(modals)/announcement-detail',
        params: { id: item.id },
      });
    } else {
      // Feature
      router.push(item.route);
    }
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

        {/* ── Announcements Carousel ── */}
        <AnnouncementCarousel
          data={carouselData}
          heroImages={HERO_IMAGES}
          onSelect={handleCarouselSelect}
          loading={loading}
          showHeader={true}
          headerTitle={hasAnnouncements ? 'Announcements' : 'Explore ChurchLife'}
          onSeeAll={hasAnnouncements ? () => router.push('/(modals)/announcements') : undefined}
          animationDelay={220}
          isFeatures={!hasAnnouncements}
        />

        {/* ── Quick Actions ── */}
        <Animated.View 
          entering={FadeInDown.delay(140).duration(400)}
          style={styles.quickActionSection}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
              Quick Access
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickRow}
          >
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
          </ScrollView>
        </Animated.View>

        {/* ── Ads Carousel ── */}
        <AdsCarousel
          data={ads}
          onSelect={(item) => {
            if (item.cta_url) {
              router.push(item.cta_url as any);
            }
          }}
          loading={loading}
          animationDelay={220}
        />

        {/* ── Advertise With Us CTA ── */}
        <Animated.View
          entering={FadeInDown.delay(260).duration(450)}
          style={styles.advertiseSection}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push('/(modals)/advertise' as any)}
          >
            <LinearGradient
              colors={['#0A1929', '#1D3557']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.advertiseCard}
            >
              <View style={styles.advertiseIcon}>
                <Ionicons name="megaphone" size={22} color="#D4AF37" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.advertiseTitle, { fontFamily: typography.fontFamily.bold }]}>
                  Advertise With Us
                </Text>
                <Text style={[styles.advertiseBody, { fontFamily: typography.fontFamily.regular }]}>
                  Feature your business here — tap to enquire.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" />
            </LinearGradient>
          </TouchableOpacity>
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
              source={parishDetails?.image_url ? { uri: parishDetails.image_url } : require('@/assets/images/church_interior_hero.png')}
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
                Founded {parishDetails?.founded || PARISH_HISTORY.founded}
              </Text>
              <Text style={[styles.halfCardTitle, { fontFamily: typography.fontFamily.bold }]} numberOfLines={2}>
                {parishDetails?.patron || PARISH_HISTORY.patron}
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
                {dailyVerse ? `"${dailyVerse.text.substring(0, 80)}..."` : 'Loading verse...'}
              </Text>
              <Text style={[styles.halfCardLink, { fontFamily: typography.fontFamily.semiBold }]}>
                {dailyVerse ? `${dailyVerse.reference} →` : 'Bible'}
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
  advertiseSection: {
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 20,
  },
  advertiseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
  },
  advertiseIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212,175,55,0.15)',
  },
  advertiseTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 3,
  },
  advertiseBody: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 18,
  },
  quickActionSection: {
    marginBottom: 20,
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
    paddingHorizontal: 20,
    paddingBottom: 4,
    gap: 12,
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
