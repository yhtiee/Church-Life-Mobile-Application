import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { getDailyVerse } from '@/constants/mockData';

export default function BibleVerseScreen() {
  const { colors, typography, radius } = useTheme();
  const verse = getDailyVerse();

  return (
    <ScreenWrapper edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <LinearGradient
          colors={['#0A1929', '#1D3557']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.heroBox, { borderRadius: radius.lg }]}
        >
          {/* Subtle watermark */}
          <Ionicons name="book-outline" size={160} color="rgba(255,255,255,0.03)" style={{ position: 'absolute', right: -30, top: -20 }} />

          <View style={styles.header}>
            <Ionicons name="book-outline" size={24} color="#D4AF37" />
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
            fontSize: 20,
            fontFamily: typography.fontFamily.regular,
            color: '#FFFFFF',
            lineHeight: 32,
            marginTop: 24,
            fontStyle: 'italic',
          }}>
            "{verse.text}"
          </Text>

          <View style={styles.divider} />
          
          <Text style={{
            fontSize: 15,
            fontFamily: typography.fontFamily.bold,
            color: '#D4AF37',
            marginTop: 16,
            alignSelf: 'flex-end',
          }}>
            — {verse.reference}
          </Text>
        </LinearGradient>

        <View style={styles.reflectionSection}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary, fontFamily: typography.fontFamily.semiBold }]}>
            Daily Reflection
          </Text>
          <View style={[styles.reflectionCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}>
            <Ionicons name="bulb-outline" size={24} color={colors.primary} style={{ marginBottom: 12 }} />
            <Text style={{ fontSize: 15, fontFamily: typography.fontFamily.regular, color: colors.text, lineHeight: 24 }}>
              Take a moment today to reflect on this verse. How does it apply to your current circumstances? Consider setting aside five minutes of silence to allow these words to take root in your heart before beginning your daily tasks.
            </Text>
          </View>
        </View>

      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  heroBox: {
    padding: 24,
    overflow: 'hidden',
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  reflectionCard: {
    padding: 20,
    borderWidth: 1,
  },
});
