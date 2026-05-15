import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { NOTIFICATIONS } from '@/constants/mockData';

export default function NotificationsModal() {
  const { colors, typography, radius } = useTheme();

  const getIcon = (type: string) => {
    switch (type) {
      case 'giving': return 'card-outline';
      case 'announcement': return 'megaphone-outline';
      case 'group': return 'people-outline';
      case 'system': return 'settings-outline';
      default: return 'notifications-outline';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'giving': return colors.success;
      case 'announcement': return colors.primary;
      case 'group': return colors.accent;
      case 'system': return colors.textMuted;
      default: return colors.primary;
    }
  };

  return (
    <ScreenWrapper edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
            Notifications
          </Text>
          <TouchableOpacity>
            <Text style={[styles.markRead, { color: colors.primary, fontFamily: typography.fontFamily.medium }]}>
              Mark all as read
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.list}>
          {NOTIFICATIONS.map((notif) => (
            <TouchableOpacity 
              key={notif.id} 
              style={[
                styles.notifItem, 
                { borderBottomColor: colors.divider },
                notif.unread && { backgroundColor: colors.primaryLight + '20' }
              ]}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name={getIcon(notif.type) as any} size={20} color={getIconColor(notif.type)} />
              </View>

              <View style={styles.content}>
                <View style={styles.row}>
                  <Text style={[styles.notifTitle, { color: colors.text, fontFamily: notif.unread ? typography.fontFamily.bold : typography.fontFamily.semiBold }]}>
                    {notif.title}
                  </Text>
                  {notif.unread && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
                </View>
                <Text style={[styles.notifBody, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]} numberOfLines={2}>
                  {notif.body}
                </Text>
                <Text style={[styles.time, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                  {notif.time}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {NOTIFICATIONS.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
              No new notifications
            </Text>
          </View>
        )}

      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 24, 
    paddingBottom: 16 
  },
  title: { fontSize: 24 },
  markRead: { fontSize: 13 },
  list: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(0,0,0,0.05)' },
  notifItem: { 
    flexDirection: 'row', 
    paddingHorizontal: 20, 
    paddingVertical: 16, 
    borderBottomWidth: StyleSheet.hairlineWidth 
  },
  iconContainer: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1 
  },
  content: { flex: 1, marginLeft: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  notifTitle: { fontSize: 15, flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 8 },
  notifBody: { fontSize: 14, lineHeight: 20, marginBottom: 6 },
  time: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, fontSize: 16 },
});
