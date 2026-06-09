import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FinanaceService } from '@/lib/supabase/services/finance';
import { Gradients } from '@/constants/theme';

export default function PledgeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, typography, radius } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [pledge, setPledge] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPledge = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const service = new FinanaceService();
        const { data, error } = await service.fetchPledges(user.id);
        if (!error && data) {
          const found = data.find((p) => p.id === id);
          setPledge(found || null);
        } else {
          setPledge(null);
        }
      } catch (err) {
        setPledge(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPledge();
  }, [id, user?.id]);

  if (loading) {
    return (
      <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
        <ScreenHeader title="Pledge Details" />
        <LoadingSpinner fullScreen />
      </ScreenWrapper>
    );
  }

  if (!pledge) {
    return (
      <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
        <ScreenHeader title="Pledge Details" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.textSecondary, fontFamily: typography.fontFamily.medium, fontSize: 16 }}>
            Pledge record not found.
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  const paid = pledge.isPaid ? pledge.targetAmount : (pledge.paidAmount || 0);
  const pct = pledge.targetAmount > 0 ? (paid / pledge.targetAmount) : 0;

  const InfoRow = ({ label, value, icon }: { label: string; value: string; icon: string }) => (
    <View style={[styles.infoRow, { borderBottomColor: colors.divider }]}>
      <View style={styles.infoLabelGroup}>
        <Ionicons name={icon as any} size={16} color={colors.textMuted} />
        <Text style={{ fontSize: 13, fontFamily: typography.fontFamily.regular, color: colors.textMuted, marginLeft: 8 }}>{label}</Text>
      </View>
      <Text style={{ fontSize: 13, fontFamily: typography.fontFamily.semiBold, color: colors.text }}>{value}</Text>
    </View>
  );

  return (
    <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
      <ScreenHeader title="Pledge Details" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Amount Hero Gradient */}
        <Animated.View entering={FadeIn.duration(400)}>
          <LinearGradient
            colors={pledge.isPaid ? Gradients.cardGreen : Gradients.cardGold}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.hero, { borderRadius: radius.xl }]}
          >
            <View style={styles.heroIconCircle}>
              <Ionicons 
                name={pledge.isPaid ? "checkmark" : "bookmark"} 
                size={28} 
                color="#FFFFFF" 
              />
            </View>
            <Text style={{ fontSize: 12, fontFamily: typography.fontFamily.bold, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: 1.2, marginTop: 14 }}>
              {pledge.isPaid ? 'Pledge Fulfilled' : 'Active Pledge'}
            </Text>
            <Text style={{ fontSize: 32, fontFamily: typography.fontFamily.extraBold, color: '#FFFFFF', marginTop: 4 }}>
              {pledge.currency}{pledge.targetAmount.toLocaleString()}
            </Text>
            <Text style={{ fontSize: 15, fontFamily: typography.fontFamily.medium, color: '#FFFFFF', marginTop: 4 }}>
              {pledge.title}
            </Text>
          </LinearGradient>
        </Animated.View>

        <View style={styles.content}>
          
          {/* Progress Bar Container */}
          <Animated.View entering={FadeInDown.delay(100).duration(450)} style={styles.progressBox}>
            <View style={styles.progressTextRow}>
              <Text style={{ fontSize: 13, fontFamily: typography.fontFamily.bold, color: colors.textSecondary }}>Fulfillment Progress</Text>
              <Text style={{ fontSize: 13, fontFamily: typography.fontFamily.bold, color: pledge.isPaid ? colors.success : colors.accent }}>{Math.round(pct * 100)}%</Text>
            </View>
            <View style={[styles.progressBarBg, { backgroundColor: colors.border, borderRadius: radius.full }]}>
              <View style={[styles.progressBarFill, { width: `${pct * 100}%`, backgroundColor: pledge.isPaid ? colors.success : colors.accent, borderRadius: radius.full }]} />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(450)}>
            <Card elevation="sm" style={{ padding: 0, overflow: 'hidden', borderRadius: radius.lg }}>
              <InfoRow label="Pledge Title" value={pledge.title} icon="bookmark-outline" />
              <InfoRow label="Due Date" value={pledge.dueDate} icon="calendar-outline" />
              <InfoRow label="Target Amount" value={`${pledge.currency}${pledge.targetAmount.toLocaleString()}`} icon="cash-outline" />
              {pledge.isPaid ? (
                <>
                  <InfoRow label="Amount Paid" value={`${pledge.currency}${pledge.paidAmount?.toLocaleString()}`} icon="checkmark-done-outline" />
                  <InfoRow label="Paid On" value={pledge.paidDate!} icon="time-outline" />
                </>
              ) : (
                <>
                  <InfoRow label="Amount Paid" value={`${pledge.currency}${paid.toLocaleString()}`} icon="checkmark-done-outline" />
                  <InfoRow label="Balance Remaining" value={`${pledge.currency}${(pledge.targetAmount - paid).toLocaleString()}`} icon="wallet-outline" />
                </>
              )}
            </Card>
          </Animated.View>

          {!pledge.isPaid && (
            <Animated.View 
              entering={FadeInDown.delay(280).duration(450)}
              style={[styles.paymentBox, { backgroundColor: colors.infoBg, borderColor: colors.info, borderRadius: radius.lg }]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Ionicons name="information-circle" size={20} color={colors.info} />
                <Text style={{ fontSize: 14, fontFamily: typography.fontFamily.bold, color: colors.info, marginLeft: 8 }}>
                  Payment Instructions
                </Text>
              </View>
              <Text style={{ fontSize: 13, fontFamily: typography.fontFamily.regular, color: colors.info, lineHeight: 20 }}>
                Payments can be made via bank transfer to the parish account or at the parish office. Please include your ID in the narration.
              </Text>
              <View style={styles.accountBox}>
                <Text style={{ fontSize: 11, color: colors.info, fontFamily: typography.fontFamily.bold, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.5 }}>Parish Account</Text>
                <Text style={{ fontSize: 15, color: colors.info, fontFamily: typography.fontFamily.bold, marginTop: 2 }}>0123456789 (GTBank)</Text>
              </View>
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.delay(350).duration(400)}>
            <Button
              label={pledge.isPaid ? "Back to Finance" : "Confirm Payment Made"}
              onPress={() => router.back()}
              fullWidth
              size="lg"
              variant={pledge.isPaid ? "primary" : "secondary"}
              style={{ marginTop: 20 }}
            />
          </Animated.View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 48 },
  hero: { margin: 20, padding: 24, alignItems: 'center', justifyContent: 'center' },
  heroIconCircle: { width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 20 },
  progressBox: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressBarBg: {
    height: 8,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  infoLabelGroup: { flexDirection: 'row', alignItems: 'center' },
  paymentBox: { padding: 16, borderWidth: 1, marginTop: 20 },
  accountBox: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
});
