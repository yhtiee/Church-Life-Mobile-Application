import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { OPEN_GROUPS } from '@/constants/groups';
import { MOCK_CHAT_MESSAGES } from '@/constants/mockData';

export default function GroupChatModal() {
  const { colors, typography, radius } = useTheme();
  const { user } = useAuth();

  const myGroup = OPEN_GROUPS.find((g) => g.id === user?.groupId);
  const messages = MOCK_CHAT_MESSAGES.filter((m) => m.groupId === user?.groupId);

  const renderMessage = ({ item }: { item: any }) => {
    const isAdmin = item.senderRole === 'Admin';
    
    return (
      <View style={[styles.messageRow, { marginBottom: 16 }]}>
        <View style={[styles.avatar, { backgroundColor: isAdmin ? colors.accentLight : colors.primaryLight }]}>
          <Text style={{ fontSize: 12, fontFamily: typography.fontFamily.bold, color: isAdmin ? colors.accent : colors.primary }}>
            {item.sender.charAt(0)}
          </Text>
        </View>

        <View style={styles.messageContent}>
          <View style={styles.senderHeader}>
            <Text style={[styles.senderName, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
              {item.sender}
            </Text>
            <View style={[styles.roleBadge, { backgroundColor: isAdmin ? colors.accent + '15' : colors.primary + '15' }]}>
              <Text style={{ fontSize: 9, fontFamily: typography.fontFamily.semiBold, color: isAdmin ? colors.accent : colors.primary }}>
                {item.senderRole}
              </Text>
            </View>
            <Text style={[styles.timestamp, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
              {item.timestamp}
            </Text>
          </View>

          <View style={[styles.bubble, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}>
            <Text style={{ fontSize: 14, color: colors.text, fontFamily: typography.fontFamily.regular, lineHeight: 20 }}>
              {item.content}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper edges={['left', 'right', 'bottom']}>
      {/* Custom Modal Header */}
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <View style={[styles.groupIcon, { backgroundColor: myGroup?.color ?? colors.primary }]}>
          <Ionicons name={myGroup?.icon as any ?? 'people'} size={18} color="#FFFFFF" />
        </View>
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ fontSize: 16, fontFamily: typography.fontFamily.bold, color: colors.text }}>
            {myGroup?.name ?? 'Group Chat'}
          </Text>
          <Text style={{ fontSize: 11, fontFamily: typography.fontFamily.medium, color: colors.success }}>
            Admin Broadcast Channel
          </Text>
        </View>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Read-Only Input Placeholder */}
      <View style={[styles.footer, { borderTopColor: colors.divider, backgroundColor: colors.surfaceMuted }]}>
        <View style={[styles.inputPlaceholder, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="lock-closed-outline" size={14} color={colors.textMuted} />
          <Text style={{ fontSize: 13, fontFamily: typography.fontFamily.medium, color: colors.textMuted, marginLeft: 8 }}>
            Only Admins can send messages here
          </Text>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 16, 
    borderBottomWidth: StyleSheet.hairlineWidth 
  },
  groupIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 20, paddingBottom: 40 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-start' },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  messageContent: { flex: 1, marginLeft: 12 },
  senderHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  senderName: { fontSize: 13, marginRight: 8 },
  roleBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, marginRight: 8 },
  timestamp: { fontSize: 10 },
  bubble: { padding: 12, borderWidth: 1 },
  footer: { padding: 16, paddingBottom: 32 },
  inputPlaceholder: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: 48, 
    borderRadius: 24, 
    borderWidth: 1, 
    paddingHorizontal: 20 
  },
});
