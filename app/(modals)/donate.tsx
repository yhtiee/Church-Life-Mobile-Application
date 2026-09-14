import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
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
import { Dropdown } from '@/components/ui/Dropdown';
import { Card } from '@/components/ui/Card';
import { BankAccountCard } from '@/components/ui/BankAccountCard';
import { useBankAccountsQuery } from '@/hooks/queries/useSupport';
import { useReportPaymentMutation } from '@/hooks/mutations/useSupport';

const CATEGORIES = [
  { label: 'Sunday Offering', value: 'Sunday Offering' },
  { label: 'Tithe', value: 'Tithe' },
  { label: 'Harvest/Bazaar', value: 'Harvest' },
  { label: 'Building Fund', value: 'Building Fund' },
  { label: 'Charity/Poor Box', value: 'Charity' },
];

export default function DonateScreen() {
  const { colors, typography, radius } = useTheme();
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const router = useRouter();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [accountId, setAccountId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const { data: accounts = [], isLoading: loadingAccounts } = useBankAccountsQuery(
    user?.parishId ?? undefined
  );
  const { mutateAsync: reportPayment, isPending: loading } = useReportPaymentMutation(
    user?.id,
    user?.parishId ?? undefined
  );

  // With one published account there is nothing to choose between, so treat
  // it as selected rather than making the member tap it.
  const selectedAccountId = accountId ?? (accounts.length === 1 ? accounts[0].id : null);
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  const handleConfirm = async () => {
    if (!amount || !category) return;
    if (!user?.id) {
      showAlert({
        title: 'Authentication Required',
        message: 'You must be logged in to record a payment.',
        type: 'error',
      });
      return;
    }

    try {
      await reportPayment({
        kind: 'support',
        amount: Number(amount),
        category,
        description: selectedAccount
          ? `${category} · transfer to ${selectedAccount.label}`
          : category,
        bankAccountId: selectedAccountId,
      });
      setSubmitted(true);
    } catch (err: any) {
      showAlert({
        title: 'Could not record',
        message: err.message || 'An error occurred. Please try again.',
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
            <Ionicons name="heart" size={56} color={colors.success} />
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
            Thank You
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
            Your{' '}
            <Text style={{ fontFamily: typography.fontFamily.bold, color: colors.primary }}>
              ₦{parseInt(amount, 10).toLocaleString()}
            </Text>{' '}
            for {category} has been recorded and is{' '}
            <Text style={{ fontFamily: typography.fontFamily.bold, color: colors.warning }}>
              awaiting verification
            </Text>{' '}
            by your parish. You will be notified once it is confirmed.
          </Text>
          <Button
            label="Back to Finance"
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
      <ScreenHeader title="Support the Parish" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(400)}>
            <Card elevation="sm" style={{ padding: 16, borderRadius: radius.lg }}>
              <View style={styles.noteHeader}>
                <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                <Text
                  style={{
                    fontSize: 14,
                    marginLeft: 8,
                    color: colors.text,
                    fontFamily: typography.fontFamily.semiBold,
                  }}
                >
                  How this works
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textSecondary,
                  fontFamily: typography.fontFamily.regular,
                  lineHeight: 20,
                  marginTop: 8,
                }}
              >
                Transfer to the parish account in your banking app, then come back and record it
                here. Nothing is charged in the app. Your parish confirms the transfer before it
                appears in your giving record.
              </Text>
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.block}>
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

            {accounts.length === 0 && !loadingAccounts && (
              <Card elevation="sm" style={{ padding: 16, borderRadius: radius.lg }}>
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.textMuted,
                    fontFamily: typography.fontFamily.regular,
                    lineHeight: 20,
                  }}
                >
                  Your parish has not published account details yet. Ask a parish admin to add them
                  before recording a payment.
                </Text>
              </Card>
            )}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(140).duration(400)} style={styles.block}>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.textSecondary, fontFamily: typography.fontFamily.semiBold },
              ]}
            >
              Record your transfer
            </Text>

            <Label label="Amount" />
            <Input
              placeholder="0"
              value={amount}
              onChangeText={(v) => setAmount(v.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              leftIcon="cash-outline"
            />

            <View style={{ marginTop: 12 }}>
              <Dropdown
                label="What is it for"
                placeholder="Select a category"
                options={CATEGORIES}
                value={category}
                onChange={(value) => setCategory(value)}
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.block}>
            <Button
              label="I have paid"
              onPress={handleConfirm}
              loading={loading}
              disabled={!amount || !category || accounts.length === 0 || loading}
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
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 60 },
  block: { marginTop: 22 },
  sectionTitle: {
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  noteHeader: { flexDirection: 'row', alignItems: 'center' },
  successWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
