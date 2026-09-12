import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/FeedbackContext';
import { Card } from '@/components/ui/Card';
import { useParishTransferRequestsQuery } from '@/hooks/queries/useParishes';
import { useDecideParishTransferMutation } from '@/hooks/mutations/useParishes';
import type { DatabaseParishTransferRequest } from '@/lib/supabase/entities/types';

/**
 * Pending requests to transfer OUT of the signed-in admin's parish.
 *
 * The releasing parish decides, so this queue belongs to the parish a member
 * is leaving, not the one they are joining. Renders nothing when empty.
 */
export function ParishTransferQueue() {
  const { colors, typography, radius } = useTheme();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const isAdmin = user?.role === 'parish_admin';
  const { data: requests = [] } = useParishTransferRequestsQuery(
    isAdmin ? user?.parishId ?? undefined : undefined
  );
  const { mutateAsync: decide, isPending } = useDecideParishTransferMutation(
    user?.parishId ?? undefined
  );

  if (!isAdmin || requests.length === 0) return null;

  const act = async (request: DatabaseParishTransferRequest, approve: boolean) => {
    try {
      await decide({ requestId: request.id, approve });
      showAlert({
        title: approve ? 'Transfer approved' : 'Transfer declined',
        message: approve
          ? `${request.userName} has moved to ${request.toParish?.name ?? 'their new parish'}.`
          : `${request.userName} stays in this parish.`,
        type: 'success',
      });
    } catch (err: any) {
      showAlert({
        title: 'Could not complete',
        message: err?.message || 'Something went wrong. Please try again.',
        type: 'error',
      });
    }
  };

  const confirmApprove = (request: DatabaseParishTransferRequest) => {
    showAlert({
      title: 'Approve transfer?',
      message: `${request.userName} will leave this parish, along with their groups and any duty title. Giving history stays here.`,
      type: 'success',
      buttonLabel: 'Approve',
      onPress: () => act(request, true),
      secondaryButtonLabel: 'Cancel',
    });
  };

  return (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.wrap}>
      <View style={styles.header}>
        <Ionicons name="swap-horizontal-outline" size={18} color={colors.primary} />
        <Text
          style={[
            styles.title,
            { color: colors.textSecondary, fontFamily: typography.fontFamily.semiBold },
          ]}
        >
          Parish transfers ({requests.length})
        </Text>
      </View>

      {requests.map((request) => (
        <Card
          key={request.id}
          elevation="sm"
          style={{ padding: 14, borderRadius: radius.lg, marginBottom: 10 }}
        >
          <Text
            style={{ fontSize: 15, color: colors.text, fontFamily: typography.fontFamily.bold }}
          >
            {request.userName}
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.regular,
              marginTop: 2,
            }}
          >
            Wants to move to {request.toParish?.name ?? 'another parish'}
          </Text>

          {request.reason ? (
            <Text
              style={{
                fontSize: 13,
                color: colors.textMuted,
                fontFamily: typography.fontFamily.regular,
                marginTop: 8,
                fontStyle: 'italic',
              }}
            >
              “{request.reason}”
            </Text>
          ) : null}

          <View style={styles.actions}>
            <TouchableOpacity
              disabled={isPending}
              onPress={() => act(request, false)}
              style={[
                styles.btn,
                { borderRadius: radius.md, borderColor: colors.border, opacity: isPending ? 0.5 : 1 },
              ]}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: colors.text,
                  fontFamily: typography.fontFamily.semiBold,
                }}
              >
                Decline
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={isPending}
              onPress={() => confirmApprove(request)}
              style={[
                styles.btn,
                {
                  borderRadius: radius.md,
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                  opacity: isPending ? 0.5 : 1,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textInverse,
                  fontFamily: typography.fontFamily.semiBold,
                }}
              >
                Approve
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  title: { fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 14 },
  btn: { paddingHorizontal: 18, paddingVertical: 9, borderWidth: 1 },
});
