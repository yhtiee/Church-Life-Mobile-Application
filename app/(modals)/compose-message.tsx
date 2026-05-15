import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { AudienceSelector } from '@/components/admin/AudienceSelector';

export default function ComposeMessageModal() {
  const { colors, typography, radius } = useTheme();
  const router = useRouter();

  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [messageType, setMessageType] = useState<'Standard' | 'Urgent'>('Standard');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSend = () => {
    if (selectedGroups.length === 0 || !body) {
      Alert.alert('Missing Info', 'Please select at least one group and type a message.');
      return;
    }
    Alert.alert('Success', 'Message broadcasted successfully!');
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
              New Group Message
            </Text>
            <TouchableOpacity style={[styles.draftsBtn, { backgroundColor: colors.surfaceMuted, borderRadius: radius.sm }]}>
              <Ionicons name="folder-open-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* ── Audience Selector ── */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textMuted, fontFamily: typography.fontFamily.semiBold }]}>Target Audience</Text>
            <AudienceSelector 
              selectedGroups={selectedGroups} 
              onPress={() => Alert.alert('Groups', 'Group selection sheet coming soon.')} 
            />
          </View>

          {/* ── Message Type ── */}
          <View style={styles.section}>
            <View style={[styles.typeTabs, { backgroundColor: colors.surfaceMuted, borderRadius: radius.md }]}>
              {(['Standard', 'Urgent'] as const).map((type) => {
                const isActive = messageType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setMessageType(type)}
                    style={[
                      styles.typeTab,
                      isActive && { backgroundColor: type === 'Urgent' ? colors.danger : colors.primary, borderRadius: radius.sm }
                    ]}
                  >
                    <Text style={{ 
                      fontSize: 13, 
                      fontFamily: isActive ? typography.fontFamily.bold : typography.fontFamily.medium,
                      color: isActive ? '#FFFFFF' : colors.textMuted 
                    }}>
                      {type} {type === 'Urgent' ? 'Alert' : 'Post'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── Composer ── */}
          <View style={styles.composer}>
            <TextInput 
              style={[styles.subjectInput, { color: colors.text, fontFamily: typography.fontFamily.bold, borderBottomColor: colors.divider }]}
              placeholder="Subject (Optional)"
              placeholderTextColor={colors.textMuted}
              value={subject}
              onChangeText={setSubject}
            />
            <TextInput 
              style={[styles.bodyInput, { color: colors.text, fontFamily: typography.fontFamily.regular }]}
              placeholder="Type your message here..."
              placeholderTextColor={colors.textMuted}
              multiline
              value={body}
              onChangeText={setBody}
              textAlignVertical="top"
            />
          </View>

        </ScrollView>

        {/* ── Toolbar & Action ── */}
        <View style={[styles.bottomBar, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
          <View style={styles.toolbar}>
            <TouchableOpacity style={styles.toolBtn}><Ionicons name="camera-outline" size={24} color={colors.primary} /></TouchableOpacity>
            <TouchableOpacity style={styles.toolBtn}><Ionicons name="image-outline" size={24} color={colors.primary} /></TouchableOpacity>
            <TouchableOpacity style={styles.toolBtn}><Ionicons name="document-text-outline" size={24} color={colors.primary} /></TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={[styles.sendBtn, { backgroundColor: colors.primary, borderRadius: radius.md }]}
            onPress={handleSend}
          >
            <Text style={{ color: '#FFFFFF', fontFamily: typography.fontFamily.bold, fontSize: 16 }}>Send Message</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 24, paddingBottom: 120 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: { fontSize: 24 },
  draftsBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  typeTabs: {
    flexDirection: 'row',
    padding: 4,
  },
  typeTab: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composer: {
    marginTop: 8,
  },
  subjectInput: {
    fontSize: 18,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  bodyInput: {
    fontSize: 16,
    paddingVertical: 20,
    minHeight: 200,
    lineHeight: 24,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  toolbar: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
    paddingLeft: 4,
  },
  toolBtn: {
    padding: 4,
  },
  sendBtn: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
});
