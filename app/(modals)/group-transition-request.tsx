import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { OPEN_GROUPS } from '@/constants/groups';

export default function GroupTransitionRequestScreen() {
  const { colors, typography, radius } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [targetGroupId, setTargetGroupId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const currentGroup = OPEN_GROUPS.find((g) => g.id === user?.groupId);
  const availableGroups = OPEN_GROUPS.filter((g) => g.id !== user?.groupId);
  const groupOptions = availableGroups.map((g) => ({
    label: g.name,
    value: g.id,
    subtitle: g.shortName,
  }));

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
            Your request to transition to a new group has been sent to the Parish Administrator. We'll notify you once it's reviewed.
          </Text>
          <Button
            label="Back to Profile"
            onPress={() => router.back()}
            fullWidth
            size="lg"
            style={{ marginTop: 28 }}
          />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Header Description */}
        <Text style={[styles.description, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
          Group transitions (e.g., aging out of CYON into CMO/CWO) require verification from the Parish Administrator. 
        </Text>

        {/* Current Group */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSecondary, fontFamily: typography.fontFamily.semiBold }]}>
            Current Group
          </Text>
          <View style={[styles.currentGroupCard, { backgroundColor: colors.surfaceMuted, borderRadius: radius.md, borderColor: colors.border }]}>
            <Ionicons name={currentGroup?.icon as any ?? 'people-outline'} size={24} color={currentGroup?.color ?? colors.icon} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontSize: 15, fontFamily: typography.fontFamily.bold, color: colors.text }}>
                {currentGroup?.name ?? 'No Group Assigned'}
              </Text>
              <Text style={{ fontSize: 12, fontFamily: typography.fontFamily.regular, color: colors.textMuted }}>
                {currentGroup?.shortName}
              </Text>
            </View>
          </View>
        </View>

        {/* Target Group Dropdown */}
        <View style={styles.section}>
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
        </View>

        {/* Info callout */}
        <View style={[styles.callout, { backgroundColor: colors.infoBg, borderColor: colors.info, borderRadius: radius.md }]}>
          <Ionicons name="information-circle-outline" size={18} color={colors.info} style={{ marginTop: 1 }} />
          <Text style={{ flex: 1, fontSize: 13, fontFamily: typography.fontFamily.regular, color: colors.info, marginLeft: 10, lineHeight: 20 }}>
            Once approved, you will automatically be moved to your new group and lose access to {currentGroup?.shortName ?? 'your previous group'}'s specific updates.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            label="Submit Request"
            onPress={() => setSubmitted(true)}
            fullWidth
            size="lg"
            disabled={!targetGroupId}
            style={{ marginBottom: 12 }}
          />
          <Button
            label="Cancel"
            onPress={() => router.back()}
            variant="ghost"
            fullWidth
            size="md"
          />
        </View>

      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48 },
  description: { fontSize: 14, lineHeight: 22, marginBottom: 24 },
  section: { marginBottom: 24 },
  label: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  currentGroupCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderWidth: 1 },
  callout: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, borderWidth: 1, marginBottom: 32 },
  actions: { marginTop: 'auto' },
  successWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  successCircle: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
});
