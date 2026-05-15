import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { MOCK_PARISHIONERS } from '@/constants/mockData';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

export default function MemberDetailModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, typography, radius } = useTheme();
  const router = useRouter();

  const member = MOCK_PARISHIONERS.find((p) => p.id === id);

  if (!member) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Member not found</Text>
      </View>
    );
  }

  return (
    <ScreenWrapper edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* ── Header / Profile ── */}
        <View style={styles.profileHeader}>
          <Image 
            source={member.avatar || 'https://via.placeholder.com/150'} 
            style={[styles.largeAvatar, { borderRadius: 50, backgroundColor: colors.surfaceMuted }]} 
          />
          <Text style={[styles.fullName, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
            {member.fullName}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: member.status === 'Active' ? colors.success + '15' : colors.warning + '15' }]}>
            <Text style={{ fontSize: 12, color: member.status === 'Active' ? colors.success : colors.warning, fontFamily: typography.fontFamily.semiBold }}>
              {member.status}
            </Text>
          </View>
        </View>

        {/* ── Quick Actions ── */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="mail-outline" size={20} color={colors.primary} />
            <Text style={[styles.actionBtnText, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>Email</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="call-outline" size={20} color={colors.primary} />
            <Text style={[styles.actionBtnText, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
            <Text style={[styles.actionBtnText, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>Message</Text>
          </TouchableOpacity>
        </View>

        {/* ── Personal Info ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted, fontFamily: typography.fontFamily.semiBold }]}>
            Personal Details
          </Text>
          <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}>
            <InfoRow label="Baptismal Name" value={member.baptismalName || 'N/A'} />
            <InfoRow label="Email Address" value={member.email} isLast />
            <InfoRow label="Phone Number" value={member.phone} />
          </View>
        </View>

        {/* ── Parish Life ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted, fontFamily: typography.fontFamily.semiBold }]}>
            Parish Life
          </Text>
          <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}>
            <InfoRow label="Parish Group" value={member.groupId?.toUpperCase() || 'Unassigned'} />
            <InfoRow label="Baptism Date" value={member.baptismDate || 'Not recorded'} />
            <InfoRow label="Confirmation" value={member.confirmationDate || 'Not recorded'} isLast />
          </View>
        </View>

      </ScrollView>

      {/* ── Floating Edit Button ── */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary, borderRadius: radius.xl }]}
        onPress={() => Alert.alert('Coming Soon', 'User editing will be available in the next version.')}
      >
        <Ionicons name="create-outline" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

function InfoRow({ label, value, isLast }: { label: string; value: string; isLast?: boolean }) {
  const { colors, typography } = useTheme();
  return (
    <View style={[styles.infoRow, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider }]}>
      <Text style={{ fontSize: 13, color: colors.textMuted, fontFamily: typography.fontFamily.regular }}>{label}</Text>
      <Text style={{ fontSize: 15, color: colors.text, fontFamily: typography.fontFamily.semiBold }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 100 },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 24,
  },
  largeAvatar: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  fullName: {
    fontSize: 22,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 32,
  },
  actionBtn: {
    flex: 1,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
  },
  actionBtnText: {
    fontSize: 11,
    marginTop: 6,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  infoCard: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
});
