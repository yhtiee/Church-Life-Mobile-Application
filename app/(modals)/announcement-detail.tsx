import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAnnouncementQuery } from '@/hooks/queries/useAnnouncements';
import { Announcement } from '@/constants/mockData';
import { Gradients } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HERO_IMAGES = [
  require('@/assets/images/church_exterior_hero.png'),
  require('@/assets/images/church_interior_hero.png'),
  require('@/assets/images/church_community_hero.png'),
];

export default function AnnouncementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, typography, radius } = useTheme();

  const { data: announcement = null, isLoading: loading } = useAnnouncementQuery(id || '');

  if (loading) {
    return (
      <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
        <ScreenHeader title="Announcement" />
        <View style={styles.loadingWrapper}>
          <LoadingSpinner size="large" />
        </View>
      </ScreenWrapper>
    );
  }

  if (!announcement) {
    return (
      <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
        <ScreenHeader title="Announcement" />
        <View style={styles.loadingWrapper}>
          <Text style={{ color: colors.textSecondary, fontFamily: typography.fontFamily.medium, fontSize: 16 }}>
            Announcement not found.
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  const heroIndex = announcement.id
    ? announcement.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    : 0;
  const heroImage = HERO_IMAGES[heroIndex % HERO_IMAGES.length];

  return (
    <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
      <ScreenHeader title="Announcement" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Full-width category banner with hero image & gradient */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.bannerContainer}>
          <Image
            source={heroImage}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
          />
          <LinearGradient
            colors={['rgba(7,21,36,0.3)', 'rgba(7,21,36,0.92)']}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.bannerContent}>
            <View style={styles.badges}>
              <Badge label={announcement.category} variant="accent" size="sm" glow />
              {announcement.important && (
                <Badge label="Important" variant="danger" size="sm" glow />
              )}
            </View>
            <Text style={[styles.bannerTitle, { fontFamily: typography.fontFamily.extraBold }]}>
              {announcement.title}
            </Text>
          </View>
        </Animated.View>

        {/* Content Section */}
        <Animated.View entering={FadeInDown.delay(200).duration(450)} style={styles.contentContainer}>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
              <Text style={[styles.metaText, { color: colors.textMuted, fontFamily: typography.fontFamily.regular }]}>
                {announcement.date}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="person-outline" size={14} color={colors.textMuted} />
              <Text style={[styles.metaText, { color: colors.textMuted, fontFamily: typography.fontFamily.regular }]}>
                By {announcement.author}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <Text style={[styles.bodyText, { color: colors.text, fontFamily: typography.fontFamily.regular }]}>
            {announcement.body}
          </Text>
        </Animated.View>

      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40 },
  bannerContainer: {
    width: SCREEN_WIDTH,
    height: 240,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  bannerContent: {
    padding: 20,
    paddingBottom: 24,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  bannerTitle: {
    fontSize: 22,
    color: '#FFFFFF',
    lineHeight: 30,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginVertical: 18,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: 0.2,
  },
  loadingWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
