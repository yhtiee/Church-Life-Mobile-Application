import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/FeedbackContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Gradients } from '@/constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LoginScreen() {
  const { colors, typography, radius } = useTheme();
  const { login } = useAuth();
  const router = useRouter();
  const showToast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      showToast('Please enter your email and password.', 'error');
      return;
    }
    setLoading(true);
    setError('');
    const result = await login(email.trim().toLowerCase(), password);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? 'Login failed.');
      showToast(result.error ?? 'Login failed.', 'error');
    } else {
      showToast('Logged in successfully!', 'success');
    }
  };

  return (
    <ScreenWrapper edges={['left', 'right']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>

        {/* ── Gradient hero panel ── */}
        <LinearGradient
          colors={Gradients.heroDark}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { minHeight: SCREEN_HEIGHT * 0.36 }]}
        >
          {/* Church image overlay */}
          <Image
            source={require('@/assets/images/church_exterior_hero.png')}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
          />
          {/* Dark overlay on image */}
          <LinearGradient
            colors={['rgba(4,10,20,0.7)', 'rgba(7,21,36,0.92)']}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Cross watermark */}
          <View style={styles.crossWrapper} pointerEvents="none">
            <View style={styles.crossV} />
            <View style={styles.crossH} />
          </View>

          {/* Back button */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Logo + titles */}
          <Animated.View entering={FadeIn.duration(600)} style={styles.heroContent}>
            <View style={styles.logoCircle}>
              <Image
                source={require('@/assets/images/cross-dove-background.png')}
                style={{ width: 56, height: 56 }}
                contentFit="contain"
              />
            </View>
            <Text style={{ fontFamily: typography.fontFamily.extraBold, fontSize: 30, color: '#FFFFFF', letterSpacing: -0.5 }}>
              Welcome Back
            </Text>
            <Text style={{ fontFamily: typography.fontFamily.regular, fontSize: 14, color: 'rgba(255,255,255,0.60)', marginTop: 6 }}>
              Sign in to your ChurchLife account
            </Text>
          </Animated.View>
        </LinearGradient>

        {/* ── Form area ── */}
        <ScrollView
          contentContainerStyle={[styles.scroll, { backgroundColor: colors.background }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Demo hint */}
          {/* <View style={[styles.hintBox, { backgroundColor: colors.infoBg, borderColor: colors.info + '55', borderRadius: radius.md }]}>
            <Ionicons name="information-circle-outline" size={15} color={colors.info} style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 12, color: colors.info, fontFamily: typography.fontFamily.regular, lineHeight: 18, flex: 1 }}>
              <Text style={{ fontFamily: typography.fontFamily.semiBold }}>Demo: </Text>
              admin@church.ng / admin (Admin){'   '}
              chidi@example.com / password (Member)
            </Text>
          </View> */}

          {/* Animated error banner */}
          {/* {!!error && (
            <Animated.View
              entering={SlideInDown.duration(300)}
              style={[styles.errorBox, { backgroundColor: colors.dangerBg, borderRadius: radius.md, borderLeftColor: colors.danger }]}
            >
              <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
              <Text style={{ color: colors.danger, fontSize: 13, fontFamily: typography.fontFamily.regular, flex: 1, marginLeft: 8 }}>
                {error}
              </Text>
            </Animated.View>
          )} */}

          {/* Fields */}
          <Input
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail-outline"
          />
          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            isPassword
            leftIcon="lock-closed-outline"
          />

          <TouchableOpacity style={styles.forgotRow}>
            <Text style={{ fontSize: 13, fontFamily: typography.fontFamily.medium, color: colors.primary }}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <Button label="Sign In" onPress={handleLogin} loading={loading} fullWidth size="lg" />

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={{ fontSize: 12, color: colors.textMuted, fontFamily: typography.fontFamily.regular, marginHorizontal: 12 }}>
              or
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={{ fontSize: 14, fontFamily: typography.fontFamily.regular, color: colors.textSecondary }}>
              {`Don’t have an account? `}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={{ fontSize: 14, fontFamily: typography.fontFamily.semiBold, color: colors.primary }}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 56,
    position: 'relative',
    overflow: 'hidden',
  },
  backBtn: {
    position: 'absolute', top: 44, left: 16,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },
  crossWrapper: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  crossV: { position: 'absolute', width: 40, top: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.04)' },
  crossH: { position: 'absolute', height: 40, left: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.04)' },
  heroContent: { alignItems: 'center', paddingTop: 8 },
  logoCircle: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  scroll: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40 },
  hintBox: { flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1, padding: 12, marginBottom: 20 },
  errorBox: { flexDirection: 'row', alignItems: 'flex-start', padding: 12, marginBottom: 16, borderLeftWidth: 3 },
  forgotRow: { alignItems: 'flex-end', marginTop: -4, marginBottom: 24 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 4 },
});
