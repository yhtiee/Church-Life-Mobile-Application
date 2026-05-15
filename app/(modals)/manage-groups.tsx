import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { OPEN_GROUPS } from '@/constants/groups';
import { Image } from 'expo-image';

const MOCK_GROUP_ADMINS: Record<string, { name: string; avatar: string }> = {
  cyon: { name: 'Samuel Eze', avatar: 'https://i.pravatar.cc/150?u=s1' },
  cmo: { name: 'John Doe', avatar: 'https://i.pravatar.cc/150?u=j1' },
  cwo: { name: 'Mary Smith', avatar: 'https://i.pravatar.cc/150?u=m1' },
  hca: { name: 'Blessing Udoh', avatar: 'https://i.pravatar.cc/150?u=b1' },
};

export default function ManageGroupsModal() {
  const { colors, typography, radius } = useTheme();
  const router = useRouter();

  const handleEditAdmin = (groupId: string) => {
    Alert.alert('Change Admin', `Select a new administrator for ${groupId.toUpperCase()}.`);
  };

  return (
    <ScreenWrapper edges={['bottom', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text, fontFamily: typography.fontFamily.extraBold }]}>
          Manage Groups
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
          Assign moderators and manage group roles.
        </Text>
      </View>

      <FlatList
        data={OPEN_GROUPS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const admin = MOCK_GROUP_ADMINS[item.id];
          return (
            <TouchableOpacity 
              style={[styles.groupCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}
              onPress={() => handleEditAdmin(item.id)}
            >
              <View style={styles.groupInfo}>
                <Text style={[styles.groupName, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
                  {item.name}
                </Text>
                <Text style={[styles.groupType, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                  {item.type}
                </Text>
              </View>

              <View style={[styles.adminSection, { borderTopColor: colors.divider }]}>
                <View style={styles.adminMeta}>
                  <Image source={admin?.avatar} style={[styles.avatar, { borderRadius: 12, backgroundColor: colors.surfaceMuted }]} />
                  <View>
                    <Text style={[styles.adminLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.semiBold }]}>ADMINISTRATOR</Text>
                    <Text style={[styles.adminName, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>{admin?.name}</Text>
                  </View>
                </View>
                <Ionicons name="pencil" size={18} color={colors.primary} />
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { padding: 24, paddingBottom: 16 },
  title: { fontSize: 24 },
  subtitle: { fontSize: 14, marginTop: 4 },
  list: { padding: 24, paddingTop: 8, paddingBottom: 40 },
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
  groupType: {
    fontSize: 12,
    marginTop: 2,
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
    width: 24,
    height: 24,
  },
  adminLabel: {
    fontSize: 9,
    letterSpacing: 0.5,
  },
  adminName: {
    fontSize: 13,
  },
});
