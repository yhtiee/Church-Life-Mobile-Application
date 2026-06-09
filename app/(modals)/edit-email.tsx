import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useUpdateUserProfileMutation } from '@/hooks/mutations/useProfiles';
import { supaBaseClient } from '@/lib/supabase/client';

export default function EditEmailScreen() {
  const { colors, typography, radius } = useTheme();
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const updateProfileMutation = useUpdateUserProfileMutation(user?.id || '');

  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleUpdateEmail = async () => {
    if (!user?.email || !user?.id) return;
    setLoading(true);
    try {
      // 1. Re-authenticate user
      const { error: authError } = await supaBaseClient.auth.signInWithPassword({
        email: user.email,
        password: password,
      });
      if (authError) throw authError;

      // 2. Update email in Supabase Auth
      const { error: updateAuthError } = await supaBaseClient.auth.updateUser({
        email: newEmail,
      });
      if (updateAuthError) throw updateAuthError;

      // 3. Update email in profiles table
      await updateProfileMutation.mutateAsync({ email: newEmail });

      // 4. Update local AuthContext state
      await updateUser({ email: newEmail });

      setSubmitted(true);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update email address');
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
            <Ionicons name="mail-unread" size={48} color={colors.success} />
          </Animated.View>
          <Text style={{ fontSize: 24, fontFamily: typography.fontFamily.extraBold, color: colors.text, marginTop: 24, textAlign: 'center' }}>
            Verification Sent!
          </Text>
          <Text style={{ fontSize: 15, fontFamily: typography.fontFamily.regular, color: colors.textSecondary, marginTop: 10, textAlign: 'center', lineHeight: 24, paddingHorizontal: 12 }}>
            {`We’ve sent a verification link to `}<Text style={{ fontFamily: typography.fontFamily.bold, color: colors.primary }}>{newEmail}</Text>{`. Please check your inbox to confirm the change.`}
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
      <ScreenHeader title="Edit Email" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <Animated.View 
          entering={FadeInDown.duration(400)}
          style={[styles.infoBox, { backgroundColor: colors.surfaceMuted, borderColor: colors.border, borderRadius: radius.lg }]}
        >
          <Text style={{ fontSize: 12, fontFamily: typography.fontFamily.bold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Current Email
          </Text>
          <Text style={{ fontSize: 16, fontFamily: typography.fontFamily.bold, color: colors.text, marginTop: 6 }}>
            {user?.email ?? 'Not set'}
          </Text>
        </Animated.View>

        <View style={styles.form}>
          <Animated.View entering={FadeInDown.delay(100).duration(450)}>
            <Input
              label="New Email Address"
              placeholder="e.g., your.name@example.com"
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(180).duration(450)}>
            <Input
              label="Current Password"
              placeholder="Enter password to verify"
              value={password}
              onChangeText={setPassword}
              isPassword
            />
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(260).duration(450)} style={styles.actions}>
          <Button
            label="Update Email"
            onPress={handleUpdateEmail}
            loading={loading}
            fullWidth
            size="lg"
            disabled={!newEmail || !password || loading}
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
