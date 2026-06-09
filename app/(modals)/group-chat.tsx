import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ComunityService } from '@/lib/supabase/services/community';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';

export default function GroupChatModal() {
  const { colors, typography, radius } = useTheme();
  const { user } = useAuth();
  const { groupId, groupName } = useLocalSearchParams<{ groupId: string; groupName: string }>();

  const groupTitle = groupName || 'Group Chat';
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) {
      setLoading(false);
      return;
    }

    const service = new ComunityService();
    let unsubscribe: (() => void) | undefined;

    const initChat = async () => {
      try {
        const { data, error } = await service.fetchChatMessages(groupId);
        if (!error && data) {
          setMessages(data);
        } else {
          setMessages([]);
        }

        // Subscribe to real-time inserts
        unsubscribe = await service.subscribeToGroupChats(groupId, (newMsg) => {
          setMessages((prev) => {
            // Prevent duplicate message renders
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        });
      } catch (err) {
        console.error('Error in chat initialization:', err);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    initChat();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [groupId]);

  const renderMessage = ({ item, index }: { item: any; index: number }) => {
    const isAdmin = item.senderRole === 'Admin';
    
    return (
      <Animated.View 
        entering={FadeInDown.delay(index * 40).duration(400)}
        style={[styles.messageRow, { marginBottom: 18 }]}
      >
        <Avatar
          name={item.sender}
          size={36}
          ring={isAdmin ? '#D4AF37' : colors.primary}
        />

        <View style={styles.messageContent}>
          <View style={styles.senderHeader}>
            <Text style={[styles.senderName, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
              {item.sender}
            </Text>
            <View style={[styles.roleBadge, { backgroundColor: isAdmin ? 'rgba(212,175,55,0.15)' : colors.primaryLight }]}>
              <Text style={{ fontSize: 9, fontFamily: typography.fontFamily.bold, color: isAdmin ? '#D4AF37' : colors.primary, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                {item.senderRole}
              </Text>
            </View>
            <Text style={[styles.timestamp, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
              {item.timestamp}
            </Text>
          </View>

          <View style={[styles.bubble, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
            <Text style={{ fontSize: 14, color: colors.text, fontFamily: typography.fontFamily.regular, lineHeight: 21 }}>
              {item.content}
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
        <ScreenHeader title={groupTitle} />
        <LoadingSpinner fullScreen />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
      <ScreenHeader title={groupTitle} />

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="chatbubbles-outline"
            title="No Messages"
            message="There are no broadcasts or group messages in this channel yet."
          />
        }
      />

      {/* Read-Only Input Compose Box */}
      <View style={[styles.footer, { borderTopColor: colors.divider, backgroundColor: colors.surfaceMuted }]}>
        <View style={[styles.inputPlaceholder, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.full }]}>
          <Ionicons name="lock-closed" size={14} color={colors.textMuted} />
          <Text style={{ fontSize: 13, fontFamily: typography.fontFamily.medium, color: colors.textMuted, marginLeft: 8 }}>
            Only admins can broadcast in this group
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
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  groupIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 20, paddingBottom: 40 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-start' },
  messageContent: { flex: 1, marginLeft: 12 },
  senderHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  senderName: { fontSize: 13, marginRight: 8 },
  roleBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8 },
  timestamp: { fontSize: 10 },
  bubble: { padding: 12, borderWidth: StyleSheet.hairlineWidth },
  footer: { padding: 16, paddingBottom: 32 },
  inputPlaceholder: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: 48, 
    borderWidth: 1, 
    paddingHorizontal: 20 
  },
});
