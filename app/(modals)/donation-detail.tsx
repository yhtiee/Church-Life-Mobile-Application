import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import GlobalLoader from '@/components/ui/GlobalLoader';
import { FinanaceService } from '@/lib/supabase/services/finance';
import { Gradients } from '@/constants/theme';

export default function DonationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, typography, radius } = useTheme();
  const { user } = useAuth();

  const [donation, setDonation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonation = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const service = new FinanaceService();
        const { data, error } = await service.fetchDonations(user.id);
        if (!error && data) {
          const found = data.find((d) => d.id === id);
          setDonation(found || null);
        } else {
          setDonation(null);
        }
      } catch (err) {
        setDonation(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDonation();
  }, [id, user?.id]);

  if (!loading && !donation) {
    return (
      <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
        <ScreenHeader title="Donation Details" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.textSecondary, fontFamily: typography.fontFamily.medium, fontSize: 16 }}>
            Donation record not found.
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  const InfoRow = ({ label, value, icon }: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap }) => (
    <View style={[styles.row, { borderBottomColor: colors.divider }]}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={18} color={colors.textMuted} style={styles.rowIcon} />
        <Text style={{ fontSize: 13, fontFamily: typography.fontFamily.regular, color: colors.textMuted }}>{label}</Text>
      </View>
      <Text style={{ fontSize: 13, fontFamily: typography.fontFamily.semiBold, color: colors.text }}>{value}</Text>
    </View>
  );

  return (
    <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
      <ScreenHeader title="Donation Details" />
      <View style={styles.scroll}>
        {/* Amount Hero Gradient */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <LinearGradient
            colors={Gradients.heroDark}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark" size={28} color={colors.success} />
            </View>
            <Text style={{ fontSize: 36, fontFamily: typography.fontFamily.extraBold, color: '#FFFFFF', marginTop: 14 }}>
              {donation?.currency || ''}{(donation?.amount || 0).toLocaleString()}
            </Text>
            <Text style={{ fontSize: 15, fontFamily: typography.fontFamily.medium, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
              {donation?.description || ''}
            </Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(450)}>
          <Card elevation="sm" style={{ margin: 20, padding: 0, overflow: 'hidden', borderRadius: radius.lg }}>
            <InfoRow label="Description" value={donation?.description || ''} icon="gift-outline" />
            <InfoRow label="Category" value={donation?.category || ''} icon="grid-outline" />
            <InfoRow label="Amount" value={`${donation?.currency || ''}${(donation?.amount || 0).toLocaleString()}`} icon="cash-outline" />
            <InfoRow label="Date" value={donation?.date || ''} icon="calendar-outline" />
            <InfoRow label="Status" value="Confirmed" icon="checkmark-circle-outline" />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(250).duration(400)} style={{ paddingHorizontal: 20, alignItems: 'center' }}>
          <Badge label="Transaction Confirmed ✓" variant="success" glow />
        </Animated.View>
      </View>
      <GlobalLoader visible={loading} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, paddingBottom: 48 },
  hero: { padding: 32, alignItems: 'center', justifyContent: 'center' },
  successIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(39, 174, 96, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: 16, 
    paddingVertical: 14, 
    borderBottomWidth: StyleSheet.hairlineWidth 
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    marginRight: 10,
  },
});
