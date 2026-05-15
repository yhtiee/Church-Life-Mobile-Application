import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MOCK_PLEDGES } from '@/constants/mockData';

export default function PledgeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, typography, radius } = useTheme();
  const router = useRouter();

  const pledge = MOCK_PLEDGES.find((p) => p.id === id) ?? MOCK_PLEDGES[0];

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
    <ScreenWrapper edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Amount Hero */}
        <LinearGradient
          colors={pledge.isPaid ? ['#2E7D32', '#4CAF50'] : ['#F57C00', '#FF9800']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { borderRadius: radius.lg }]}
        >
          <View style={styles.heroIconCircle}>
            <Ionicons 
              name={pledge.isPaid ? "checkmark-circle" : "time-outline"} 
              size={32} 
              color="#FFFFFF" 
            />
          </View>
          <Text style={{ fontSize: 12, fontFamily: typography.fontFamily.semiBold, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 12 }}>
            {pledge.isPaid ? 'Pledge Fulfilled' : 'Pledge Pending'}
          </Text>
          <Text style={{ fontSize: 32, fontFamily: typography.fontFamily.extraBold, color: '#FFFFFF', marginTop: 4 }}>
            {pledge.currency}{pledge.targetAmount.toLocaleString()}
          </Text>
          <Text style={{ fontSize: 15, fontFamily: typography.fontFamily.medium, color: '#FFFFFF', marginTop: 4 }}>
            {pledge.title}
          </Text>
        </LinearGradient>

        <View style={styles.content}>
          <Card elevation="sm" style={{ padding: 0, overflow: 'hidden' }}>
            <InfoRow label="Pledge Title" value={pledge.title} icon="bookmark-outline" />
            <InfoRow label="Due Date" value={pledge.dueDate} icon="calendar-outline" />
            <InfoRow label="Target Amount" value={`${pledge.currency}${pledge.targetAmount.toLocaleString()}`} icon="cash-outline" />
            {pledge.isPaid ? (
              <>
                <InfoRow label="Amount Paid" value={`${pledge.currency}${pledge.paidAmount?.toLocaleString()}`} icon="checkmark-done-outline" />
                <InfoRow label="Paid On" value={pledge.paidDate!} icon="time-outline" />
              </>
            ) : (
              <InfoRow label="Balance Remaining" value={`${pledge.currency}${pledge.targetAmount.toLocaleString()}`} icon="wallet-outline" />
            )}
          </Card>

          {!pledge.isPaid && (
            <View style={[styles.paymentBox, { backgroundColor: colors.infoBg, borderColor: colors.info, borderRadius: radius.md }]}>
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
                <Text style={{ fontSize: 11, color: colors.info, fontFamily: typography.fontFamily.semiBold, opacity: 0.7 }}>PARISH ACCOUNT</Text>
                <Text style={{ fontSize: 15, color: colors.info, fontFamily: typography.fontFamily.bold, marginTop: 2 }}>0123456789 (GTBank)</Text>
              </View>
            </View>
          )}

          <Button
            label={pledge.isPaid ? "Back to Finance" : "Confirm Payment Made"}
            onPress={() => router.back()}
            fullWidth
            size="lg"
            variant={pledge.isPaid ? "primary" : "secondary"}
            style={{ marginTop: 12 }}
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 48 },
  hero: { margin: 20, padding: 24, alignItems: 'center' },
  heroIconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  infoLabelGroup: { flexDirection: 'row', alignItems: 'center' },
  paymentBox: { padding: 16, borderWidth: 1, marginVertical: 20 },
  accountBox: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
});
