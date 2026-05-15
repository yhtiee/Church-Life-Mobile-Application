import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function EditEmailScreen() {
  const { colors, typography, radius } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <ScreenWrapper edges={['left', 'right', 'bottom']}>
        <View style={styles.successWrapper}>
          <View style={[styles.successCircle, { backgroundColor: colors.successBg }]}>
            <Ionicons name="mail-unread" size={48} color={colors.success} />
          </View>
          <Text style={{ fontSize: 22, fontFamily: typography.fontFamily.extraBold, color: colors.text, marginTop: 20, textAlign: 'center' }}>
            Verification Sent!
          </Text>
          <Text style={{ fontSize: 14, fontFamily: typography.fontFamily.regular, color: colors.textSecondary, marginTop: 10, textAlign: 'center', lineHeight: 22 }}>
            We've sent a verification link to <Text style={{ fontFamily: typography.fontFamily.semiBold }}>{newEmail}</Text>. Please check your inbox to confirm the change.
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
        
        <View style={[styles.infoBox, { backgroundColor: colors.surfaceMuted, borderColor: colors.border, borderRadius: radius.md }]}>
          <Text style={{ fontSize: 12, fontFamily: typography.fontFamily.semiBold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>
            Current Email
          </Text>
          <Text style={{ fontSize: 16, fontFamily: typography.fontFamily.bold, color: colors.text, marginTop: 4 }}>
            {user?.email ?? 'Not set'}
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="New Email Address"
            placeholder="e.g., your.name@example.com"
            value={newEmail}
            onChangeText={setNewEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Current Password"
            placeholder="Enter password to verify"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.actions}>
          <Button
            label="Update Email"
            onPress={() => setSubmitted(true)}
            fullWidth
            size="lg"
            disabled={!newEmail || !password}
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
  infoBox: { padding: 16, borderWidth: 1, marginBottom: 24 },
  form: { gap: 16, marginBottom: 32 },
  actions: { marginTop: 'auto' },
  successWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  successCircle: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
});
