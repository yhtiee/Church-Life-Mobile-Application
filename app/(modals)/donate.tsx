import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';

const CATEGORIES = [
  { label: 'Sunday Offering', value: 'Sunday Offering' },
  { label: 'Tithe', value: 'Tithe' },
  { label: 'Harvest/Bazaar', value: 'Harvest' },
  { label: 'Building Fund', value: 'Building Fund' },
  { label: 'Charity/Poor Box', value: 'Charity' },
];

const PAYMENT_METHODS = [
  { label: 'Bank Transfer (Direct)', value: 'bank' },
  { label: 'Debit/Credit Card', value: 'card' },
  { label: 'USSD', value: 'ussd' },
];

export default function DonateScreen() {
  const { colors, typography, radius } = useTheme();
  const router = useRouter();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [method, setMethod] = useState('card');
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <ScreenWrapper edges={['left', 'right', 'bottom']}>
        <View style={styles.successWrapper}>
          <View style={[styles.successCircle, { backgroundColor: colors.successBg }]}>
            <Ionicons name="heart" size={56} color={colors.success} />
          </View>
          <Text style={{ fontSize: 22, fontFamily: typography.fontFamily.extraBold, color: colors.text, marginTop: 20, textAlign: 'center' }}>
            God Bless You!
          </Text>
          <Text style={{ fontSize: 14, fontFamily: typography.fontFamily.regular, color: colors.textSecondary, marginTop: 10, textAlign: 'center', lineHeight: 22 }}>
            Your donation of <Text style={{ fontFamily: typography.fontFamily.bold }}>₦{parseInt(amount).toLocaleString()}</Text> for {category} was successful.
          </Text>
          <Button
            label="Back to Finance"
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
        
        <Text style={[styles.description, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
          "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver." — 2 Corinthians 9:7
        </Text>

        <View style={styles.form}>
          <Input
            label="Amount (₦)"
            placeholder="e.g. 5000"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <Dropdown
            label="Donation Category"
            placeholder="Select purpose..."
            options={CATEGORIES}
            value={category}
            onChange={(val) => setCategory(val)}
          />
          <Dropdown
            label="Payment Method"
            placeholder="Select how to pay..."
            options={PAYMENT_METHODS}
            value={method}
            onChange={(val) => setMethod(val)}
          />
        </View>

        <View style={styles.actions}>
          <Button
            label="Proceed to Donate"
            onPress={() => setSubmitted(true)}
            fullWidth
            size="lg"
            disabled={!amount || !category || !method}
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
  description: { fontSize: 14, lineHeight: 22, marginBottom: 28, fontStyle: 'italic' },
  form: { gap: 16, marginBottom: 32 },
  actions: { marginTop: 'auto' },
  successWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  successCircle: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
});
