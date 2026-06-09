import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getGroupMetadata } from '@/constants/groups';
import { useGroupsQuery } from '@/hooks/queries/useGroups';
import { Image } from 'expo-image';

export default function ManageGroupsModal() {
  const { colors, typography, radius } = useTheme();
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);

  const { data: groups = [], isLoading } = useGroupsQuery();

  const handleEditAdmin = (groupId: string) => {
    Alert.alert('Change Admin', `Select a new administrator for ${groupId.toUpperCase()}.`);
  };

  const handleApprove = (id: string, name: string) => {
    Alert.alert('Approve Request', `Approve ${name}'s request?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve', onPress: () => {
        setRequests(prev => prev.filter(r => r.id !== id));
      }}
    ]);
  };

  const handleReject = (id: string, name: string) => {
    Alert.alert('Reject Request', `Reject ${name}'s request?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: () => {
        setRequests(prev => prev.filter(r => r.id !== id));
      }}
    ]);
  };

  const renderHeader = () => (
    <Animated.View entering={FadeInDown.duration(400)}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text, fontFamily: typography.fontFamily.extraBold }]}>
          Parish Administration
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
          Approve membership requests and assign group moderators.
        </Text>
      </View>

      {/* Pending Requests Section */}
      {requests.length > 0 && (
        <View style={styles.requestsSection}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary, fontFamily: typography.fontFamily.semiBold }]}>
            Pending Membership Requests ({requests.length})
          </Text>
          {requests.map((req, i) => (
            <Animated.View 
              key={req.id} 
              entering={FadeInDown.delay(i * 80).duration(400)}
              layout={Layout.springify()}
            >
              <Card elevation="sm" style={styles.requestCard}>
                <Image source={req.avatar} style={[styles.requestAvatar, { borderRadius: 18 }]} />
                <View style={styles.requestContent}>
                  <Text style={{ fontSize: 14, fontFamily: typography.fontFamily.bold, color: colors.text }}>
                    {req.name}
                  </Text>
                  <Text style={{ fontSize: 12, fontFamily: typography.fontFamily.medium, color: colors.textSecondary, marginTop: 2 }}>
                    Requesting: <Text style={{ fontFamily: typography.fontFamily.bold, color: colors.primary }}>{req.group}</Text>
                  </Text>
                  <Text style={{ fontSize: 10, fontFamily: typography.fontFamily.regular, color: colors.textMuted, marginTop: 4 }}>
                    {req.date}
                  </Text>
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity 
                    onPress={() => handleReject(req.id, req.name)}
                    style={[styles.actionBtn, { backgroundColor: colors.dangerBg }]}
                  >
                    <Ionicons name="close" size={18} color={colors.danger} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleApprove(req.id, req.name)}
                    style={[styles.actionBtn, { backgroundColor: colors.successBg }]}
                  >
                    <Ionicons name="checkmark" size={18} color={colors.success} />
                  </TouchableOpacity>
                </View>
              </Card>
            </Animated.View>
          ))}
        </View>
      )}

      <Text style={[styles.sectionLabel, { color: colors.textSecondary, fontFamily: typography.fontFamily.semiBold, marginTop: 12, paddingHorizontal: 20 }]}>
        Manage Moderation Roles
      </Text>
    </Animated.View>
  );

  return (
    <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
      <ScreenHeader title="Manage Groups" />
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader}
        renderItem={({ item, index }) => {
          const meta = getGroupMetadata(item.name);
          const admin = { name: 'Unassigned', avatar: '' };
          return (
            <Animated.View 
              entering={FadeInDown.delay(index * 60 + 150).duration(450)}
              style={{ paddingHorizontal: 20 }}
            >
              <TouchableOpacity 
                style={[styles.groupCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}
                onPress={() => handleEditAdmin(item.id)}
                activeOpacity={0.9}
              >
                <View style={styles.groupInfo}>
                  <Text style={[styles.groupName, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
                    {item.name}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                    <Badge label={meta.shortName} variant="primary" size="xs" />
                    <Badge label={item.is_secure ? 'Secured' : 'Open'} variant="muted" size="xs" />
                  </View>
                </View>

                <View style={[styles.adminSection, { borderTopColor: colors.divider }]}>
                  <View style={styles.adminMeta}>
                    <Image source={admin?.avatar} style={[styles.avatar, { borderRadius: 14, backgroundColor: colors.surfaceMuted }]} />
                    <View>
                      <Text style={[styles.adminLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.bold }]}>MODERATOR</Text>
                      <Text style={[styles.adminName, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>{admin?.name}</Text>
                    </View>
                  </View>
                  <View style={[styles.editCircle, { backgroundColor: colors.primaryLight }]}>
                    <Ionicons name="create-outline" size={14} color={colors.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        }}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { padding: 20, paddingBottom: 12 },
  title: { fontSize: 24 },
  subtitle: { fontSize: 14, marginTop: 4, lineHeight: 20 },
  list: { paddingBottom: 40 },
  sectionLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  requestsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  requestAvatar: {
    width: 36,
    height: 36,
  },
  requestContent: {
    flex: 1,
    marginLeft: 12,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupCard: {
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  groupInfo: {
    padding: 16,
  },
  groupName: {
    fontSize: 16,
  },
  adminSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  adminMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 28,
    height: 28,
  },
  adminLabel: {
    fontSize: 8,
    letterSpacing: 0.5,
  },
  adminName: {
    fontSize: 13,
  },
  editCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
