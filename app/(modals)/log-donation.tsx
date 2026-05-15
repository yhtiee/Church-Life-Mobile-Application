import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';

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
    <ScreenWrapper edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text, fontFamily: typography.fontFamily.extraBold }]}>
            Log Offline Donation
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
            Record cash or check payments for bookkeeping.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary, fontFamily: typography.fontFamily.semiBold }]}>Parishioner Name</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: colors.surfaceMuted, color: colors.text, borderRadius: radius.md, fontFamily: typography.fontFamily.medium }]}
              placeholder="e.g. John Doe"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary, fontFamily: typography.fontFamily.semiBold }]}>{`Amount (₦)`}</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: colors.surfaceMuted, color: colors.text, borderRadius: radius.md, fontFamily: typography.fontFamily.extraBold, fontSize: 20 }]}
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary, fontFamily: typography.fontFamily.semiBold }]}>Category</Text>
            <View style={styles.pickerRow}>
              {['Sunday Offering', 'Harvest', 'Tithe'].map((cat) => (
                <TouchableOpacity 
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.chip, 
                    { backgroundColor: category === cat ? colors.primary : colors.surfaceMuted, borderRadius: radius.sm }
                  ]}
                >
                  <Text style={{ color: category === cat ? '#FFFFFF' : colors.textSecondary, fontSize: 12, fontFamily: typography.fontFamily.semiBold }}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary, fontFamily: typography.fontFamily.semiBold }]}>Payment Method</Text>
            <View style={styles.pickerRow}>
              {['Cash', 'Check'].map((m) => (
                <TouchableOpacity 
                  key={m}
                  onPress={() => setMethod(m)}
                  style={[
                    styles.chip, 
                    { backgroundColor: method === m ? colors.primary : colors.surfaceMuted, borderRadius: radius.sm, flex: 1, alignItems: 'center' }
                  ]}
                >
                  <Text style={{ color: method === m ? '#FFFFFF' : colors.textSecondary, fontSize: 12, fontFamily: typography.fontFamily.semiBold }}>
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.saveBtn, { backgroundColor: colors.primary, borderRadius: radius.md }]}
          onPress={handleSave}
        >
          <Text style={[styles.saveBtnText, { fontFamily: typography.fontFamily.bold }]}>Record Donation</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 24, paddingBottom: 60 },
  header: { marginBottom: 32 },
  title: { fontSize: 24 },
  subtitle: { fontSize: 14, marginTop: 4 },
  form: { gap: 24, marginBottom: 40 },
  inputGroup: { gap: 8 },
  label: { fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { height: 56, paddingHorizontal: 16 },
  pickerRow: { flexDirection: 'row', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 10 },
  saveBtn: { height: 56, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  saveBtnText: { color: '#FFFFFF', fontSize: 16 },
});
