import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const { typography } = useTheme();

  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(40);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={['#0A1929', '#1D3557', '#2A4A7F']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Background cross watermark */}
      <View style={styles.crossWrapper} pointerEvents="none">
        <View style={[styles.crossV, { backgroundColor: 'rgba(255,255,255,0.04)' }]} />
        <View style={[styles.crossH, { backgroundColor: 'rgba(255,255,255,0.04)' }]} />
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Logo / Official Icon */}
        <View style={styles.logoCircle}>
          <Image 
            source={require('@/assets/images/cross-dove-background.png')} 
            style={{ width: 80, height: 80 }}
            contentFit="contain"
          />
        </View>

        <Text style={[styles.appName, { fontFamily: typography.fontFamily.extraBold }]}>
          ChurchLife
        </Text>
        <Text style={[styles.tagline, { fontFamily: typography.fontFamily.regular }]}>
          One Parish. One Family. One Faith.
        </Text>
      </Animated.View>

      {/* CTAs */}
      <Animated.View style={[styles.ctas, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: '#D4AF37' }]}
          onPress={() => router.push('/(auth)/register')}
          activeOpacity={0.85}
        >
          <Text style={[styles.primaryBtnText, { fontFamily: typography.fontFamily.bold }]}>
            Create Account
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.85}
        >
          <Text style={[styles.secondaryBtnText, { fontFamily: typography.fontFamily.semiBold }]}>
            Sign In
          </Text>
        </TouchableOpacity>

        <Text style={[styles.footer, { fontFamily: typography.fontFamily.regular }]}>
          A Catholic Parish Community App
        </Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  crossWrapper: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  crossV: { position: 'absolute', width: 60, height: height },
  crossH: { position: 'absolute', width: width, height: 60 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  logoCircle: { width: 100, height: 100, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  appName: { fontSize: 40, color: '#FFFFFF', letterSpacing: -0.5, textAlign: 'center' },
  tagline: { fontSize: 15, color: 'rgba(255,255,255,0.65)', marginTop: 10, textAlign: 'center', lineHeight: 22 },
  featureRow: { flexDirection: 'row', marginTop: 40, gap: 10 },
  featureChip: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, gap: 6 },
  featureLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
  ctas: { paddingHorizontal: 32, paddingBottom: 52 },
  primaryBtn: { height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  primaryBtnText: { fontSize: 16, color: '#1D3557', letterSpacing: 0.3 },
  secondaryBtn: { height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)', marginBottom: 24 },
  secondaryBtnText: { fontSize: 16, color: '#FFFFFF' },
  footer: { fontSize: 12, color: 'rgba(255,255,255,0.35)', textAlign: 'center' },
});
