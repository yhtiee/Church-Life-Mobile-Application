import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import type { BibleVerse } from '@/constants/mockData';

interface BibleVerseCardProps {
  verse: BibleVerse;
  /** Compact mode for bento grid cells — reduced padding & font sizes */
  compact?: boolean;
}

export function BibleVerseCard({ verse, compact }: BibleVerseCardProps) {
  const { typography, radius } = useTheme();
  const pad = compact ? 14 : 20;

  return (
    <LinearGradient
      colors={['#0A1929', '#1D3557']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, { borderRadius: radius.lg, padding: pad, flex: compact ? 1 : undefined }]}
    >
      <View style={styles.header}>
        <Ionicons name="book-outline" size={compact ? 16 : 20} color="#D4AF37" />
        <Text style={{
          fontSize: compact ? 9 : 11,
          fontFamily: typography.fontFamily.semiBold,
          color: '#D4AF37',
          marginLeft: 6,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          flex: 1,
        }}>
          {verse.theme} · Daily Reading
        </Text>
      </View>

      <Text style={{
        fontSize: compact ? 13 : 16,
        fontFamily: typography.fontFamily.regular,
        color: '#FFFFFF',
        lineHeight: compact ? 20 : 26,
        marginTop: 10,
        fontStyle: 'italic',
        flex: 1,
      }} numberOfLines={compact ? 4 : undefined}>
        {verse.text}
      </Text>

      <View style={styles.footer}>
        <View style={[styles.divider, { backgroundColor: '#D4AF37' }]} />
        <Text style={{
          fontSize: compact ? 11 : 13,
          fontFamily: typography.fontFamily.semiBold,
          color: '#D4AF37',
          marginTop: compact ? 8 : 12,
        }}>
          — {verse.reference}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {},
  header: { flexDirection: 'row', alignItems: 'center' },
  footer: {},
  divider: { height: 1, width: 32, marginTop: 12, opacity: 0.6 },
});
