import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/FeedbackContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { getGroupMetadata } from '@/constants/groups';
import { useOpenGroupsQuery } from '@/hooks/queries/useGroups';
import { ActivityService } from '@/lib/supabase/services/activity';

export default function GroupTransitionRequestScreen() {
  const { colors, typography, radius } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const { showAlert } = useAlert();

  const [targetGroupId, setTargetGroupId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmitTransition = async () => {
    if (!user?.id || !targetGroupId || !currentGroup?.id) {
      showAlert({ title: 'Error', message: 'Invalid request. Please try again.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const activityService = new ActivityService();
      const { error } = await activityService.logGroupTransitionRequest(
        user.id,
        currentGroup.id,
        targetGroupId,
        currentGroupMeta?.name,
        targetGroupMeta?.name
      );

      if (error) {
        showAlert({ title: 'Failed', message: 'Failed to submit transition request. Please try again.', type: 'error' });
        console.error('Activity logging error:', error);
        setLoading(false);
        return;
      }

      showAlert({ title: 'Success', message: 'Transition request submitted!', type: 'success' });
      setSubmitted(true);
    } catch (err) {
      showAlert({ title: 'Error', message: 'An error occurred. Please try again.', type: 'error' });
      console.error('Submit transition error:', err);
    } finally {
      setLoading(false);
    }
  };

  const { data: groups = [] } = useOpenGroupsQuery();

  const currentGroup = user?.id ? groups.find((g) => g.member_ids?.includes(user.id)) : undefined;
  const targetGroup = groups.find((g) => g.id === targetGroupId);

  const currentGroupMeta = currentGroup ? getGroupMetadata(currentGroup.name) : null;
  const targetGroupMeta = targetGroup ? getGroupMetadata(targetGroup.name) : null;

  const availableGroups = user?.id ? groups.filter((g) => !g.member_ids?.includes(user.id)) : groups;
  const groupOptions = availableGroups.map((g) => {
    const meta = getGroupMetadata(g.name);
    return {
      label: g.name,
      value: g.id,
      subtitle: meta.shortName,
    };
  });

  // Arrow animation
  const arrowTranslateX = useSharedValue(0);
  React.useEffect(() => {
    arrowTranslateX.value = withRepeat(
      withSequence(
        withTiming(6, { duration: 500 }),
        withTiming(0, { duration: 500 })
      ),
      -1,
      true
    );
  }, []);

  const animatedArrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: arrowTranslateX.value }],
  }));

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
            {`Your request to transition to `}<Text style={{ fontFamily: typography.fontFamily.bold, color: colors.primary }}>{targetGroup?.name}</Text>{` has been sent to the Parish Administrator. We’ll notify you once it’s reviewed.`}
          </Text>
          <Button
            label="Back to Profile"
            onPress={() => router.back()}
            fullWidth
            size="lg"
            style={{ marginTop: 32 }}
          />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
      <ScreenHeader title="Group Transition" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Header Description */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <Text style={[styles.description, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
            Group transitions (e.g., aging out of CYON into CMO/CWO) require verification from the Parish Administrator. 
          </Text>
        </Animated.View>

        {/* Transition Visualizer */}
        {targetGroupId && (
          <Animated.View 
            entering={FadeInDown.duration(450)}
            style={[styles.transitionContainer, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.xl }]}
          >
            <View style={styles.transitionNode}>
              <View style={[styles.nodeCircle, { backgroundColor: currentGroupMeta?.color ?? colors.border }]}>
                <Ionicons name={(currentGroupMeta?.icon || 'people') as any} size={22} color="#FFFFFF" />
              </View>
              <Text style={[styles.nodeText, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
                {currentGroupMeta?.shortName ?? 'None'}
              </Text>
            </View>

            <Animated.View style={[styles.arrowNode, animatedArrowStyle]}>
              <Ionicons name="arrow-forward-outline" size={24} color={colors.accent} />
            </Animated.View>

            <View style={styles.transitionNode}>
              <View style={[styles.nodeCircle, { backgroundColor: targetGroupMeta?.color ?? colors.border }]}>
                <Ionicons name={(targetGroupMeta?.icon || 'people') as any} size={22} color="#FFFFFF" />
              </View>
              <Text style={[styles.nodeText, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
                {targetGroupMeta?.shortName ?? 'Select'}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Target Group Dropdown */}
        <Animated.View entering={FadeInDown.delay(100).duration(450)} style={styles.section}>
          <Text style={[styles.label, { color: colors.textSecondary, fontFamily: typography.fontFamily.semiBold }]}>
            Target Group *
          </Text>
          <Dropdown
            label=""
            placeholder="Select your new group..."
            options={groupOptions}
            value={targetGroupId}
            onChange={(val) => setTargetGroupId(val)}
          />
        </Animated.View>

        {/* Reason Field */}
        <Animated.View entering={FadeInDown.delay(180).duration(450)}>
          <Input
            label="Reason for Transition"
            placeholder="e.g. I turned 36 and aged out of the youth group"
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={2}
            style={styles.reasonInput}
          />
        </Animated.View>

        {/* Info callout */}
        <Animated.View 
          entering={FadeInDown.delay(240).duration(450)}
          style={[styles.callout, { backgroundColor: colors.infoBg, borderColor: colors.info, borderRadius: radius.lg }]}
        >
          <Ionicons name="information-circle-outline" size={18} color={colors.info} style={{ marginTop: 1 }} />
          <Text style={{ flex: 1, fontSize: 13, fontFamily: typography.fontFamily.regular, color: colors.info, marginLeft: 10, lineHeight: 20 }}>
            Once approved, you will automatically be moved to your new group and lose access to {currentGroupMeta?.shortName ?? 'your previous group'}{`’s specific updates.`}
          </Text>
        </Animated.View>

        {/* Actions */}
        <Animated.View entering={FadeInDown.delay(300).duration(450)} style={styles.actions}>
          <Button
            label="Submit Request"
            onPress={handleSubmitTransition}
            fullWidth
            size="lg"
            disabled={!targetGroupId || !reason.trim() || loading}
            style={{ marginBottom: 12 }}
          />
          <Button
            label="Cancel"
            onPress={() => router.back()}
            variant="ghost"
            fullWidth
            size="md"
          />
        </Animated.View>

      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 48 },
  description: { fontSize: 14, lineHeight: 22, marginBottom: 20 },
  transitionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 24,
  },
  transitionNode: {
    alignItems: 'center',
    gap: 8,
  },
  nodeCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeText: {
    fontSize: 14,
  },
  arrowNode: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: { marginBottom: 20 },
  label: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  reasonInput: {
    height: 70,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  callout: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, borderWidth: 1, marginBottom: 32 },
  actions: { marginTop: 'auto' },
  successWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  successCircle: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
});
