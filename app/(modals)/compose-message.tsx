import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { OPEN_GROUPS } from '@/constants/groups';

export default function ComposeMessageModal() {
  const { colors, typography, radius } = useTheme();
  const router = useRouter();

  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [messageType, setMessageType] = useState<'Standard' | 'Urgent'>('Standard');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleToggleGroup = (groupId: string) => {
    setSelectedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId) 
        : [...prev, groupId]
    );
  };

  const handleSend = () => {
    if (selectedGroups.length === 0 || !body.trim()) {
      Alert.alert('Missing Info', 'Please select at least one group and type a message.');
      return;
    }
    Alert.alert('Success', 'Message broadcasted successfully!');
    router.back();
  };

  const rightEl = (
    <TouchableOpacity
      onPress={handleSend}
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name="paper-plane" size={16} color="#FFFFFF" />
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
      <ScreenHeader title="New Broadcast" rightElement={rightEl} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          
          {/* ── Audience Selector (Recipient Pill Chips) ── */}
          <Animated.View entering={FadeInDown.duration(400)} style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary, fontFamily: typography.fontFamily.bold }]}>
              Recipients *
            </Text>
            <View style={styles.recipientContainer}>
              {OPEN_GROUPS.map((g) => {
                const isSelected = selectedGroups.includes(g.id);
                return (
                  <TouchableOpacity
                    key={g.id}
                    onPress={() => handleToggleGroup(g.id)}
                    activeOpacity={0.8}
                    style={[
                      styles.recipientPill,
                      {
                        backgroundColor: isSelected ? g.color : colors.surfaceMuted,
                        borderColor: isSelected ? g.color : colors.border,
                        borderRadius: radius.full,
                      }
                    ]}
                  >
                    <Ionicons 
                      name={g.icon as any} 
                      size={14} 
                      color={isSelected ? '#FFFFFF' : colors.textSecondary} 
                    />
                    <Text style={{ 
                      fontSize: 12, 
                      fontFamily: typography.fontFamily.bold, 
                      color: isSelected ? '#FFFFFF' : colors.textSecondary 
                    }}>
                      {g.shortName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>

          {/* ── Message Type ── */}
          <Animated.View entering={FadeInDown.delay(80).duration(450)} style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary, fontFamily: typography.fontFamily.bold }]}>
              Message Priority
            </Text>
            <View style={[styles.typeTabs, { backgroundColor: colors.surfaceMuted, borderRadius: radius.full }]}>
              {(['Standard', 'Urgent'] as const).map((type) => {
                const isActive = messageType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setMessageType(type)}
                    style={[
                      styles.typeTab,
                      isActive && { 
                        backgroundColor: type === 'Urgent' ? colors.danger : colors.primary, 
                        borderRadius: radius.full 
                      }
                    ]}
                  >
                    <Text style={{ 
                      fontSize: 12, 
                      fontFamily: typography.fontFamily.bold,
                      color: isActive ? '#FFFFFF' : colors.textMuted 
                    }}>
                      {type} {type === 'Urgent' ? 'Alert ⚠️' : 'Post 📝'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>

          {/* ── Composer Card ── */}
          <Animated.View entering={FadeInDown.delay(160).duration(450)}>
            <Card 
              elevation="sm" 
              style={[styles.composerCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}
            >
              <TextInput 
                style={[
                  styles.subjectInput, 
                  { 
                    color: colors.text, 
                    fontFamily: typography.fontFamily.bold, 
                    borderBottomColor: colors.divider 
                  }
                ]}
                placeholder="Subject (Optional)"
                placeholderTextColor={colors.textMuted}
                value={subject}
                onChangeText={setSubject}
              />
              <TextInput 
                style={[
                  styles.bodyInput, 
                  { 
                    color: colors.text, 
                    fontFamily: typography.fontFamily.regular 
                  }
                ]}
                placeholder="Type your broadcast message here..."
                placeholderTextColor={colors.textMuted}
                multiline
                value={body}
                onChangeText={setBody}
                textAlignVertical="top"
              />
            </Card>
          </Animated.View>

        </ScrollView>

        {/* ── Toolbar & Action ── */}
        <Animated.View 
          entering={FadeInDown.delay(240).duration(400)}
          style={[styles.bottomBar, { borderTopColor: colors.border, backgroundColor: colors.surface }]}
        >
          <View style={styles.toolbar}>
            <TouchableOpacity style={styles.toolBtn}><Ionicons name="camera" size={22} color={colors.primary} /></TouchableOpacity>
            <TouchableOpacity style={styles.toolBtn}><Ionicons name="image" size={22} color={colors.primary} /></TouchableOpacity>
            <TouchableOpacity style={styles.toolBtn}><Ionicons name="document-text" size={22} color={colors.primary} /></TouchableOpacity>
          </View>
          <Button 
            label="Send Broadcast"
            onPress={handleSend}
            fullWidth
            size="lg"
          />
        </Animated.View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  closeBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
  },
  scroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 120 },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  recipientContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recipientPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  typeTabs: {
    flexDirection: 'row',
    padding: 3,
  },
  typeTab: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composerCard: {
    padding: 16,
    borderWidth: 1,
  },
  subjectInput: {
    fontSize: 17,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  bodyInput: {
    fontSize: 15,
    paddingVertical: 14,
    minHeight: 180,
    lineHeight: 22,
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
    marginBottom: 14,
    paddingLeft: 4,
  },
  toolBtn: {
    padding: 4,
  },
});
