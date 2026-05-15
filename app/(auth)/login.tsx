import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LoginScreen() {
  const { colors, typography, radius } = useTheme();
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    setError('');
    const result = await login(email.trim().toLowerCase(), password);
    setLoading(false);
    if (!result.success) setError(result.error ?? 'Login failed.');
  };

  return (
    <ScreenWrapper edges={['left', 'right']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>

        {/* ── Gradient hero panel ── */}
        <LinearGradient
          colors={['#0A1929', '#1D3557', '#2A4A7F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { minHeight: SCREEN_HEIGHT * 0.30 }]}
        >
          {/* Back button */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Cross watermark */}
          <View style={styles.crossWrapper} pointerEvents="none">
            <View style={[styles.crossV, { backgroundColor: 'rgba(255,255,255,0.04)' }]} />
            <View style={[styles.crossH, { backgroundColor: 'rgba(255,255,255,0.04)' }]} />
          </View>

          {/* Logo + titles */}
          <View style={styles.heroContent}>
            <View style={styles.logoCircle}>
              <Image 
                source={require('@/assets/images/cross-dove-background.png')} 
                style={{ width: 56, height: 56 }}
                contentFit="contain"
              />
            </View>
            <Text style={{ fontFamily: typography.fontFamily.extraBold, fontSize: 28, color: '#FFFFFF', letterSpacing: -0.5 }}>
              Welcome Back
            </Text>
            <Text style={{ fontFamily: typography.fontFamily.regular, fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 6 }}>
              Sign in to your ChurchLife account
            </Text>
          </View>
        </LinearGradient>

        {/* ── Form area ── */}
        <ScrollView
          contentContainerStyle={[styles.scroll, { backgroundColor: colors.background }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Demo hint */}
          <View style={[styles.hintBox, { backgroundColor: colors.infoBg, borderColor: colors.info, borderRadius: radius.sm }]}>
            <Text style={{ fontSize: 12, color: colors.info, fontFamily: typography.fontFamily.regular, lineHeight: 18 }}>
              <Text style={{ fontFamily: typography.fontFamily.semiBold }}>Demo: </Text>
              admin@church.ng / admin{'  '}(Admin){'\n'}
              chidi@example.com / password{'  '}(Member)
            </Text>
          </View>

          {/* Error banner */}
          {!!error && (
            <View style={[styles.errorBox, { backgroundColor: colors.dangerBg, borderRadius: radius.sm }]}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
              <Text style={{ color: colors.danger, fontSize: 13, fontFamily: typography.fontFamily.regular, flex: 1, marginLeft: 8 }}>
                {error}
              </Text>
            </View>
          )}

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

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={{ fontSize: 14, fontFamily: typography.fontFamily.regular, color: colors.textSecondary }}>
              Don't have an account?{' '}
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
  // Hero panel
  hero: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 56,
    position: 'relative',
    overflow: 'hidden',
  },
  backBtn: {
    position: 'absolute',
    top: 42,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  crossWrapper: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crossV: { position: 'absolute', width: 40, top: 0, bottom: 0 },
  crossH: { position: 'absolute', height: 40, left: 0, right: 0 },
  heroContent: { alignItems: 'center', paddingTop: 8 },
  logoCircle: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  // Form area
  scroll: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40 },
  hintBox: { borderWidth: 1, padding: 12, marginBottom: 20 },
  errorBox: { flexDirection: 'row', alignItems: 'flex-start', padding: 12, marginBottom: 16 },
  forgotRow: { alignItems: 'flex-end', marginTop: -8, marginBottom: 24 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
});
