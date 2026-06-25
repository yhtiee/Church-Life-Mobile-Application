import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/FeedbackContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MultiSelectDropdown } from '@/components/ui/MultiSelectDropdown';
import { useGroupsQuery } from '@/hooks/queries/useGroups';
import GlobalLoader from '@/components/ui/GlobalLoader';
import { ComunityService } from '@/lib/supabase/services/community';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys';

const communityService = new ComunityService();

export default function ComposeMessageModal() {
  const { colors, typography, radius } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();

  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [messageType, setMessageType] = useState<'Standard' | 'Urgent'>('Standard');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sendingGroupId, setSendingGroupId] = useState<string | null>(null);

  const { data: allGroups = [], isLoading: loadingGroups } = useGroupsQuery();

  // Format groups for multi-select dropdown with full names and metadata
  const groupOptions = useMemo(() => {
    return allGroups.map(group => ({
      label: group.name,
      value: group.id,
      subtitle: group.description || (group.is_secure ? 'Secured Group' : 'Open Group'),
      icon: group.is_secure ? 'lock-closed' : 'people',
      metadata: group,
    }));
  }, [allGroups]);

  const handleSend = async () => {
    if (selectedGroups.length === 0 || !body.trim()) {
      showAlert({ 
        title: 'Missing Info', 
        message: 'Please select at least one group and type a message.',
        type: 'error'
      });
      return;
    }

    try {
      // Send message to each selected group
      for (const groupId of selectedGroups) {
        setSendingGroupId(groupId);
        const messageData = {
          groupId,
          sender: user?.fullName || 'Admin',
          senderRole: 'Admin' as const,
          content: body,
        };
        
        // Call service directly (no hooks inside loops!)
        const res = await communityService.sendGroupMessage(groupId, messageData);
        if (res.error) throw res.error;
      }

      // Invalidate caches after all messages sent
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groups() });
      selectedGroups.forEach(groupId => {
        queryClient.invalidateQueries({ queryKey: ['groupMessages', groupId] });
      });

      showAlert({
        title: 'Success',
        message: `Message sent to ${selectedGroups.length} group${selectedGroups.length > 1 ? 's' : ''}`,
        type: 'success'
      });
      
      // Reset and go back
      setSelectedGroups([]);
      setSubject('');
      setBody('');
      setSendingGroupId(null);
      router.back();
    } catch (error: any) {
      showAlert({
        title: 'Error',
        message: error?.message || 'Failed to send messages',
        type: 'error'
      });
      setSendingGroupId(null);
    }
  };

  const rightEl = (
    <TouchableOpacity
      onPress={handleSend}
      disabled={sendingGroupId !== null || selectedGroups.length === 0}
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: sendingGroupId !== null || selectedGroups.length === 0 ? colors.textMuted : colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: sendingGroupId !== null || selectedGroups.length === 0 ? 0.5 : 1,
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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scroll} 
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={true}
          keyboardShouldPersistTaps="handled"
        >
          
          {/* ── Group Selection (Multi-Select Dropdown) ── */}
          <Animated.View entering={FadeInDown.duration(400)} style={styles.section}>
            <MultiSelectDropdown
              label="Recipients *"
              placeholder="Select one or more groups"
              options={groupOptions}
              selectedValues={selectedGroups}
              onChange={(values) => setSelectedGroups(values)}
              searchable={true}
            />
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
          {/* <View style={styles.toolbar}>
            <TouchableOpacity style={styles.toolBtn}><Ionicons name="camera" size={22} color={colors.primary} /></TouchableOpacity>
            <TouchableOpacity style={styles.toolBtn}><Ionicons name="image" size={22} color={colors.primary} /></TouchableOpacity>
            <TouchableOpacity style={styles.toolBtn}><Ionicons name="document-text" size={22} color={colors.primary} /></TouchableOpacity>
          </View> */}
          <Button 
            label={sendingGroupId ? 'Sending...' : 'Send Broadcast'}
            onPress={handleSend}
            fullWidth
            size="lg"
            disabled={sendingGroupId !== null || selectedGroups.length === 0}
          />
        </Animated.View>
      </KeyboardAvoidingView>
      <GlobalLoader visible={loadingGroups || sendingGroupId !== null} />
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
