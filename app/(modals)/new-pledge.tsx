import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
].map(m => ({ label: m, value: m }));

export default function NewPledgeScreen() {
  const { colors, typography, radius } = useTheme();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueMonth, setDueMonth] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <ScreenWrapper edges={['left', 'right', 'bottom']}>
        <View style={styles.successWrapper}>
          <View style={[styles.successCircle, { backgroundColor: colors.warningBg }]}>
            <Ionicons name="document-text" size={48} color={colors.warning} />
          </View>
          <Text style={{ fontSize: 22, fontFamily: typography.fontFamily.extraBold, color: colors.text, marginTop: 20, textAlign: 'center' }}>
            Pledge Recorded
          </Text>
          <Text style={{ fontSize: 14, fontFamily: typography.fontFamily.regular, color: colors.textSecondary, marginTop: 10, textAlign: 'center', lineHeight: 22 }}>
            Your pledge of <Text style={{ fontFamily: typography.fontFamily.bold }}>₦{parseInt(amount).toLocaleString()}</Text> for {title} has been securely saved. It is due by the end of {dueMonth}.
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
          Making a pledge allows the parish to plan effectively. You can track and fulfill your pledges anytime from the Finance dashboard.
        </Text>

        <View style={styles.form}>
          <Input
            label="Pledge Title / Purpose"
            placeholder="e.g. 2025 Harvest Support"
            value={title}
            onChangeText={setTitle}
          />
          <Input
            label="Target Amount (₦)"
            placeholder="e.g. 50000"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <Dropdown
            label="Target Fulfillment Month"
            placeholder="Select a month..."
            options={MONTHS}
            value={dueMonth}
            onChange={(val) => setDueMonth(val)}
          />
        </View>

        {/* Info callout */}
        <View style={[styles.callout, { backgroundColor: colors.infoBg, borderColor: colors.info, borderRadius: radius.md }]}>
          <Ionicons name="information-circle-outline" size={18} color={colors.info} style={{ marginTop: 1 }} />
          <Text style={{ flex: 1, fontSize: 13, fontFamily: typography.fontFamily.regular, color: colors.info, marginLeft: 10, lineHeight: 20 }}>
            You will receive a gentle reminder a week before the end of your selected target month.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            label="Confirm Pledge"
            onPress={() => setSubmitted(true)}
            fullWidth
            size="lg"
            disabled={!title || !amount || !dueMonth}
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
  form: { gap: 16, marginBottom: 24 },
  callout: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, borderWidth: 1, marginBottom: 32 },
  actions: { marginTop: 'auto' },
  successWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  successCircle: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
});
