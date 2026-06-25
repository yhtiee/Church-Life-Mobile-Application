import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useAuth } from '@/context/AuthContext';
import { supaBaseClient } from '@/lib/supabase/client';

export default function ChangePasswordScreen() {
  const { colors, typography, radius } = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleUpdatePassword = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      // 1. Re-authenticate user with current password
      const { error: authError } = await supaBaseClient.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (authError) throw authError;

      // 2. Update password in Supabase Auth
      const { error: updateAuthError } = await supaBaseClient.auth.updateUser({
        password: newPassword,
      });
      if (updateAuthError) throw updateAuthError;

      setSubmitted(true);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'transparent' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    
    if (score <= 1) return { score, label: 'Weak', color: colors.danger }; 
    if (score === 2) return { score, label: 'Fair', color: '#FB8C00' }; 
    if (score === 3) return { score, label: 'Good', color: colors.accent }; 
    return { score, label: 'Strong', color: colors.success }; 
  };

  const strength = getPasswordStrength(newPassword);
  const isValid = currentPassword && newPassword && newPassword.length >= 8 && newPassword === confirmPassword;

  if (submitted) {
    return (
      <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.successWrapper}>
          <Animated.View 
            entering={ZoomIn.springify().damping(12)}
            style={[styles.successCircle, { backgroundColor: colors.successBg }]}
          >
            <Ionicons name="shield-checkmark" size={56} color={colors.success} />
          </Animated.View>
          <Text style={{ fontSize: 24, fontFamily: typography.fontFamily.extraBold, color: colors.text, marginTop: 24, textAlign: 'center' }}>
            Password Updated
          </Text>
          <Text style={{ fontSize: 15, fontFamily: typography.fontFamily.regular, color: colors.textSecondary, marginTop: 10, textAlign: 'center', lineHeight: 24, paddingHorizontal: 12 }}>
            Your account password has been successfully changed. You will use this new password next time you log in.
          </Text>
          <Button
            label="Back to Profile"
            onPress={() => router.back()}
            fullWidth
            size="lg"
            style={{ marginTop: 32 }}
          />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
      <ScreenHeader title="Change Password" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scroll} 
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={true}
          keyboardShouldPersistTaps="handled"
        >
        
        <Animated.View entering={FadeInDown.duration(400)}>
          <Text style={[styles.description, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
            Ensure your new password is at least 8 characters long and includes a mix of letters and numbers.
          </Text>
        </Animated.View>

        <View style={styles.form}>
          <Animated.View entering={FadeInDown.delay(80).duration(450)}>
            <View>
              <Label label="Current Password" required />
              <Input
                placeholder="Enter current password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                isPassword
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(140).duration(450)}>
            <View>
              <Label label="New Password" required />
              <Input
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={setNewPassword}
                isPassword
              />
            </View>
          </Animated.View>

          {/* Password Strength Indicator */}
          {newPassword.length > 0 && (
            <Animated.View entering={FadeInDown.duration(300)} style={styles.strengthContainer}>
              <View style={styles.strengthTextRow}>
                <Text style={{ fontSize: 12, fontFamily: typography.fontFamily.medium, color: colors.textSecondary }}>
                  Password Strength:
                </Text>
                <Text style={{ fontSize: 12, fontFamily: typography.fontFamily.bold, color: strength.color }}>
                  {strength.label}
                </Text>
              </View>
              <View style={[styles.strengthBarBg, { backgroundColor: colors.border, borderRadius: radius.full }]}>
                <View 
                  style={[
                    styles.strengthBarFill, 
                    { 
                      width: `${(strength.score / 4) * 100}%`, 
                      backgroundColor: strength.color,
                      borderRadius: radius.full 
                    }
                  ]} 
                />
              </View>
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.delay(200).duration(450)}>
            <View>
              <Label label="Confirm New Password" required />
              <Input
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                isPassword
                error={confirmPassword && confirmPassword !== newPassword ? "Passwords do not match" : undefined}
              />
            </View>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(280).duration(450)} style={styles.actions}>
          <Button
            label="Update Password"
            onPress={handleUpdatePassword}
            loading={loading}
            fullWidth
            size="lg"
            disabled={!isValid || loading}
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
        </Animated.View>

      </ScrollView>
    </KeyboardAvoidingView>
  </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 48 },
  description: { fontSize: 14, lineHeight: 22, marginBottom: 20 },
  form: { gap: 4, marginBottom: 24 },
  strengthContainer: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  strengthTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  strengthBarBg: {
    height: 6,
    width: '100%',
    overflow: 'hidden',
  },
  strengthBarFill: {
    height: '100%',
  },
  actions: { marginTop: 'auto' },
  successWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  successCircle: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
});
