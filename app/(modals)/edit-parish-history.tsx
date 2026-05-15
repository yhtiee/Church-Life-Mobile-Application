import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';

const INITIAL_HISTORY = "Our parish was founded in 1952 by Father James O'Connell. It began as a small wooden structure serving 20 families in the local community. Over the decades, it has grown into a vibrant spiritual hub for over 2,000 parishioners, known for its dedication to community service and youth development.";

export default function EditParishHistoryModal() {
  const { colors, typography, radius } = useTheme();
  const router = useRouter();

  const [history, setHistory] = useState(INITIAL_HISTORY);

  const handleSave = () => {
    Alert.alert('Success', 'Parish history updated successfully.');
    router.back();
  };

  return (
    <ScreenWrapper edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text, fontFamily: typography.fontFamily.extraBold }]}>
              Edit Parish History
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
              This content appears on the "About Parish" section for all users.
            </Text>
          </View>

          <View style={[styles.inputContainer, { backgroundColor: colors.surfaceMuted, borderRadius: radius.lg, borderColor: colors.border }]}>
            <TextInput 
              style={[styles.input, { color: colors.text, fontFamily: typography.fontFamily.regular }]}
              multiline
              value={history}
              onChangeText={setHistory}
              placeholder="Type the parish history here..."
              placeholderTextColor={colors.textMuted}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: colors.primary, borderRadius: radius.md }]}
            onPress={handleSave}
          >
            <Text style={{ color: '#FFFFFF', fontFamily: typography.fontFamily.bold, fontSize: 16 }}>Save Changes</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 24, paddingBottom: 60 },
  header: { marginBottom: 32 },
  title: { fontSize: 24 },
  subtitle: { fontSize: 14, marginTop: 4, lineHeight: 20 },
  inputContainer: {
    padding: 16,
    borderWidth: 1,
    minHeight: 300,
    marginBottom: 40,
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  saveBtn: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
});
