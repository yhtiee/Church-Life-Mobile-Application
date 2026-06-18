import React, { useRef, useEffect, useState } from 'react';
import {
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { Gradients } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface CarouselItem {
  id: string;
  title: string;
  body: string;
  category?: string;
  date?: string;
  author?: string;
  important?: boolean;
  image?: any;
  route?: string;
  tag?: string;
}

interface AnnouncementCarouselProps {
  /** Array of carousel items (announcements or features) */
  data: CarouselItem[];
  /** Array of fallback hero images for announcements */
  heroImages?: any[];
  /** Callback when user selects an item */
  onSelect?: (item: CarouselItem) => void;
  /** Loading state */
  loading?: boolean;
  /** Show section header and "See All" button */
  showHeader?: boolean;
  /** Header title */
  headerTitle?: string;
  /** "See All" button callback */
  onSeeAll?: () => void;
  /** Custom animation delay (ms) */
  animationDelay?: number;
  /** Whether this is a feature carousel (not announcements) */
  isFeatures?: boolean;
}

export default function AnnouncementCarousel({
  data,
  heroImages = [],
  onSelect,
  loading = false,
  showHeader = true,
  headerTitle = 'Announcements',
  onSeeAll,
  animationDelay = 220,
  isFeatures = false,
}: AnnouncementCarouselProps) {
  const { colors, typography } = useTheme();
  const heroRef = useRef<FlatList>(null);
  const [heroIndex, setHeroIndex] = useState(0);

  // Auto-scroll carousel every 4.5s
  useEffect(() => {
    if (data.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => {
        const next = (prev + 1) % data.length;
        heroRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, [data.length]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setHeroIndex(idx);
  };

  const handleItemPress = (item: CarouselItem) => {
    if (onSelect) {
      onSelect(item);
    }
  };

  if (loading || data.length === 0) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeInDown.delay(animationDelay).duration(450)}
      style={styles.section}
    >
      {/* Section header */}
      {showHeader && (
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
            {headerTitle}
          </Text>
          {onSeeAll && (
            <TouchableOpacity onPress={onSeeAll}>
              <Text style={[styles.seeAll, { color: colors.primary, fontFamily: typography.fontFamily.semiBold }]}>
                See All →
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Full-width carousel */}
      <View style={styles.carouselWrapper}>
        <FlatList
          ref={heroRef}
          data={data}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          onScroll={onScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          snapToAlignment="center"
          renderItem={({ item, index }) => {
            const imageSource = heroImages[index % heroImages.length] || require('@/assets/images/church_exterior_hero.png');

            return (
              <TouchableOpacity
                activeOpacity={0.95}
                onPress={() => handleItemPress(item)}
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
                        backgroundColor: item.important
                          ? 'rgba(212,175,55,0.85)'
                          : isFeatures
                          ? 'rgba(124,58,237,0.85)'
                          : 'rgba(42,111,219,0.85)',
                      },
                    ]}
                  >
                    <Text style={[styles.categoryText, { fontFamily: typography.fontFamily.bold }]}>
                      {item.important ? '★ Important' : (item.category || item.tag || 'Update')}
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
                    {item.date ? (
                      <>
                        <Ionicons name="calendar-outline" size={12} color="rgba(255,255,255,0.70)" />
                        <Text style={[styles.carouselDate, { fontFamily: typography.fontFamily.medium }]}>
                          {item.date}
                        </Text>
                        {item.author && (
                          <Text style={[styles.carouselAuthor, { fontFamily: typography.fontFamily.regular }]}>
                            · {item.author}
                          </Text>
                        )}
                      </>
                    ) : (
                      <>
                        <Ionicons name="arrow-forward-circle-outline" size={14} color="#D4AF37" />
                        <Text style={[styles.carouselDate, { color: '#D4AF37', fontFamily: typography.fontFamily.bold }]}>
                          {isFeatures ? 'Explore Feature' : 'Learn More'}
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
          {data.map((_, i) => (
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
  );
}

const styles = StyleSheet.create({
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
});
