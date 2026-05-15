import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Badge } from '@/components/ui/Badge';
import { ALL_GROUPS } from '@/constants/groups';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, typography } = useTheme();

  const group = ALL_GROUPS.find((g) => g.id === id) ?? ALL_GROUPS[0];

  return (
    <ScreenWrapper edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <LinearGradient colors={[group.color, group.color + '99']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <Ionicons name={group.icon as any} size={40} color="#FFFFFF" />
          </View>
          <Text style={{ fontSize: 22, fontFamily: typography.fontFamily.extraBold, color: '#FFFFFF', marginTop: 12, textAlign: 'center' }}>
            {group.name}
          </Text>
          <Text style={{ fontSize: 14, fontFamily: typography.fontFamily.semiBold, color: 'rgba(255,255,255,0.7)', textAlign: 'center', letterSpacing: 2 }}>
            {group.shortName}
          </Text>
          <View style={{ marginTop: 12 }}>
            <Badge label={group.type === 'secured' ? 'Secured Group' : 'Open Group'} variant="muted" size="sm" />
          </View>
        </LinearGradient>

        <Text style={{ fontSize: 16, fontFamily: typography.fontFamily.regular, color: colors.text, lineHeight: 26, marginBottom: 20 }}>
          {group.description}
        </Text>
        {group.minAge || group.maxAge ? (
          <View style={[styles.ageRow, { backgroundColor: colors.surfaceMuted, borderRadius: 10 }]}>
            <Ionicons name="people-outline" size={18} color={colors.primary} />
            <Text style={{ fontSize: 14, fontFamily: typography.fontFamily.medium, color: colors.text, marginLeft: 10 }}>
              Age requirement: {group.minAge ? `${group.minAge}+` : ''}{group.minAge && group.maxAge ? ' – ' : ''}{group.maxAge ? `up to ${group.maxAge}` : ''} years
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 0, paddingBottom: 48 },
  hero: { padding: 32, alignItems: 'center', marginBottom: 24 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  ageRow: { flexDirection: 'row', alignItems: 'center', padding: 14, marginHorizontal: 20 },
});
