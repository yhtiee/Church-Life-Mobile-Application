import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useParishQuery } from '@/hooks/queries/useParishes';
import { useUpdateParishMutation } from '@/hooks/mutations/useParishes';
import { Label } from '@/components/ui/Label';

export default function EditParishHistoryModal() {
  const { colors, typography, radius } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const parishId = user?.parishId;

  const { data: parishData, isLoading } = useParishQuery(parishId || '');
  const updateParishMutation = useUpdateParishMutation();

  const [patron, setPatron] = useState('');
  const [founded, setFounded] = useState('');
  const [bishop, setBishop] = useState('');
  const [parishPriest, setParishPriest] = useState('');
  const [brief, setBrief] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (parishData) {
      setPatron(parishData.patron || '');
      setFounded(parishData.founded || '');
      setBishop(parishData.bishop || '');
      setParishPriest(parishData.parish_priest || '');
      setBrief(parishData.brief || '');
      setImageUrl(parishData.image_url || '');
    }
  }, [parishData]);

  const handleSave = async () => {
    if (!parishId) {
      Alert.alert('Error', 'No parish assigned to your account.');
      return;
    }
    if (!patron.trim() || !founded.trim() || !bishop.trim() || !parishPriest.trim() || !brief.trim()) {
      Alert.alert('Missing Info', 'Please fill in all fields.');
      return;
    }

    try {
      await updateParishMutation.mutateAsync({
        parishId,
        updates: {
          patron,
          founded,
          bishop,
          parish_priest: parishPriest,
          brief,
          image_url: imageUrl || null,
        },
      });
      Alert.alert('Success', 'Parish history updated successfully.');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update parish history.');
    }
  };

  if (isLoading) {
    return (
      <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
        <ScreenHeader title="Edit History" />
        <View style={[styles.centered, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 12, color: colors.textSecondary, fontFamily: typography.fontFamily.medium }}>
            Loading parish details...
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
      <ScreenHeader title="Edit History" />
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

          {/* Cover Photo */}
          <Animated.View entering={FadeInDown.delay(100).duration(450)} style={styles.imageSection}>
            <Text style={[styles.label, { color: colors.textSecondary, fontFamily: typography.fontFamily.bold }]}>
              Parish Cover Photo
            </Text>
            <View style={[styles.imageCard, { borderRadius: radius.lg, overflow: 'hidden' }]}>
              <Image
                source={imageUrl ? { uri: imageUrl } : require('@/assets/images/church_exterior_hero.png')}
                style={StyleSheet.absoluteFillObject}
                contentFit="cover"
              />
              <LinearGradient
                colors={['rgba(7,21,36,0.2)', 'rgba(7,21,36,0.6)']}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.imageOverlayBtn}>
                <View style={[styles.cameraCircle, { backgroundColor: colors.surface }]}>
                  <Ionicons name="image-outline" size={20} color={colors.primary} />
                </View>
                <Text style={[styles.cameraText, { fontFamily: typography.fontFamily.bold }]}>
                  Cover Image Preview
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Form Fields */}
          <Animated.View entering={FadeInDown.delay(150).duration(450)} style={styles.form}>

            <View>
              <Label label="Patron Saint / Name" required />
              <Input
                placeholder="e.g. St. Patrick"
                value={patron}
                onChangeText={setPatron}
              />
            </View>

            <View>
              <Label label="Founded Year" required />
              <Input
                placeholder="e.g. 1952"
                value={founded}
                onChangeText={setFounded}
                keyboardType="number-pad"
              />
            </View>

            <View>
              <Label label="Bishop Name" required />
              <Input
                placeholder="e.g. Most Rev. Ignatius Kaigama"
                value={bishop}
                onChangeText={setBishop}
              />
            </View>

            <View>
              <Label label="Parish Priest Name" required />
              <Input
                placeholder="e.g. Rev. Fr. Emmanuel Okafor"
                value={parishPriest}
                onChangeText={setParishPriest}
              />
            </View>

            <View>
              <Label label="Cover Image URL" />
              <Input
                placeholder="https://example.com/church.png (optional)"
                value={imageUrl}
                onChangeText={setImageUrl}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View>
              <Label label="Our Story / History Brief" required />
              <Input
                placeholder="Type the parish history here..."
                value={brief}
                onChangeText={setBrief}
                multiline
                numberOfLines={6}
                style={styles.textArea}
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(260).duration(450)}>
            <Button
              label="Save Changes"
              onPress={handleSave}
              fullWidth
              size="lg"
              loading={updateParishMutation.isPending}
              style={{ marginTop: 24 }}
            />
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 60 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  imageSection: {
    marginBottom: 24,
  },
  imageCard: {
    height: 180,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  imageOverlayBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cameraCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  cameraText: {
    fontSize: 13,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  form: {
    gap: 16,
  },
  textArea: {
    height: 160,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
});
