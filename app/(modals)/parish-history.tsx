import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { PARISH_HISTORY } from '@/constants/mockData';

export default function ParishHistoryScreen() {
  const { colors, typography, radius } = useTheme();

  return (
    <ScreenWrapper edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* ── Hero Image / Gradient ── */}
        <LinearGradient
          colors={['#0A1929', '#1D3557']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.heroBox, { borderRadius: radius.lg }]}
        >
          {/* Subtle watermark */}
          <Ionicons name="business-outline" size={120} color="rgba(255,255,255,0.05)" style={{ position: 'absolute', right: -20, bottom: -20 }} />

          <View style={styles.iconCircle}>
            <Ionicons name="home-outline" size={28} color="#D4AF37" />
          </View>

          <Text style={{ fontSize: 24, fontFamily: typography.fontFamily.extraBold, color: '#FFFFFF', marginTop: 16 }}>
            {PARISH_HISTORY.patron}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.6)" />
            <Text style={{ fontSize: 13, fontFamily: typography.fontFamily.medium, color: 'rgba(255,255,255,0.6)', marginLeft: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
              Founded {PARISH_HISTORY.founded}
            </Text>
          </View>
        </LinearGradient>

        {/* ── Leadership Details ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary, fontFamily: typography.fontFamily.semiBold }]}>
            Leadership
          </Text>
          
          <View style={[styles.detailCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}>
            <View style={styles.detailRow}>
              <View style={[styles.detailIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="person-circle-outline" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 11, fontFamily: typography.fontFamily.regular, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Bishop
                </Text>
                <Text style={{ fontSize: 15, fontFamily: typography.fontFamily.semiBold, color: colors.text, marginTop: 2 }}>
                  {PARISH_HISTORY.bishop}
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            <View style={styles.detailRow}>
              <View style={[styles.detailIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="people-outline" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 11, fontFamily: typography.fontFamily.regular, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Parish Priest
                </Text>
                <Text style={{ fontSize: 15, fontFamily: typography.fontFamily.semiBold, color: colors.text, marginTop: 2 }}>
                  {PARISH_HISTORY.parishPriest}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Brief History ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary, fontFamily: typography.fontFamily.semiBold }]}>
            Our Story
          </Text>
          <Text style={{ fontSize: 15, fontFamily: typography.fontFamily.regular, color: colors.text, lineHeight: 26 }}>
            {PARISH_HISTORY.brief}
          </Text>
        </View>

      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  heroBox: {
    padding: 24,
    height: 200,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginBottom: 24,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
});
