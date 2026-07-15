import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useAlert } from '@/context/FeedbackContext';
import { useAuth } from '@/context/AuthContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { AuthService } from '@/lib/supabase/services/auth';
import {
  ADMIN_WHATSAPP,
  ADVERTISE_ENQUIRY_MESSAGE,
  buildWhatsAppUrl,
  normalizePhoneForWhatsApp,
} from '@/constants/contact';

const authService = new AuthService();

const WHATSAPP_GREEN = '#25D366';

const BENEFITS = [
  {
    icon: 'people-outline' as const,
    title: 'Reach the community',
    body: 'Your ad appears in the home feed seen by parishioners every day.',
  },
  {
    icon: 'heart-outline' as const,
    title: 'Support the parish',
    body: 'Advertising fees help sustain the parish and its ministries.',
  },
  {
    icon: 'chatbubble-ellipses-outline' as const,
    title: 'Simple setup',
    body: 'One quick chat with the admin and your promotion goes live.',
  },
];

export default function AdvertiseScreen() {
  const { colors, typography, radius } = useTheme();
  const { showAlert } = useAlert();
  const { user } = useAuth();
  const router = useRouter();

  // Route the enquiry to the user's parish admin; fall back to the app admin.
  const [adminPhone, setAdminPhone] = useState<string>(ADMIN_WHATSAPP);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user?.parishId) return;
      const { phone } = await authService.getParishAdminPhone(user.parishId);
      const normalized = normalizePhoneForWhatsApp(phone);
      if (active && normalized) setAdminPhone(normalized);
    })();
    return () => { active = false; };
  }, [user?.parishId]);

  const handleWhatsApp = async () => {
    const url = buildWhatsAppUrl(ADVERTISE_ENQUIRY_MESSAGE, adminPhone);
    try {
      await Linking.openURL(url);
    } catch {
      showAlert({
        title: 'Could Not Open WhatsApp',
        message: `Please message the admin directly on WhatsApp at +${adminPhone}.`,
        type: 'error',
      });
    }
  };

  return (
    <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
      <ScreenHeader title="Advertise With Us" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Intro */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={[styles.introCard, { backgroundColor: colors.surface, borderColor: '#D4AF37', borderRadius: radius.lg }]}
        >
          <View style={[styles.iconBadge, { backgroundColor: 'rgba(212,175,55,0.15)' }]}>
            <Ionicons name="megaphone" size={26} color="#D4AF37" />
          </View>
          <Text style={[styles.introTitle, { color: colors.text, fontFamily: typography.fontFamily.extraBold }]}>
            Promote your business here
          </Text>
          <Text style={[styles.introBody, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
            Interested in featuring your business, event, or service in the app? Let the admin know and
            they’ll help you get started.
          </Text>
        </Animated.View>

        {/* Benefits */}
        <View style={styles.benefits}>
          {BENEFITS.map((b, i) => (
            <Animated.View
              key={b.title}
              entering={FadeInDown.delay(120 + i * 80).duration(400)}
              style={[styles.benefitRow, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}
            >
              <View style={[styles.benefitIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name={b.icon} size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.benefitTitle, { color: colors.text, fontFamily: typography.fontFamily.semiBold }]}>
                  {b.title}
                </Text>
                <Text style={[styles.benefitBody, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
                  {b.body}
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Actions */}
        <Animated.View entering={FadeInDown.delay(380).duration(400)} style={styles.actions}>
          <Text style={[styles.helperText, { color: colors.textMuted, fontFamily: typography.fontFamily.regular }]}>
            Tapping below opens WhatsApp with a ready-made message to the admin.
          </Text>
          <TouchableOpacity
            onPress={handleWhatsApp}
            activeOpacity={0.85}
            style={[styles.whatsappBtn, { borderRadius: radius.lg }]}
          >
            <Ionicons name="logo-whatsapp" size={22} color="#FFFFFF" />
            <Text style={[styles.whatsappLabel, { fontFamily: typography.fontFamily.semiBold }]}>
              Chat with Admin on WhatsApp
            </Text>
          </TouchableOpacity>

          <Button
            label="Maybe Later"
            onPress={() => router.back()}
            variant="ghost"
            fullWidth
            size="md"
            style={{ marginTop: 12 }}
          />
        </Animated.View>

      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48 },
  introCard: { padding: 20, borderWidth: 1, alignItems: 'center' },
  iconBadge: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  introTitle: { fontSize: 20, textAlign: 'center', marginBottom: 8 },
  introBody: { fontSize: 14, lineHeight: 22, textAlign: 'center' },
  benefits: { gap: 10, marginTop: 24 },
  benefitRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    padding: 16, borderWidth: 1,
  },
  benefitIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  benefitTitle: { fontSize: 15, marginBottom: 3 },
  benefitBody: { fontSize: 13, lineHeight: 19 },
  actions: { marginTop: 32 },
  helperText: { fontSize: 13, textAlign: 'center', marginBottom: 14, lineHeight: 19 },
  whatsappBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    height: 58, backgroundColor: WHATSAPP_GREEN,
  },
  whatsappLabel: { fontSize: 17, color: '#FFFFFF', letterSpacing: 0.3 },
});
