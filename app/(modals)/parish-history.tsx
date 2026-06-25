import React from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useParishQuery } from '@/hooks/queries/useParishes';
import { PARISH_HISTORY } from '@/constants/mockData';

export default function ParishHistoryScreen() {
  const { colors, typography, radius } = useTheme();
  const { user } = useAuth();
  const parishId = user?.parishId;

  const { data: parishDetails, isLoading } = useParishQuery(parishId || '');

  // Fallbacks if data is missing or loading
  const patronName = parishDetails?.patron || PARISH_HISTORY.patron;
  const foundedYear = parishDetails?.founded || PARISH_HISTORY.founded;
  const bishopName = parishDetails?.bishop || PARISH_HISTORY.bishop;
  const priestName = parishDetails?.parish_priest || PARISH_HISTORY.parishPriest;
  const historyText = parishDetails?.brief || PARISH_HISTORY.brief;
  const coverImage = parishDetails?.image_url;

  if (isLoading) {
    return (
      <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
        <ScreenHeader title="Parish History" />
        <View style={[styles.centered, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 12, color: colors.textSecondary, fontFamily: typography.fontFamily.medium }}>
            Loading parish history...
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
      <ScreenHeader title="Parish History" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* ── Hero Image / Gradient ── */}
        <Animated.View 
          entering={FadeInDown.duration(500)}
          style={[styles.heroBox, { borderRadius: radius.xl }]}
        >
          <Image
            source={coverImage ? { uri: coverImage } : require('@/assets/images/church_exterior_hero.png')}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
          />
          <LinearGradient
            colors={['rgba(7,21,36,0.3)', 'rgba(7,21,36,0.92)']}
            style={StyleSheet.absoluteFillObject}
          />

          <View style={styles.heroContent}>
            <View style={styles.iconCircle}>
              <Ionicons name="home" size={24} color="#D4AF37" />
            </View>

            <Text style={{ fontSize: 24, fontFamily: typography.fontFamily.extraBold, color: '#FFFFFF', marginTop: 16 }}>
              {patronName}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={{ fontSize: 13, fontFamily: typography.fontFamily.semiBold, color: 'rgba(255,255,255,0.7)', marginLeft: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
                Founded {foundedYear}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Leadership Details ── */}
        <Animated.View 
          entering={FadeInDown.delay(150).duration(500)}
          style={styles.section}
        >
          <Text style={[styles.sectionTitle, { color: colors.textSecondary, fontFamily: typography.fontFamily.semiBold }]}>
            Leadership
          </Text>
          
          <View style={[styles.detailCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
            <View style={styles.detailRow}>
              <View style={[styles.detailIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="person" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 11, fontFamily: typography.fontFamily.bold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Bishop
                </Text>
                <Text style={{ fontSize: 15, fontFamily: typography.fontFamily.semiBold, color: colors.text, marginTop: 2 }}>
                  {bishopName}
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            <View style={styles.detailRow}>
              <View style={[styles.detailIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="people" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 11, fontFamily: typography.fontFamily.bold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Parish Priest
                </Text>
                <Text style={{ fontSize: 15, fontFamily: typography.fontFamily.semiBold, color: colors.text, marginTop: 2 }}>
                  {priestName}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ── Brief History ── */}
        <Animated.View 
          entering={FadeInDown.delay(250).duration(500)}
          style={styles.section}
        >
          <Text style={[styles.sectionTitle, { color: colors.textSecondary, fontFamily: typography.fontFamily.semiBold }]}>
            Our Story
          </Text>
          <View style={[styles.storyCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
            <Text style={{ fontSize: 15, fontFamily: typography.fontFamily.regular, color: colors.text, lineHeight: 26 }}>
              {historyText}
            </Text>
          </View>
        </Animated.View>

      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroBox: {
    height: 240,
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  heroContent: {
    padding: 24,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(212,175,55,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 4,
  },
  detailCard: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  detailIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  storyCard: {
    padding: 20,
    borderWidth: 1,
  },
});
