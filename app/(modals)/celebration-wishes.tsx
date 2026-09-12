import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import GlobalLoader from '@/components/ui/GlobalLoader';
import { useCelebrationQuery, useCelebrationWishesQuery } from '@/hooks/queries/useSupport';
import { CELEBRATION_KIND_LABELS } from '@/lib/supabase/entities/types';

function prettyDate(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  if (!y || !m || !d) return dateKey;
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * The celebrant's wall of wishes.
 *
 * Deliberately shows no amounts. The money goes to the parish account rather
 * than to the celebrant, so figures here would promise something the app does
 * not deliver, and would turn good wishes into a leaderboard. Wishes appear as
 * soon as they are sent: verification gates the money, not the message.
 */
export default function CelebrationWishesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, typography, radius } = useTheme();

  const { data: celebration } = useCelebrationQuery(id);
  const { data: wishes = [], isLoading, error } = useCelebrationWishesQuery(id);

  return (
    <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
      <ScreenHeader title="Your Celebration" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {celebration && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <Card elevation="sm" style={{ padding: 18, borderRadius: radius.lg }}>
              <Badge
                label={CELEBRATION_KIND_LABELS[celebration.kind]}
                variant="primary"
                size="sm"
              />
              <Text
                style={{
                  fontSize: 20,
                  color: colors.text,
                  fontFamily: typography.fontFamily.bold,
                  marginTop: 10,
                }}
              >
                {celebration.title}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  fontFamily: typography.fontFamily.regular,
                  marginTop: 6,
                  lineHeight: 21,
                }}
              >
                {wishes.length === 0
                  ? 'When members send you a message it will appear here.'
                  : `${wishes.length} ${wishes.length === 1 ? 'person has' : 'people have'} sent you a message.`}
              </Text>
            </Card>
          </Animated.View>
        )}

        {error ? (
          <Text
            style={{
              fontSize: 14,
              color: colors.textMuted,
              fontFamily: typography.fontFamily.regular,
              textAlign: 'center',
              marginTop: 40,
              lineHeight: 21,
            }}
          >
            These wishes are private to the person being celebrated.
          </Text>
        ) : null}

        {wishes.map((wish, index) => (
          <Animated.View
            key={wish.wish_id}
            entering={FadeInDown.delay(index * 60).duration(350)}
            style={styles.wishWrap}
          >
            <Card elevation="sm" style={{ padding: 16, borderRadius: radius.lg }}>
              <View style={styles.wishHeader}>
                <View
                  style={[styles.avatar, { backgroundColor: colors.primaryLight, borderRadius: 18 }]}
                >
                  <Ionicons
                    name={wish.sent_anonymously ? 'heart' : 'person'}
                    size={16}
                    color={colors.primary}
                  />
                </View>
                <Text
                  style={{
                    flex: 1,
                    fontSize: 14,
                    color: colors.text,
                    fontFamily: typography.fontFamily.semiBold,
                    marginLeft: 10,
                  }}
                >
                  {wish.sender_name}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textMuted,
                    fontFamily: typography.fontFamily.regular,
                  }}
                >
                  {prettyDate(wish.wished_on)}
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 15,
                  color: colors.text,
                  fontFamily: typography.fontFamily.regular,
                  lineHeight: 23,
                  marginTop: 10,
                  fontStyle: 'italic',
                }}
              >
                “{wish.message}”
              </Text>
            </Card>
          </Animated.View>
        ))}

        {!isLoading && !error && wishes.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="mail-outline" size={40} color={colors.textMuted} />
            <Text
              style={{
                fontSize: 14,
                color: colors.textMuted,
                fontFamily: typography.fontFamily.regular,
                textAlign: 'center',
                marginTop: 12,
                lineHeight: 21,
              }}
            >
              No messages yet.
            </Text>
          </View>
        )}
      </ScrollView>
      <GlobalLoader visible={isLoading} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 60 },
  wishWrap: { marginTop: 12 },
  wishHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', marginTop: 50 },
});
