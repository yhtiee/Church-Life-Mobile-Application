import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { Gradients } from '@/constants/theme';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

const HERO_H = height * 0.52;

const FEATURES = [
  { icon: 'people-outline' as const,      label: 'Community', color: '#7C3AED' },
  { icon: 'calendar-outline' as const,    label: 'Events',    color: '#2A6FDB' },
  { icon: 'wallet-outline' as const,      label: 'Finance',   color: '#D97706' },
  { icon: 'book-outline' as const,        label: 'Bible',     color: '#059669' },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { typography } = useTheme();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* ── Hero Image (top ~52% of screen) ── */}
      <View style={[styles.heroSection, { height: HERO_H }]}>
        <Image
          source={require('@/assets/images/church_exterior_hero.png')}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
        />
        {/* Top gradient: dark at top for status bar legibility */}
        <LinearGradient
          colors={['rgba(0,0,0,0.48)', 'rgba(0,0,0,0.10)', 'transparent']}
          style={[StyleSheet.absoluteFillObject, { height: HERO_H * 0.5 }]}
        />
        {/* Bottom gradient: smooth transition to white */}
        <LinearGradient
          colors={['transparent', 'rgba(245,248,255,0.80)', '#F5F8FF']}
          style={styles.heroBottomFade}
        />

        {/* Logo & app name overlay */}
        <Animated.View entering={FadeIn.duration(700)} style={styles.heroContent}>
          <View style={styles.logoCircle}>
            <Image
              source={require('@/assets/images/cross-dove-background.png')}
              style={{ width: 60, height: 60 }}
              contentFit="contain"
            />
          </View>
          <Text style={[styles.heroAppName, { fontFamily: typography.fontFamily.extraBold }]}>
            ChurchLife
          </Text>
        </Animated.View>
      </View>

      {/* ── White Bottom Panel ── */}
      <Animated.View
        entering={FadeInUp.delay(200).duration(600)}
        style={styles.bottomPanel}
      >
        {/* Tagline */}
        <Text style={[styles.tagline, { fontFamily: typography.fontFamily.bold }]}>
          One Parish.{'\n'}One Family. One Faith.
        </Text>
        <Text style={[styles.sub, { fontFamily: typography.fontFamily.regular }]}>
          Connect with your parish community, track events, manage your giving, and grow in faith.
        </Text>

        {/* Feature pills */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.featureRow}>
          {FEATURES.map((f, i) => (
            <Animated.View
              key={f.label}
              entering={FadeInDown.delay(400 + i * 60).duration(350)}
              style={[styles.featureChip, { backgroundColor: f.color + '18' }]}
            >
              <Ionicons name={f.icon} size={16} color={f.color} />
              <Text style={[styles.featureLabel, { color: f.color, fontFamily: typography.fontFamily.semiBold }]}>
                {f.label}
              </Text>
            </Animated.View>
          ))}
        </Animated.View>

        {/* CTAs */}
        <Animated.View entering={FadeInUp.delay(550).duration(500)} style={styles.ctaArea}>
          {/* Primary button */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push('/(auth)/register')}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={['#2A6FDB', '#4A8FFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryBtnGradient}
            >
              <Text style={[styles.primaryBtnText, { fontFamily: typography.fontFamily.bold }]}>
                Create Account
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Secondary */}
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.88}
          >
            <Text style={[styles.secondaryBtnText, { fontFamily: typography.fontFamily.semiBold, color: '#2A6FDB' }]}>
              Sign In to Existing Account
            </Text>
          </TouchableOpacity>

          <Text style={[styles.footer, { fontFamily: typography.fontFamily.regular }]}>
            A Catholic Parish Community App
          </Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FF',
  },
  heroSection: {
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  heroBottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: HERO_H * 0.45,
  },
  heroContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: 64,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.90)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 10,
  },
  heroAppName: {
    fontSize: 38,
    color: '#FFFFFF',
    letterSpacing: -1,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  // White bottom panel
  bottomPanel: {
    flex: 1,
    backgroundColor: '#F5F8FF',
    paddingHorizontal: 28,
    paddingTop: 8,
  },
  tagline: {
    fontSize: 26,
    color: '#0F172A',
    letterSpacing: -0.6,
    lineHeight: 34,
    marginBottom: 10,
  },
  sub: {
    fontSize: 14,
    color: '#6B8CAE',
    lineHeight: 22,
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
  },
  featureLabel: {
    fontSize: 12,
  },
  ctaArea: {},
  primaryBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#2A6FDB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.30,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryBtnGradient: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#2A6FDB',
    backgroundColor: '#FFFFFF',
    marginBottom: 22,
  },
  secondaryBtnText: {
    fontSize: 15,
  },
  footer: {
    fontSize: 11,
    color: '#A0B8D4',
    textAlign: 'center',
  },
});
