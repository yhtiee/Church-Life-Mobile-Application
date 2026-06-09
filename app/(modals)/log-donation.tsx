import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LogDonationModal() {
  const { colors, typography, radius } = useTheme();
  const router = useRouter();

  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Sunday Offering');
  const [method, setMethod] = useState('Cash');

  const handleSave = () => {
    if (!amount || !name) {
      Alert.alert('Missing Info', 'Please provide a name and amount.');
      return;
    }
    Alert.alert('Success', 'Donation logged successfully.');
    router.back();
  };

  return (
    <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
      <ScreenHeader title="Log Donation" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.form}>
          <Animated.View entering={FadeInDown.delay(100).duration(450)}>
            <Input
              label="Parishioner Name"
              placeholder="e.g. John Doe"
              value={name}
              onChangeText={setName}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(180).duration(450)}>
            <Input
              label="Amount (₦)"
              placeholder="0.00"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              style={{ fontSize: 20, fontFamily: typography.fontFamily.bold }}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(260).duration(450)} style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary, fontFamily: typography.fontFamily.bold }]}>Category</Text>
            <View style={styles.pickerRow}>
              {['Sunday Offering', 'Harvest', 'Tithe'].map((cat) => {
                const isSelected = category === cat;
                return (
                  <TouchableOpacity 
                    key={cat}
                    onPress={() => setCategory(cat)}
                    activeOpacity={0.8}
                    style={[
                      styles.chip, 
                      { 
                        backgroundColor: isSelected ? colors.primary : colors.surfaceMuted, 
                        borderRadius: radius.full,
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderWidth: StyleSheet.hairlineWidth,
                      }
                    ]}
                  >
                    <Text style={{ color: isSelected ? '#FFFFFF' : colors.textSecondary, fontSize: 12, fontFamily: typography.fontFamily.bold }}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(320).duration(450)} style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary, fontFamily: typography.fontFamily.bold }]}>Payment Method</Text>
            <View style={styles.pickerRow}>
              {['Cash', 'Check'].map((m) => {
                const isSelected = method === m;
                return (
                  <TouchableOpacity 
                    key={m}
                    onPress={() => setMethod(m)}
                    activeOpacity={0.8}
                    style={[
                      styles.chip, 
                      { 
                        backgroundColor: isSelected ? colors.primary : colors.surfaceMuted, 
                        borderRadius: radius.full, 
                        flex: 1, 
                        alignItems: 'center',
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderWidth: StyleSheet.hairlineWidth,
                      }
                    ]}
                  >
                    <Text style={{ color: isSelected ? '#FFFFFF' : colors.textSecondary, fontSize: 12, fontFamily: typography.fontFamily.bold }}>
                      {m}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(380).duration(450)}>
          <Button 
            label="Record Donation"
            onPress={handleSave}
            fullWidth
            size="lg"
          />
        </Animated.View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 60 },
  header: { marginBottom: 24 },
  title: { fontSize: 24 },
  subtitle: { fontSize: 14, marginTop: 4, lineHeight: 20 },
  form: { gap: 18, marginBottom: 32 },
  inputGroup: { gap: 8 },
  label: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, marginLeft: 4 },
  pickerRow: { flexDirection: 'row', gap: 10 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, justifyContent: 'center', alignItems: 'center' },
});
