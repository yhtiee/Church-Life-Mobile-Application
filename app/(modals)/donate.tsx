import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
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
import { useCreateDonationMutation } from '@/hooks/mutations/useFinance';

const CATEGORIES = [
  { label: 'Sunday Offering', value: 'Sunday Offering' },
  { label: 'Tithe', value: 'Tithe' },
  { label: 'Harvest/Bazaar', value: 'Harvest' },
  { label: 'Building Fund', value: 'Building Fund' },
  { label: 'Charity/Poor Box', value: 'Charity' },
];

const PAYMENT_METHODS = [
  { label: 'Debit/Credit Card', value: 'card' },
  { label: 'Bank Transfer (Direct)', value: 'bank' },
  { label: 'USSD', value: 'ussd' },
];

export default function DonateScreen() {
  const { colors, typography, radius } = useTheme();
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const router = useRouter();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [method, setMethod] = useState('card');
  const [submitted, setSubmitted] = useState(false);

  const { mutateAsync: createDonation, isPending: loading } = useCreateDonationMutation(user?.id || '');

  const handleDonate = async () => {
    if (!amount || !category || !method) return;
    if (!user?.id) {
      showAlert({
        title: 'Authentication Required',
        message: 'You must be logged in to donate.',
        type: 'error',
      });
      return;
    }

    try {
      await createDonation({
        description: `${category} via ${PAYMENT_METHODS.find((p) => p.value === method)?.label || method}`,
        amount: Number(amount),
        currency: '₦',
        category: category,
      });

      showAlert({
        title: 'God Bless You!',
        message: `Your donation of ₦${parseInt(amount).toLocaleString()} for ${category} has been submitted and is pending admin review. You will be notified once it's recorded.`,
        type: 'success',
        buttonLabel: 'View Status',
        onPress: () => {
          setSubmitted(true);
        },
      });
    } catch (err: any) {
      showAlert({
        title: 'Donation Failed',
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
          <Text style={{ fontSize: 24, fontFamily: typography.fontFamily.extraBold, color: colors.text, marginTop: 24, textAlign: 'center' }}>
            Donation Submitted
          </Text>
          <Text style={{ fontSize: 15, fontFamily: typography.fontFamily.regular, color: colors.textSecondary, marginTop: 10, textAlign: 'center', lineHeight: 24, paddingHorizontal: 12 }}>
            Your donation of <Text style={{ fontFamily: typography.fontFamily.bold, color: colors.primary }}>₦{parseInt(amount).toLocaleString()}</Text> for {category} has been submitted and is <Text style={{ fontFamily: typography.fontFamily.bold, color: colors.warning }}>pending admin review</Text>. You will be notified once it's recorded.
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
      <ScreenHeader title="Donate" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <Animated.View entering={FadeInDown.duration(400)}>
          <Card 
            elevation="sm" 
            style={[styles.scriptureCard, { borderColor: '#D4AF37', borderLeftWidth: 1, backgroundColor: colors.surface }]}
          >
            <View style={styles.scriptureHeader}>
              <Ionicons name="gift" size={16} color="#D4AF37" />
              <Text style={{ fontSize: 11, fontFamily: typography.fontFamily.bold, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Liturgical Offering
              </Text>
            </View>
            <Text style={[styles.description, { color: colors.text, fontFamily: typography.fontFamily.regular }]}>
              {`“Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.”`}
            </Text>
            <Text style={[styles.scriptureRef, { color: colors.textSecondary, fontFamily: typography.fontFamily.semiBold }]}>
              — 2 Corinthians 9:7
            </Text>
          </Card>
        </Animated.View>

        <View style={styles.form}>
          <View>
            <Label label="Amount (₦)" required />
            <Input
              placeholder="e.g. 5000"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              error={amount === '' && submitted ? 'Amount is required' : undefined}
            />
          </View>
          <View>
            <Label label="Donation Category" required />
            <Dropdown
              placeholder="Select purpose..."
              options={CATEGORIES}
              value={category}
              onChange={(val) => setCategory(val)}
            />
          </View>
          <View>
            <Label label="Payment Method" required />
            <Dropdown
              placeholder="Select how to pay..."
              options={PAYMENT_METHODS}
              value={method}
              onChange={(val) => setMethod(val)}
            />
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            label="Proceed to Donate"
            onPress={handleDonate}
            fullWidth
            size="lg"
            loading={loading}
            disabled={!amount || !category || !method}
            style={{ marginBottom: 12 }}
          />
          <Button
            label="Cancel"
            onPress={() => router.back()}
            variant="ghost"
            fullWidth
            size="md"
            disabled={loading}
          />
        </View>

      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48 },
  scriptureCard: {
    padding: 16,
    marginBottom: 28,
    borderWidth: 1,
  },
  scriptureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  description: { fontSize: 13, lineHeight: 20, fontStyle: 'italic' },
  scriptureRef: { fontSize: 11, alignSelf: 'flex-end', marginTop: 6 },
  form: { gap: 16, marginBottom: 32 },
  actions: { marginTop: 'auto' },
  successWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  successCircle: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
});
