import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ChangePasswordScreen() {
  const { colors, typography, radius } = useTheme();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isValid = currentPassword && newPassword && newPassword === confirmPassword;

  if (submitted) {
    return (
      <ScreenWrapper edges={['left', 'right', 'bottom']}>
        <View style={styles.successWrapper}>
          <View style={[styles.successCircle, { backgroundColor: colors.successBg }]}>
            <Ionicons name="shield-checkmark" size={56} color={colors.success} />
          </View>
          <Text style={{ fontSize: 22, fontFamily: typography.fontFamily.extraBold, color: colors.text, marginTop: 20, textAlign: 'center' }}>
            Password Updated
          </Text>
          <Text style={{ fontSize: 14, fontFamily: typography.fontFamily.regular, color: colors.textSecondary, marginTop: 10, textAlign: 'center', lineHeight: 22 }}>
            Your account password has been successfully changed. You will use this new password next time you log in.
          </Text>
          <Button
            label="Back to Profile"
            onPress={() => router.back()}
            fullWidth
            size="lg"
            style={{ marginTop: 28 }}
          />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <Text style={[styles.description, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
          Ensure your new password is at least 8 characters long and includes a mix of letters and numbers.
        </Text>

        <View style={styles.form}>
          <Input
            label="Current Password"
            placeholder="Enter current password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
          />
          <Input
            label="New Password"
            placeholder="Enter new password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <Input
            label="Confirm New Password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            error={confirmPassword && confirmPassword !== newPassword ? "Passwords do not match" : undefined}
          />
        </View>

        <View style={styles.actions}>
          <Button
            label="Update Password"
            onPress={() => setSubmitted(true)}
            fullWidth
            size="lg"
            disabled={!isValid}
            style={{ marginBottom: 12 }}
          />
          <Button
            label="Cancel"
            onPress={() => router.back()}
            variant="ghost"
            fullWidth
            size="md"
          />
        </View>

      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48 },
  description: { fontSize: 14, lineHeight: 22, marginBottom: 24 },
  form: { gap: 16, marginBottom: 32 },
  actions: { marginTop: 'auto' },
  successWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  successCircle: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
});
