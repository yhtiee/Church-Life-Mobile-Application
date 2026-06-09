import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, ZoomIn, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ALL_GROUPS } from '@/constants/groups';
import { Gradients } from '@/constants/theme';

export default function GroupAccessRequestScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { colors, typography, radius } = useTheme();
  const router = useRouter();

  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const group = ALL_GROUPS.find((g) => g.id === groupId) ?? ALL_GROUPS[0];

  // Lock shake animation on mount
  const lockRotation = useSharedValue(0);
  React.useEffect(() => {
    lockRotation.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 100 }),
        withTiming(8, { duration: 100 }),
        withTiming(-8, { duration: 100 }),
        withTiming(8, { duration: 100 }),
        withTiming(0, { duration: 150 })
      ),
      2, // shake twice
      true
    );
  }, []);

  const animatedLockStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${lockRotation.value}deg` }],
  }));

  // ── Success state ──────────────────────────────────────────────────
  if (submitted) {
    return (
      <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.successWrapper}>
          <Animated.View 
            entering={ZoomIn.springify().damping(12)}
            style={[styles.successCircle, { backgroundColor: colors.successBg }]}
          >
            <Ionicons name="checkmark-circle" size={56} color={colors.success} />
          </Animated.View>
          <Text style={{ fontSize: 24, fontFamily: typography.fontFamily.extraBold, color: colors.text, marginTop: 24, textAlign: 'center' }}>
            Request Submitted!
          </Text>
          <Text style={{ fontSize: 15, fontFamily: typography.fontFamily.regular, color: colors.textSecondary, marginTop: 10, textAlign: 'center', lineHeight: 24, paddingHorizontal: 12 }}>
            Your request to join{' '}
            <Text style={{ fontFamily: typography.fontFamily.bold, color: colors.primary }}>{group.name}</Text>
            {` has been sent to the Parish Administrator. We’ll notify you once it’s reviewed.`}
          </Text>
          <View style={[styles.etaChip, { backgroundColor: colors.infoBg }]}>
            <Ionicons name="time" size={14} color={colors.info} />
            <Text style={{ fontSize: 12, fontFamily: typography.fontFamily.bold, color: colors.info, marginLeft: 6 }}>
              Expected review: 5–7 working days
            </Text>
          </View>
          <Button
            label="Back to Groups"
            onPress={() => router.back()}
            fullWidth
            size="lg"
            style={{ marginTop: 32 }}
          />
        </View>
      </ScreenWrapper>
    );
  }

  // ── Request form ───────────────────────────────────────────────────
  return (
    <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
      <ScreenHeader title="Request Access" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Group identity header card with Gradient Header */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <Card 
            elevation="sm" 
            style={[styles.groupCard, { borderRadius: radius.xl, overflow: 'hidden', padding: 0 }]}
          >
            <LinearGradient
              colors={[group.color, '#071524']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardHeader}
            >
              <View style={styles.iconStack}>
                <View style={styles.iconCircle}>
                  <Ionicons name={group.icon as any} size={36} color="#FFFFFF" />
                </View>
                <Animated.View style={[styles.lockBadge, animatedLockStyle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Ionicons name="lock-closed" size={12} color={colors.accent} />
                </Animated.View>
              </View>
              <Text style={[styles.cardTitle, { fontFamily: typography.fontFamily.extraBold }]}>
                {group.name}
              </Text>
              <Badge label="Secured Group" variant="accent" size="sm" glow style={styles.badge} />
            </LinearGradient>
            <View style={[styles.cardBody, { backgroundColor: colors.surface }]}>
              <Text style={{ fontSize: 14, fontFamily: typography.fontFamily.regular, color: colors.textSecondary, lineHeight: 22 }}>
                {group.description}
              </Text>
            </View>
          </Card>
        </Animated.View>

        {/* Info callout */}
        <Animated.View 
          entering={FadeInDown.delay(100).duration(450)}
          style={[styles.callout, { backgroundColor: colors.infoBg, borderColor: colors.info, borderRadius: radius.lg }]}
        >
          <Ionicons name="information-circle-outline" size={18} color={colors.info} style={{ marginTop: 1 }} />
          <Text style={{ flex: 1, fontSize: 13, fontFamily: typography.fontFamily.regular, color: colors.info, marginLeft: 10, lineHeight: 20 }}>
            Access requires approval from the{' '}
            <Text style={{ fontFamily: typography.fontFamily.bold }}>Parish Administrator</Text>.
            Your request will be reviewed within{' '}
            <Text style={{ fontFamily: typography.fontFamily.bold }}>5–7 working days</Text>.
          </Text>
        </Animated.View>

        {/* Form Reason Input */}
        <Animated.View entering={FadeInDown.delay(180).duration(450)}>
          <Input
            label="Reason for Request"
            placeholder="Why do you want to join this group?"
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={3}
            style={styles.reasonInput}
          />
        </Animated.View>

        {/* What happens next */}
        <Animated.View 
          entering={FadeInDown.delay(250).duration(450)}
          style={[styles.stepsCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}
        >
          <Text style={{ fontSize: 13, fontFamily: typography.fontFamily.bold, color: colors.text, marginBottom: 12, letterSpacing: 0.3 }}>
            What happens next?
          </Text>
          {[
            { icon: 'paper-plane', text: 'Your request is sent to the Parish Admin' },
            { icon: 'eye',         text: 'Admin reviews your profile and eligibility' },
            { icon: 'notifications', text: 'You\'ll receive an in-app notification with the decision' },
          ].map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={[styles.stepNum, { backgroundColor: colors.primaryLight }]}>
                <Text style={{ fontSize: 11, fontFamily: typography.fontFamily.bold, color: colors.primary }}>{i + 1}</Text>
              </View>
              <View style={[styles.stepIcon, { backgroundColor: colors.surfaceMuted }]}>
                <Ionicons name={step.icon as any} size={14} color={colors.primary} />
              </View>
              <Text style={{ flex: 1, fontSize: 13, fontFamily: typography.fontFamily.regular, color: colors.textSecondary, lineHeight: 19 }}>
                {step.text}
              </Text>
            </View>
          ))}
        </Animated.View>

        {/* Actions */}
        <Animated.View entering={FadeInDown.delay(300).duration(450)}>
          <Button
            label="Submit Request"
            onPress={() => setSubmitted(true)}
            fullWidth
            size="lg"
            disabled={!reason.trim()}
            style={{ marginTop: 8 }}
          />
          <Button
            label="Cancel"
            onPress={() => router.back()}
            variant="ghost"
            fullWidth
            size="md"
            style={{ marginTop: 10 }}
          />
        </Animated.View>

      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 48 },

  // Group Header Card
  groupCard: {
    marginBottom: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardHeader: {
    padding: 24,
    alignItems: 'center',
  },
  iconStack: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  iconCircle: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
    borderColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
  },
  lockBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 14,
  },
  badge: {
    marginTop: 12,
    alignSelf: 'center',
  },
  cardBody: {
    padding: 20,
  },

  // Reason field
  reasonInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 10,
  },

  // Info callout
  callout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderWidth: 1,
    marginBottom: 20,
  },

  // Steps card
  stepsCard: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 28,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  stepNum: {
    width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  stepIcon: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },

  // Success state
  successWrapper: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32,
  },
  successCircle: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: 'center', justifyContent: 'center',
  },
  etaChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, marginTop: 20,
  },
});
