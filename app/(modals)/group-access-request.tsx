import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ALL_GROUPS } from '@/constants/groups';

export default function GroupAccessRequestScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { colors, typography, radius } = useTheme();
  const router = useRouter();

  const [submitted, setSubmitted] = useState(false);

  const group = ALL_GROUPS.find((g) => g.id === groupId) ?? ALL_GROUPS[0];

  // ── Success state ──────────────────────────────────────────────────
  if (submitted) {
    return (
      <ScreenWrapper edges={['left', 'right', 'bottom']}>
        <View style={styles.successWrapper}>
          <View style={[styles.successCircle, { backgroundColor: colors.successBg }]}>
            <Ionicons name="checkmark-circle" size={56} color={colors.success} />
          </View>
          <Text style={{ fontSize: 22, fontFamily: typography.fontFamily.extraBold, color: colors.text, marginTop: 20, textAlign: 'center' }}>
            Request Submitted!
          </Text>
          <Text style={{ fontSize: 14, fontFamily: typography.fontFamily.regular, color: colors.textSecondary, marginTop: 10, textAlign: 'center', lineHeight: 22 }}>
            Your request to join{' '}
            <Text style={{ fontFamily: typography.fontFamily.semiBold, color: colors.text }}>{group.name}</Text>
            {' '}has been sent to the Parish Administrator.{'\n'}We'll notify you once it's reviewed.
          </Text>
          <View style={[styles.etaChip, { backgroundColor: colors.infoBg }]}>
            <Ionicons name="time-outline" size={14} color={colors.info} />
            <Text style={{ fontSize: 12, fontFamily: typography.fontFamily.medium, color: colors.info, marginLeft: 6 }}>
              Expected review: 5–7 working days
            </Text>
          </View>
          <Button
            label="Back to Groups"
            onPress={() => router.back()}
            fullWidth
            size="lg"
            style={{ marginTop: 28 }}
          />
        </View>
      </ScreenWrapper>
    );
  }

  // ── Request form ───────────────────────────────────────────────────
  return (
    <ScreenWrapper edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Group identity header */}
        <View style={styles.groupHeader}>
          {/* Icon with lock overlay */}
          <View style={styles.iconStack}>
            <View style={[styles.iconCircle, { backgroundColor: group.color + '18', borderColor: group.color + '40', borderWidth: 2 }]}>
              <Ionicons name={group.icon as any} size={36} color={group.color} />
            </View>
            <View style={[styles.lockBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="lock-closed" size={12} color={colors.textMuted} />
            </View>
          </View>

          <Text style={{ fontSize: 20, fontFamily: typography.fontFamily.extraBold, color: colors.text, textAlign: 'center', marginTop: 14 }}>
            {group.name}
          </Text>
          <Text style={{ fontSize: 12, fontFamily: typography.fontFamily.semiBold, color: group.color, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 4 }}>
            {group.shortName}
          </Text>
          <View style={{ marginTop: 10 }}>
            <Badge label="Secured Group" variant="muted" size="sm" />
          </View>
        </View>

        {/* Description */}
        <Text style={[styles.description, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
          {group.description}
        </Text>

        {/* Info callout */}
        <View style={[styles.callout, { backgroundColor: colors.infoBg, borderColor: colors.info, borderRadius: radius.md }]}>
          <Ionicons name="information-circle-outline" size={18} color={colors.info} style={{ marginTop: 1 }} />
          <Text style={{ flex: 1, fontSize: 13, fontFamily: typography.fontFamily.regular, color: colors.info, marginLeft: 10, lineHeight: 20 }}>
            Access to this group requires approval from the{' '}
            <Text style={{ fontFamily: typography.fontFamily.semiBold }}>Parish Administrator</Text>.
            Your request will be reviewed within{' '}
            <Text style={{ fontFamily: typography.fontFamily.semiBold }}>5–7 working days</Text>.
          </Text>
        </View>

        {/* What happens next */}
        <View style={[styles.stepsCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}>
          <Text style={{ fontSize: 13, fontFamily: typography.fontFamily.semiBold, color: colors.text, marginBottom: 12, letterSpacing: 0.3 }}>
            What happens next?
          </Text>
          {[
            { icon: 'paper-plane-outline', text: 'Your request is sent to the Parish Admin' },
            { icon: 'eye-outline',         text: 'Admin reviews your profile and eligibility' },
            { icon: 'notifications-outline', text: 'You\'ll receive an in-app notification with the decision' },
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
        </View>

        {/* Actions */}
        <Button
          label="Submit Request"
          onPress={() => setSubmitted(true)}
          fullWidth
          size="lg"
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

      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 48 },

  // Group header
  groupHeader: { alignItems: 'center', marginBottom: 20 },
  iconStack: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  iconCircle: {
    width: 76, height: 76, borderRadius: 38,
    alignItems: 'center', justifyContent: 'center',
  },
  lockBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },

  // Description
  description: { fontSize: 14, lineHeight: 22, marginBottom: 20 },

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
