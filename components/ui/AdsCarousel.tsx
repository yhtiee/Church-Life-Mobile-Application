import React, { useRef, useEffect, useState } from 'react';
import {
  FlatList, View, Text, TouchableOpacity, StyleSheet, Dimensions, ViewToken,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { Gradients } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface AdsItem {
  id: string;
  title: string;
  body: string;
  image_url: string;
  category?: string;
  cta_url?: string;
}

interface AdsCarouselProps {
  data: AdsItem[];
  onSelect?: (item: AdsItem) => void;
  loading?: boolean;
  animationDelay?: number;
}

export default function AdsCarousel({
  data,
  onSelect,
  loading = false,
  animationDelay = 0,
}: AdsCarouselProps) {
  const { colors, typography, isDark } = useTheme();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollPos = useRef(0);

  // Auto-scroll timer
  useEffect(() => {
    if (!data || data.length === 0) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % data.length;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }, 4500);

    return () => clearInterval(interval);
  }, [currentIndex, data.length]);

  const handleScroll = (event: any) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (slide !== currentIndex) {
      setCurrentIndex(slide);
    }
  };

  const handleItemPress = (item: AdsItem) => {
    if (onSelect) {
      onSelect(item);
    } else if (item.cta_url) {
      // Default behavior if no callback provided
      // Router push would happen from parent
    }
  };

  if (loading) {
    return (
      <Animated.View
        entering={FadeInDown.delay(animationDelay).duration(450)}
        style={styles.section}
      >
        <View style={styles.sectionHeader}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text, fontFamily: typography.fontFamily.bold },
            ]}
          >
            Featured Ads
          </Text>
        </View>
        <View style={[styles.carouselSlide, { backgroundColor: colors.border }]} />
      </Animated.View>
    );
  }

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeInDown.delay(animationDelay).duration(450)}
      style={styles.section}
    >
      {/* Section header */}
      <View style={styles.sectionHeader}>
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.text, fontFamily: typography.fontFamily.bold },
          ]}
        >
          Featured Ads
        </Text>
      </View>

      {/* Carousel */}
      <View style={styles.carouselWrapper}>
        <FlatList
          ref={flatListRef}
          data={data}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          scrollEventThrottle={16}
          decelerationRate="fast"
          snapToAlignment="center"
          onScroll={handleScroll}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.95}
              onPress={() => handleItemPress(item)}
              style={styles.carouselSlide}
            >
              {/* Background image */}
              <Image
                source={{ uri: item.image_url }}
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
                      backgroundColor: 'rgba(212,175,55,0.85)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      { fontFamily: typography.fontFamily.bold },
                    ]}
                  >
                    {item.category || 'Promotion'}
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
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Dot indicators */}
      {data.length > 1 && (
        <View style={styles.dotRow}>
          {data.map((_, idx) => (
            <Animated.View
              key={`dot-${idx}`}
              style={[
                styles.dot,
                {
                  width: currentIndex === idx ? 24 : 5,
                  backgroundColor:
                    currentIndex === idx
                      ? colors.text
                      : `${colors.text}40`,
                },
              ]}
            />
          ))}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
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
  carouselWrapper: {
    overflow: 'hidden',
  },
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
