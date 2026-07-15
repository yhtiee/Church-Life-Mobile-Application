import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useUpdateUserProfileMutation } from '@/hooks/mutations/useProfiles';
import { normalizePhoneForWhatsApp } from '@/constants/contact';

export default function EditPhoneScreen() {
  const { colors, typography, radius } = useTheme();
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const updateProfileMutation = useUpdateUserProfileMutation(user?.id || '');

  const [newPhone, setNewPhone] = useState(user?.phoneNumber ?? '');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleUpdatePhone = async () => {
    if (!user?.id) return;
    const trimmed = newPhone.trim();
    if (!normalizePhoneForWhatsApp(trimmed)) {
      Alert.alert('Invalid Number', 'Please enter a valid phone number.');
      return;
    }
    setLoading(true);
    try {
      // Persist to the profiles table, then sync local AuthContext state.
      await updateProfileMutation.mutateAsync({ phoneNumber: trimmed });
      await updateUser({ phoneNumber: trimmed });
      setSubmitted(true);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update phone number');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.successWrapper}>
          <Animated.View
            entering={ZoomIn.springify().damping(12)}
            style={[styles.successCircle, { backgroundColor: colors.successBg }]}
          >
            <Ionicons name="call" size={48} color={colors.success} />
          </Animated.View>
          <Text style={{ fontSize: 24, fontFamily: typography.fontFamily.extraBold, color: colors.text, marginTop: 24, textAlign: 'center' }}>
            Phone Number Updated
          </Text>
          <Text style={{ fontSize: 15, fontFamily: typography.fontFamily.regular, color: colors.textSecondary, marginTop: 10, textAlign: 'center', lineHeight: 24, paddingHorizontal: 12 }}>
            {'Your contact number is now '}<Text style={{ fontFamily: typography.fontFamily.bold, color: colors.primary }}>{newPhone.trim()}</Text>{'.'}
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
      <ScreenHeader title="Edit Phone Number" />
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

          <Animated.View
            entering={FadeInDown.duration(400)}
            style={[styles.infoBox, { backgroundColor: colors.surfaceMuted, borderColor: colors.border, borderRadius: radius.lg }]}
          >
            <Text style={{ fontSize: 12, fontFamily: typography.fontFamily.bold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Current Phone Number
            </Text>
            <Text style={{ fontSize: 16, fontFamily: typography.fontFamily.bold, color: colors.text, marginTop: 6 }}>
              {user?.phoneNumber ?? 'Not set'}
            </Text>
          </Animated.View>

          <View style={styles.form}>
            <Animated.View entering={FadeInDown.delay(100).duration(450)}>
              <View>
                <Label label="New Phone Number" required />
                <Input
                  placeholder="e.g. 0803 123 4567"
                  value={newPhone}
                  onChangeText={setNewPhone}
                  keyboardType="phone-pad"
                  leftIcon="call-outline"
                />
              </View>
            </Animated.View>
          </View>

          <Animated.View entering={FadeInDown.delay(200).duration(450)} style={styles.actions}>
            <Button
              label="Update Phone Number"
              onPress={handleUpdatePhone}
              loading={loading}
              fullWidth
              size="lg"
              disabled={!newPhone.trim() || newPhone.trim() === (user?.phoneNumber ?? '') || loading}
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
  infoBox: { padding: 16, borderWidth: 1, marginBottom: 24 },
  form: { gap: 4, marginBottom: 24 },
  actions: { marginTop: 'auto' },
  successWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  successCircle: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
});
