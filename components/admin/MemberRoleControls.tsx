import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/FeedbackContext';
import { Card } from '@/components/ui/Card';
import { useAssignMemberRolesMutation } from '@/hooks/mutations/useProfiles';
import { DUTY_ROLE_LABELS, type DutyRole } from '@/lib/supabase/entities/types';

const DUTY_ROLES = Object.keys(DUTY_ROLE_LABELS) as DutyRole[];

export interface RoleEditableMember {
  id: string;
  fullName?: string | null;
  parishId?: string | null;
  role?: string | null;
  duty_role?: DutyRole | null;
}

interface Props {
  member: RoleEditableMember;
  /** Called with the row returned by the database so the screen can refresh. */
  onUpdated?: (updated: any) => void;
}

/**
 * Parish admin controls for a member's duty title and access role.
 *
 * Renders nothing unless the signed-in user is a parish admin looking at
 * someone in their own parish. The database function enforces the same rule,
 * so this is presentation, not the security boundary.
 */
export function MemberRoleControls({ member, onUpdated }: Props) {
  const { colors, typography, radius } = useTheme();
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const { mutateAsync: assignRoles, isPending } = useAssignMemberRolesMutation();

  const isAdmin = user?.role === 'parish_admin';
  const sameParish = !!user?.parishId && user.parishId === member.parishId;
  const isSelf = user?.id === member.id;

  if (!isAdmin || !sameParish) return null;

  const memberIsAdmin = member.role === 'parish_admin';
  const firstName = member.fullName?.split(' ')[0] || 'this member';

  const apply = async (
    updates: { role?: 'member' | 'parish_admin'; dutyRole?: DutyRole | null },
    successMessage: string
  ) => {
    try {
      const updated = await assignRoles({ targetUserId: member.id, ...updates });
      onUpdated?.(updated);
      showAlert({ title: 'Updated', message: successMessage, type: 'success' });
    } catch (err: any) {
      showAlert({
        title: 'Could not update',
        message: err?.message || 'Something went wrong. Please try again.',
        type: 'error',
      });
    }
  };

  const selectDutyRole = (role: DutyRole) => {
    const clearing = member.duty_role === role;
    apply(
      { dutyRole: clearing ? null : role },
      clearing
        ? `Removed the ${DUTY_ROLE_LABELS[role]} title.`
        : `${firstName} is now ${DUTY_ROLE_LABELS[role]}.`
    );
  };

  const toggleAdmin = () => {
    if (memberIsAdmin) {
      showAlert({
        title: 'Remove admin access?',
        message: `${firstName} will lose access to the parish admin area.`,
        type: 'error',
        buttonLabel: 'Remove access',
        onPress: () => apply({ role: 'member' }, `${firstName} is no longer a parish admin.`),
        secondaryButtonLabel: 'Cancel',
      });
      return;
    }
    showAlert({
      title: 'Make parish admin?',
      message: `${firstName} will get full access to the parish admin area, including finances and member records.`,
      type: 'success',
      buttonLabel: 'Make admin',
      onPress: () => apply({ role: 'parish_admin' }, `${firstName} is now a parish admin.`),
      secondaryButtonLabel: 'Cancel',
    });
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.textSecondary, fontFamily: typography.fontFamily.semiBold },
          ]}
        >
          Roles & Responsibilities
        </Text>
        {isPending && <ActivityIndicator size="small" color={colors.primary} />}
      </View>

      <Card elevation="sm" style={{ padding: 16, borderRadius: radius.lg }}>
        <Text
          style={{
            fontSize: 13,
            color: colors.textMuted,
            fontFamily: typography.fontFamily.regular,
            marginBottom: 12,
          }}
        >
          Duty title
        </Text>

        <View style={styles.chipRow}>
          {DUTY_ROLES.map((role) => {
            const selected = member.duty_role === role;
            return (
              <TouchableOpacity
                key={role}
                disabled={isPending}
                onPress={() => selectDutyRole(role)}
                style={[
                  styles.chip,
                  {
                    borderRadius: radius.md,
                    borderColor: selected ? colors.primary : colors.border,
                    backgroundColor: selected ? colors.primary : 'transparent',
                    opacity: isPending ? 0.6 : 1,
                  },
                ]}
              >
                {selected && (
                  <Ionicons name="checkmark" size={14} color={colors.textInverse} style={styles.chipIcon} />
                )}
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: typography.fontFamily.medium,
                    color: selected ? colors.textInverse : colors.text,
                  }}
                >
                  {DUTY_ROLE_LABELS[role]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text
          style={{
            fontSize: 12,
            color: colors.textMuted,
            fontFamily: typography.fontFamily.regular,
            marginTop: 10,
          }}
        >
          Titles are for display only and grant no extra access. Tap a selected title to remove it.
        </Text>

        <View style={[styles.divider, { backgroundColor: colors.divider }]} />

        <View style={styles.adminRow}>
          <View style={styles.adminCopy}>
            <Text
              style={{
                fontSize: 15,
                color: colors.text,
                fontFamily: typography.fontFamily.semiBold,
              }}
            >
              Parish admin access
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: colors.textMuted,
                fontFamily: typography.fontFamily.regular,
                marginTop: 2,
              }}
            >
              {isSelf
                ? 'You cannot change your own access.'
                : memberIsAdmin
                  ? 'Can manage this parish.'
                  : 'Currently a member.'}
            </Text>
          </View>

          <TouchableOpacity
            disabled={isPending || isSelf}
            onPress={toggleAdmin}
            style={[
              styles.adminBtn,
              {
                borderRadius: radius.md,
                backgroundColor: memberIsAdmin ? 'transparent' : colors.primary,
                borderColor: memberIsAdmin ? colors.border : colors.primary,
                opacity: isPending || isSelf ? 0.5 : 1,
              },
            ]}
          >
            <Text
              style={{
                fontSize: 13,
                fontFamily: typography.fontFamily.semiBold,
                color: memberIsAdmin ? colors.text : colors.textInverse,
              }}
            >
              {memberIsAdmin ? 'Remove' : 'Make admin'}
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  chipIcon: { marginRight: 4 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 16 },
  adminRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  adminCopy: { flex: 1 },
  adminBtn: { paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1 },
});
