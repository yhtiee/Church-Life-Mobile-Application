import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const INITIAL_HISTORY = "Our parish was founded in 1952 by Father James O'Connell. It began as a small wooden structure serving 20 families in the local community. Over the decades, it has grown into a vibrant spiritual hub for over 2,000 parishioners, known for its dedication to community service and youth development.";

export default function EditParishHistoryModal() {
  const { colors, typography, radius } = useTheme();
  const router = useRouter();

  const [history, setHistory] = useState(INITIAL_HISTORY);

  const handleSave = () => {
    Alert.alert('Success', 'Parish history updated successfully.');
    router.back();
  };

  const handleChangePhoto = () => {
    Alert.alert('Upload Photo', 'Photo library access coming soon.');
  };

  return (
    <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
      <ScreenHeader title="Edit History" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Image Preview Area */}
          <Animated.View entering={FadeInDown.delay(100).duration(450)} style={styles.imageSection}>
            <Text style={[styles.label, { color: colors.textSecondary, fontFamily: typography.fontFamily.bold }]}>
              Parish Cover Photo
            </Text>
            <View style={[styles.imageCard, { borderRadius: radius.lg, overflow: 'hidden' }]}>
              <Image
                source={require('@/assets/images/church_exterior_hero.png')}
                style={StyleSheet.absoluteFillObject}
                contentFit="cover"
              />
              <LinearGradient
                colors={['rgba(7,21,36,0.2)', 'rgba(7,21,36,0.6)']}
                style={StyleSheet.absoluteFillObject}
              />
              <TouchableOpacity 
                onPress={handleChangePhoto}
                activeOpacity={0.85} 
                style={styles.imageOverlayBtn}
              >
                <View style={[styles.cameraCircle, { backgroundColor: colors.surface }]}>
                  <Ionicons name="camera" size={20} color={colors.primary} />
                </View>
                <Text style={[styles.cameraText, { fontFamily: typography.fontFamily.bold }]}>
                  Change Cover Photo
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Text Area Input */}
          <Animated.View entering={FadeInDown.delay(180).duration(450)}>
            <Input
              label="Parish Story"
              placeholder="Type the parish history here..."
              value={history}
              onChangeText={setHistory}
              multiline
              numberOfLines={6}
              style={styles.textArea}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(260).duration(450)}>
            <Button 
              label="Save Changes"
              onPress={handleSave}
              fullWidth
              size="lg"
              style={{ marginTop: 16 }}
            />
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 60 },
  header: { marginBottom: 24 },
  title: { fontSize: 24 },
  subtitle: { fontSize: 14, marginTop: 4, lineHeight: 20 },
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
  },
  cameraText: {
    fontSize: 13,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  textArea: {
    height: 160,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
});
