import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/FeedbackContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BankAccountCard } from '@/components/ui/BankAccountCard';
import GlobalLoader from '@/components/ui/GlobalLoader';
import { useBankAccountsQuery, useCelebrationQuery } from '@/hooks/queries/useSupport';
import { useReportPaymentMutation } from '@/hooks/mutations/useSupport';
import { CELEBRATION_KIND_LABELS } from '@/lib/supabase/entities/types';

export default function SupportCelebrationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, typography, radius } = useTheme();
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const router = useRouter();

  const [amount, setAmount] = useState('');
  const [prayer, setPrayer] = useState('');
  const [accountId, setAccountId] = useState<string | null>(null);
  const [anonymous, setAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: celebration, isLoading } = useCelebrationQuery(id);
  const { data: accounts = [] } = useBankAccountsQuery(user?.parishId ?? undefined);
  const { mutateAsync: reportPayment, isPending } = useReportPaymentMutation(
    user?.id,
    user?.parishId ?? undefined
  );

  const selectedAccountId = accountId ?? (accounts.length === 1 ? accounts[0].id : null);
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  const handleSubmit = async () => {
    if (!celebration || !amount) return;

    try {
      await reportPayment({
        kind: 'celebration',
        amount: Number(amount),
        category: CELEBRATION_KIND_LABELS[celebration.kind],
        description: `Support for ${celebration.celebrant_name}${
          selectedAccount ? ` · transfer to ${selectedAccount.label}` : ''
        }`,
        celebrationId: celebration.id,
        beneficiaryId: celebration.member_id,
        prayerNote: prayer.trim() || null,
        isAnonymous: anonymous,
        bankAccountId: selectedAccountId,
      });
      setSubmitted(true);
    } catch (err: any) {
      showAlert({
        title: 'Could not record',
        message: err?.message || 'Something went wrong. Please try again.',
        type: 'error',
      });
    }
  };

  if (submitted) {
    return (
      <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.successWrapper}>
          <Animated.View
            entering={ZoomIn.springify().damping(12)}
            style={[styles.successCircle, { backgroundColor: colors.successBg }]}
          >
            <Ionicons name="gift" size={56} color={colors.success} />
          </Animated.View>
          <Text
            style={{
              fontSize: 24,
              fontFamily: typography.fontFamily.extraBold,
              color: colors.text,
              marginTop: 24,
              textAlign: 'center',
            }}
          >
            Recorded
          </Text>
          <Text
            style={{
              fontSize: 15,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              marginTop: 10,
              textAlign: 'center',
              lineHeight: 24,
              paddingHorizontal: 12,
            }}
          >
            Your support for {celebration?.celebrant_name} is awaiting verification by your parish.
            Your prayer will be shared with them.
          </Text>
          <Button
            label="Done"
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
      <ScreenHeader title="Send Support" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
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
                  {celebration.celebrant_name}
                </Text>
                {celebration.body ? (
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.textSecondary,
                      fontFamily: typography.fontFamily.regular,
                      lineHeight: 21,
                      marginTop: 6,
                    }}
                  >
                    {celebration.body}
                  </Text>
                ) : null}
              </Card>
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.block}>
            <Card elevation="sm" style={{ padding: 16, borderRadius: radius.lg }}>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textSecondary,
                  fontFamily: typography.fontFamily.regular,
                  lineHeight: 20,
                }}
              >
                Transfer to the parish account below, then record it here. Nothing is charged in the
                app, and your parish confirms the transfer before it is counted.
              </Text>
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(140).duration(400)} style={styles.block}>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.textSecondary, fontFamily: typography.fontFamily.semiBold },
              ]}
            >
              {accounts.length > 1 ? 'Choose an account' : 'Parish account'}
            </Text>
            {accounts.map((account) => (
              <BankAccountCard
                key={account.id}
                account={account}
                selected={account.id === selectedAccountId}
                onSelect={accounts.length > 1 ? () => setAccountId(account.id) : undefined}
              />
            ))}
            {accounts.length === 0 && (
              <Card elevation="sm" style={{ padding: 16, borderRadius: radius.lg }}>
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.textMuted,
                    fontFamily: typography.fontFamily.regular,
                    lineHeight: 20,
                  }}
                >
                  Your parish has not published account details yet.
                </Text>
              </Card>
            )}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.block}>
            <Label label="Amount" />
            <Input
              placeholder="0"
              value={amount}
              onChangeText={(v) => setAmount(v.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              leftIcon="cash-outline"
            />

            <View style={{ marginTop: 12 }}>
              <Label label="Prayer or message" helperText="Shared with the celebrant" />
              <Input
                placeholder="May God continue to bless you"
                value={prayer}
                onChangeText={setPrayer}
                multiline
                numberOfLines={4}
                style={{ height: 110, textAlignVertical: 'top' }}
              />
            </View>

            <TouchableOpacity onPress={() => setAnonymous((v) => !v)} style={styles.anonRow}>
              <Ionicons
                name={anonymous ? 'checkbox' : 'square-outline'}
                size={22}
                color={colors.primary}
              />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.text,
                    fontFamily: typography.fontFamily.medium,
                  }}
                >
                  Send without my name
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textMuted,
                    fontFamily: typography.fontFamily.regular,
                    marginTop: 2,
                  }}
                >
                  {anonymous
                    ? 'The celebrant sees your message but not your name.'
                    : 'Your name is shown with your message.'}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(260).duration(400)} style={styles.block}>
            <Button
              label="I have paid"
              onPress={handleSubmit}
              loading={isPending}
              disabled={!amount || accounts.length === 0 || isPending}
              fullWidth
              size="lg"
            />
            <Text
              style={{
                fontSize: 12,
                color: colors.textMuted,
                fontFamily: typography.fontFamily.regular,
                textAlign: 'center',
                marginTop: 10,
              }}
            >
              Only tap this after you have made the transfer.
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
      <GlobalLoader visible={isLoading} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 60 },
  block: { marginTop: 20 },
  anonRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 16 },
  sectionTitle: {
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  successWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
