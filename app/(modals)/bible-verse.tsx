import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { getDailyVerse } from '@/constants/mockData';

export default function BibleVerseScreen() {
  const { colors, typography, radius } = useTheme();
  const verse = getDailyVerse();

  return (
    <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
      <ScreenHeader title="Daily Reading" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <Animated.View 
          entering={FadeInDown.duration(500)}
          style={[styles.heroBox, { borderRadius: radius.xl }]}
        >
          {/* Hero background image */}
          <Image
            source={require('@/assets/images/bible_study_hero.png')}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
          />
          {/* Deep dark gradient overlay for text readability */}
          <LinearGradient
            colors={['rgba(7,21,36,0.5)', 'rgba(7,21,36,0.92)']}
            style={StyleSheet.absoluteFillObject}
          />

          <View style={styles.header}>
            <Ionicons name="book" size={20} color="#D4AF37" />
            <Text style={{
              fontSize: 12,
              fontFamily: typography.fontFamily.semiBold,
              color: '#D4AF37',
              marginLeft: 8,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
            }}>
              {verse.theme} · Daily Reading
            </Text>
          </View>

          <Text style={{
            fontSize: 22,
            fontFamily: typography.fontFamily.medium,
            color: '#FFFFFF',
            lineHeight: 34,
            marginTop: 24,
            fontStyle: 'italic',
          }}>
            {`“${verse.text}”`}
          </Text>

          <View style={styles.divider} />
          
          <Text style={{
            fontSize: 16,
            fontFamily: typography.fontFamily.bold,
            color: '#D4AF37',
            marginTop: 16,
            alignSelf: 'flex-end',
          }}>
            — {verse.reference}
          </Text>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.reflectionSection}
        >
          <Text style={[styles.sectionTitle, { color: colors.textSecondary, fontFamily: typography.fontFamily.semiBold }]}>
            Daily Reflection
          </Text>
          <View style={[styles.reflectionCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
            <View style={styles.reflectionIconContainer}>
              <Ionicons name="bulb-outline" size={24} color="#D4AF37" />
            </View>
            <Text style={{ fontSize: 15, fontFamily: typography.fontFamily.regular, color: colors.text, lineHeight: 24, flex: 1 }}>
              Take a moment today to reflect on this scripture. How does it apply to your current circumstances? Consider setting aside five minutes of silence to allow these words to take root in your heart before beginning your daily tasks.
            </Text>
          </View>
        </Animated.View>

      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  heroBox: {
    padding: 24,
    height: 320,
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 24,
    left: 24,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(212,175,55,0.3)',
    marginTop: 24,
    width: '100%',
  },
  reflectionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 4,
  },
  reflectionCard: {
    padding: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  reflectionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212,175,55,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
