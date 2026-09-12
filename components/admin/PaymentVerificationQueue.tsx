import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/FeedbackContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { usePendingPaymentsQuery } from '@/hooks/queries/useSupport';
import { useVerifyPaymentMutation } from '@/hooks/mutations/useSupport';
import type { DatabaseDonation, PaymentKind } from '@/lib/supabase/entities/types';

const KIND_LABELS: Record<PaymentKind, string> = {
  offering: 'Offering',
  support: 'Parish Support',
  celebration: 'Celebration',
};

/** Rows carry joined names that are not columns on the table. */
type PendingPayment = DatabaseDonation & {
  payer?: { fullName: string } | null;
  beneficiary?: { fullName: string } | null;
};

/**
 * Every payment a member has reported, awaiting the parish admin's
 * confirmation that the transfer actually landed.
 *
 * Offerings, parish support and celebration gifts are all donation rows, so
 * they queue here together rather than in three separate places.
 */
export function PaymentVerificationQueue() {
  const { colors, typography, radius } = useTheme();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const parishId = user?.parishId ?? undefined;
  const { data: payments = [] } = usePendingPaymentsQuery(parishId);
  const { mutateAsync: verify, isPending } = useVerifyPaymentMutation(parishId);

  const [reviewing, setReviewing] = useState<PendingPayment | null>(null);
  const [confirmedAmount, setConfirmedAmount] = useState('');
  const [note, setNote] = useState('');

  const openReview = (payment: PendingPayment) => {
    setReviewing(payment);
    setConfirmedAmount(String(payment.amount));
    setNote('');
  };

  const decide = async (approve: boolean) => {
    if (!reviewing) return;
    try {
      await verify({
        donationId: reviewing.id,
        approve,
        note: note.trim() || undefined,
        // What actually landed, which may differ from what was reported. The
        // reported amount is never overwritten.
        confirmedAmount: approve && confirmedAmount ? Number(confirmedAmount) : undefined,
      });
      setReviewing(null);
      showAlert({
        title: approve ? 'Payment verified' : 'Payment rejected',
        message: approve
          ? 'It now counts towards your parish records.'
          : 'The member will see that it could not be confirmed.',
        type: 'success',
      });
    } catch (err: any) {
      showAlert({
        title: 'Could not update',
        message: err?.message || 'Something went wrong. Please try again.',
        type: 'error',
      });
    }
  };

  return (
    <View style={styles.wrap}>
      <Text
        style={[
          styles.sectionTitle,
          { color: colors.textMuted, fontFamily: typography.fontFamily.semiBold },
        ]}
      >
        Payments to verify ({payments.length})
      </Text>

      {payments.length === 0 ? (
        <Text
          style={{
            color: colors.textMuted,
            fontFamily: typography.fontFamily.medium,
            fontSize: 13,
            textAlign: 'center',
            paddingVertical: 32,
          }}
        >
          Nothing awaiting verification
        </Text>
      ) : (
        (payments as PendingPayment[]).map((payment, index) => (
          <Animated.View key={payment.id} entering={FadeInDown.delay(index * 40).duration(350)}>
            <Card
              elevation="sm"
              style={{ padding: 14, borderRadius: radius.lg, marginBottom: 10 }}
              pressable
              onPress={() => openReview(payment)}
            >
              <View style={styles.headRow}>
                <Badge label={KIND_LABELS[payment.kind ?? 'offering']} variant="primary" size="sm" />
                <Text
                  style={{
                    fontSize: 17,
                    color: colors.text,
                    fontFamily: typography.fontFamily.extraBold,
                  }}
                >
                  {payment.currency}
                  {Number(payment.amount).toLocaleString()}
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 14,
                  color: colors.text,
                  fontFamily: typography.fontFamily.semiBold,
                  marginTop: 8,
                }}
              >
                {payment.payer?.fullName ?? 'A member'}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textSecondary,
                  fontFamily: typography.fontFamily.regular,
                  marginTop: 2,
                }}
              >
                {payment.description}
              </Text>

              {payment.beneficiary?.fullName ? (
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.primary,
                    fontFamily: typography.fontFamily.medium,
                    marginTop: 6,
                  }}
                >
                  For {payment.beneficiary.fullName}
                </Text>
              ) : null}

              {payment.prayer_note ? (
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textMuted,
                    fontFamily: typography.fontFamily.regular,
                    fontStyle: 'italic',
                    marginTop: 6,
                  }}
                  numberOfLines={2}
                >
                  “{payment.prayer_note}”
                </Text>
              ) : null}

              <View style={styles.footRow}>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textMuted,
                    fontFamily: typography.fontFamily.regular,
                  }}
                >
                  {payment.date}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.primary,
                    fontFamily: typography.fontFamily.semiBold,
                  }}
                >
                  Review
                </Text>
              </View>
            </Card>
          </Animated.View>
        ))
      )}

      <Modal visible={!!reviewing} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.backdrop}>
          <View
            style={[
              styles.sheet,
              { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
            ]}
          >
            <Text
              style={{ fontSize: 17, color: colors.text, fontFamily: typography.fontFamily.bold }}
            >
              Verify payment
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: colors.textSecondary,
                fontFamily: typography.fontFamily.regular,
                marginTop: 6,
                lineHeight: 19,
              }}
            >
              {reviewing?.payer?.fullName ?? 'A member'} reported {reviewing?.currency}
              {Number(reviewing?.amount ?? 0).toLocaleString()}. Confirm it against your bank
              statement before approving.
            </Text>

            <View style={{ marginTop: 16 }}>
              <Label label="Amount received" helperText="Change it if a different sum landed" />
              <Input
                value={confirmedAmount}
                onChangeText={(v) => setConfirmedAmount(v.replace(/[^0-9.]/g, ''))}
                keyboardType="decimal-pad"
                leftIcon="cash-outline"
              />
            </View>

            <View style={{ marginTop: 12 }}>
              <Label label="Note" helperText="Optional" />
              <Input
                placeholder="Reference or reason"
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
                style={{ height: 76, textAlignVertical: 'top' }}
              />
            </View>

            <View style={styles.sheetActions}>
              <Button
                label="Reject"
                onPress={() => decide(false)}
                variant="secondary"
                loading={isPending}
                style={{ flex: 1 }}
              />
              <Button
                label="Verify"
                onPress={() => decide(true)}
                loading={isPending}
                style={{ flex: 1 }}
              />
            </View>

            <TouchableOpacity onPress={() => setReviewing(null)} style={styles.cancel}>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textMuted,
                  fontFamily: typography.fontFamily.medium,
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, marginBottom: 8 },
  sectionTitle: {
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { padding: 22, paddingBottom: 30 },
  sheetActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancel: { alignItems: 'center', marginTop: 14 },
});
