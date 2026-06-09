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
import { Dropdown } from '@/components/ui/Dropdown';
import { Card } from '@/components/ui/Card';
import { Gradients } from '@/constants/theme';
import { useCreatePledgeMutation } from '@/hooks/mutations/useFinance';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
].map(m => ({ label: m, value: m }));

const computeDueDate = (monthName: string): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthIndex = months.indexOf(monthName);
  if (monthIndex === -1) return new Date().toISOString().split('T')[0];

  const now = new Date();
  let year = now.getFullYear();
  const currentMonth = now.getMonth();

  if (monthIndex < currentMonth) {
    year += 1;
  }

  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const pad = (num: number) => String(num).padStart(2, '0');
  return `${year}-${pad(monthIndex + 1)}-${pad(lastDay)}`;
};

export default function NewPledgeScreen() {
  const { colors, typography, radius } = useTheme();
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueMonth, setDueMonth] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { mutateAsync: createPledge, isPending: loading } = useCreatePledgeMutation(user?.id || '');

  const handleConfirmPledge = async () => {
    if (!title || !amount || !dueMonth) return;
    if (!user?.id) {
      showAlert({
        title: 'Authentication Required',
        message: 'You must be logged in to create a pledge.',
        type: 'error',
      });
      return;
    }

    try {
      const calculatedDueDate = computeDueDate(dueMonth);

      await createPledge({
        title,
        targetAmount: Number(amount),
        currency: '₦',
        dueDate: calculatedDueDate,
      });

      showAlert({
        title: 'Pledge Recorded',
        message: `Your pledge of ₦${parseInt(amount).toLocaleString()} for ${title} has been securely saved. It is due by the end of ${dueMonth}.`,
        type: 'success',
        buttonLabel: 'View Commitments',
        onPress: () => {
          setSubmitted(true);
        },
      });
    } catch (err: any) {
      showAlert({
        title: 'Pledge Creation Failed',
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
            style={[styles.successCircle, { backgroundColor: colors.warningBg }]}
          >
            <Ionicons name="document-text" size={48} color={colors.warning} />
          </Animated.View>
          <Text style={{ fontSize: 24, fontFamily: typography.fontFamily.extraBold, color: colors.text, marginTop: 24, textAlign: 'center' }}>
            Pledge Recorded
          </Text>
          <Text style={{ fontSize: 15, fontFamily: typography.fontFamily.regular, color: colors.textSecondary, marginTop: 10, textAlign: 'center', lineHeight: 24, paddingHorizontal: 12 }}>
            Your pledge of <Text style={{ fontFamily: typography.fontFamily.bold, color: colors.primary }}>₦{parseInt(amount).toLocaleString()}</Text> for {title} has been securely saved. It is due by the end of {dueMonth}.
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

  const numericAmount = parseFloat(amount) || 0;

  return (
    <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
      <ScreenHeader title="New Pledge" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <Animated.View entering={FadeInDown.duration(400)}>
          <Card 
            elevation="sm" 
            style={[styles.scriptureCard, { borderColor: '#D4AF37', borderLeftWidth: 1, backgroundColor: colors.surface }]}
          >
            <View style={styles.scriptureHeader}>
              <Ionicons name="bookmark" size={16} color="#D4AF37" />
              <Text style={{ fontSize: 11, fontFamily: typography.fontFamily.bold, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Pledge Commitment
              </Text>
            </View>
            <Text style={[styles.description, { color: colors.text, fontFamily: typography.fontFamily.regular }]}>
              Making a pledge allows the parish to plan projects effectively. You can track and fulfill your pledges anytime from the Finance dashboard.
            </Text>
          </Card>
        </Animated.View>

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

        {/* Commitment Card Preview */}
        {(title || numericAmount > 0 || dueMonth) && (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.previewContainer}>
            <Text style={[styles.previewLabel, { color: colors.textSecondary, fontFamily: typography.fontFamily.semiBold }]}>
              Commitment Preview
            </Text>
            <Card
              elevation="md"
              gradient={Gradients.cardGold}
              padding={20}
              borderRadius={radius.lg}
              style={styles.previewCard}
            >
              <View style={styles.previewHeader}>
                <Ionicons name="ribbon-outline" size={20} color="#FFFFFF" />
                <Text style={[styles.previewBadgeText, { fontFamily: typography.fontFamily.bold }]}>
                  ACTIVE COMMITMENT
                </Text>
              </View>
              <Text style={[styles.previewTitleText, { fontFamily: typography.fontFamily.extraBold }]} numberOfLines={1}>
                {title || 'Pledge Title'}
              </Text>
              <Text style={[styles.previewAmountText, { fontFamily: typography.fontFamily.bold }]}>
                ₦{numericAmount.toLocaleString()}
              </Text>
              <View style={styles.previewFooter}>
                <Text style={[styles.previewFooterText, { fontFamily: typography.fontFamily.medium }]}>
                  Target: {dueMonth || 'Select month'}
                </Text>
                <Text style={[styles.previewFooterText, { fontFamily: typography.fontFamily.medium }]}>
                  0% Paid
                </Text>
              </View>
            </Card>
          </Animated.View>
        )}

        {/* Info callout */}
        <View style={[styles.callout, { backgroundColor: colors.infoBg, borderColor: colors.info, borderRadius: radius.lg }]}>
          <Ionicons name="information-circle-outline" size={18} color={colors.info} style={{ marginTop: 1 }} />
          <Text style={{ flex: 1, fontSize: 13, fontFamily: typography.fontFamily.regular, color: colors.info, marginLeft: 10, lineHeight: 20 }}>
            You will receive a gentle reminder a week before the end of your selected target month.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            label="Confirm Pledge"
            onPress={handleConfirmPledge}
            fullWidth
            size="lg"
            loading={loading}
            disabled={!title || !amount || !dueMonth}
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
    marginBottom: 24,
    borderWidth: 1,
  },
  scriptureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  description: { fontSize: 13, lineHeight: 20 },
  form: { gap: 16, marginBottom: 24 },
  previewContainer: {
    marginBottom: 24,
  },
  previewLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  previewCard: {
    minHeight: 140,
    justifyContent: 'space-between',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.85,
    letterSpacing: 1,
  },
  previewTitleText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 10,
  },
  previewAmountText: {
    fontSize: 26,
    color: '#FFFFFF',
    marginTop: 4,
  },
  previewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 10,
  },
  previewFooterText: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  callout: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, borderWidth: 1, marginBottom: 32 },
  actions: { marginTop: 'auto' },
  successWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  successCircle: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
});
