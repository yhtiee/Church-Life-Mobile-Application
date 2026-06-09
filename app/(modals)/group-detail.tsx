import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Badge } from '@/components/ui/Badge';
import { ALL_GROUPS } from '@/constants/groups';

const MEMBER_COUNTS: Record<string, number> = {
  cmo: 145,
  cwo: 185,
  cyon: 240,
  hca: 95,
  harvest: 18,
  finance: 8,
  laity: 22,
};

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, typography, radius } = useTheme();

  const group = ALL_GROUPS.find((g) => g.id === id) ?? ALL_GROUPS[0];
  const memberCount = MEMBER_COUNTS[group.id] ?? 25;

  return (
    <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
      <ScreenHeader title={group.name} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Upgraded Hero Strip matching Groups Screen Style */}
        <Animated.View entering={FadeIn.duration(400)}>
          <LinearGradient 
            colors={[group.color, '#071524']} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 0, y: 1 }} 
            style={styles.hero}
          >
            <View style={[styles.iconCircle, { borderColor: 'rgba(255,255,255,0.2)', borderWidth: 4 }]}>
              <Ionicons name={group.icon as any} size={40} color="#FFFFFF" />
            </View>
            <Text style={{ fontSize: 24, fontFamily: typography.fontFamily.extraBold, color: '#FFFFFF', marginTop: 14, textAlign: 'center' }}>
              {group.name}
            </Text>
            <Text style={{ fontSize: 13, fontFamily: typography.fontFamily.bold, color: 'rgba(255,255,255,0.65)', textAlign: 'center', letterSpacing: 2, textTransform: 'uppercase', marginTop: 2 }}>
              {group.shortName}
            </Text>
            
            <View style={styles.badgeRow}>
              <Badge 
                label={group.type === 'secured' ? 'Secured Group' : 'Open Group'} 
                variant={group.type === 'secured' ? 'accent' : 'primary'} 
                size="sm" 
                glow 
              />
              <Badge 
                label={`${memberCount} members`} 
                variant="default" 
                size="sm" 
              />
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(450)} style={styles.content}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary, fontFamily: typography.fontFamily.semiBold }]}>
            About this Group
          </Text>
          <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
            <Text style={{ fontSize: 15, fontFamily: typography.fontFamily.regular, color: colors.text, lineHeight: 26 }}>
              {group.description}
            </Text>
          </View>
          
          {group.minAge || group.maxAge ? (
            <Animated.View 
              entering={FadeInDown.delay(250).duration(450)}
              style={[styles.ageRow, { backgroundColor: colors.surfaceMuted, borderRadius: radius.md }]}
            >
              <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
              <Text style={{ fontSize: 14, fontFamily: typography.fontFamily.medium, color: colors.text, marginLeft: 10, flex: 1 }}>
                Age requirement: {group.minAge ? `${group.minAge}+` : ''}{group.minAge && group.maxAge ? ' – ' : ''}{group.maxAge ? `up to ${group.maxAge}` : ''} years
              </Text>
            </Animated.View>
          ) : null}
        </Animated.View>

      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 48 },
  hero: { padding: 32, alignItems: 'center', justifyContent: 'center' },
  iconCircle: { 
    width: 88, 
    height: 88, 
    borderRadius: 44, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
    marginLeft: 4,
  },
  infoCard: {
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 20,
  },
  ageRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
});
