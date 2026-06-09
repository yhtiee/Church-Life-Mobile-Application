import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useAuth, BirthdayMonth } from '@/context/AuthContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Gradients } from '@/constants/theme';
import { useUpdateUserProfileMutation } from '@/hooks/mutations/useProfiles';

const MONTH_NAMES: BirthdayMonth[] = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function EditBirthdayScreen() {
  const { colors, typography, radius } = useTheme();
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const updateProfileMutation = useUpdateUserProfileMutation(user?.id || '');

  const [month, setMonth] = useState<BirthdayMonth | ''>(user?.birthdayMonth ?? '');
  const [submitted, setSubmitted] = useState(false);

  const handleSave = async () => {
    if (!user?.id) return;
    try {
      await updateProfileMutation.mutateAsync({ birthdayMonth: month as BirthdayMonth });
      await updateUser({ birthdayMonth: month as BirthdayMonth });
      setSubmitted(true);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update birthday month');
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
            <Ionicons name="checkmark-circle" size={56} color={colors.success} />
          </Animated.View>
          <Text style={{ fontSize: 24, fontFamily: typography.fontFamily.extraBold, color: colors.text, marginTop: 24, textAlign: 'center' }}>
            Updated!
          </Text>
          <Text style={{ fontSize: 15, fontFamily: typography.fontFamily.regular, color: colors.textSecondary, marginTop: 10, textAlign: 'center', lineHeight: 24, paddingHorizontal: 12 }}>
            Your birthday month has been updated successfully to <Text style={{ fontFamily: typography.fontFamily.bold, color: colors.primary }}>{month}</Text>.
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
      <ScreenHeader title="Edit Birthday" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <Animated.View entering={FadeInDown.duration(400)}>
          <Text style={[styles.description, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
            Your parish uses this to celebrate birthdays and assign monthly duties. Please select your birth month below.
          </Text>
        </Animated.View>

        {/* 3-Column Month Grid Picker */}
        <View style={styles.grid}>
          {MONTH_NAMES.map((m, idx) => {
            const isSelected = month === m;
            return (
              <Animated.View 
                key={m} 
                entering={FadeInDown.delay(idx * 30).duration(350)}
                style={styles.gridCell}
              >
                <Card
                  elevation={isSelected ? "md" : "none"}
                  pressable
                  onPress={() => setMonth(m)}
                  gradient={isSelected ? Gradients.heroBlue : undefined}
                  style={[
                    styles.monthCard,
                    !isSelected && { backgroundColor: colors.surface, borderColor: colors.border }
                  ]}
                  padding={0}
                >
                  <View style={styles.cardInner}>
                    <Ionicons 
                      name="calendar" 
                      size={18} 
                      color={isSelected ? '#FFFFFF' : colors.textMuted} 
                    />
                    <Text style={[
                      styles.monthLabel, 
                      { 
                        fontFamily: typography.fontFamily.bold,
                        color: isSelected ? '#FFFFFF' : colors.text
                      }
                    ]}>
                      {m.substring(0, 3)}
                    </Text>
                    <Text style={[
                      styles.monthFullLabel, 
                      { 
                        fontFamily: typography.fontFamily.medium,
                        color: isSelected ? 'rgba(255,255,255,0.7)' : colors.textMuted
                      }
                    ]}>
                      {m}
                    </Text>
                  </View>
                </Card>
              </Animated.View>
            );
          })}
        </View>

        <Animated.View entering={FadeInDown.delay(380).duration(450)} style={styles.actions}>
          <Button
            label="Save Changes"
            onPress={handleSave}
            loading={updateProfileMutation.isPending}
            fullWidth
            size="lg"
            disabled={!month || month === user?.birthdayMonth}
            style={{ marginBottom: 12 }}
          />
          <Button
            label="Cancel"
            onPress={() => router.back()}
            variant="ghost"
            fullWidth
            size="md"
          />
        </Animated.View>

      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 48 },
  description: { fontSize: 14, lineHeight: 22, marginBottom: 24 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 32,
  },
  gridCell: {
    width: '33.33%',
    padding: 6,
  },
  monthCard: {
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    gap: 4,
  },
  monthLabel: {
    fontSize: 16,
    textTransform: 'uppercase',
  },
  monthFullLabel: {
    fontSize: 10,
  },
  actions: { marginTop: 'auto' },
  successWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  successCircle: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
});
