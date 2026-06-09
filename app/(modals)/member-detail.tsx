import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useGroupsQuery } from '@/hooks/queries/useGroups';
import { getGroupMetadata } from '@/constants/groups';
import { Gradients } from '@/constants/theme';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AuthService } from '@/lib/supabase/services/auth';

export default function MemberDetailModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, typography, radius } = useTheme();
  const router = useRouter();

  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { data: groups = [] } = useGroupsQuery();
  const joinedGroups = groups.filter((g) => g.member_ids?.includes(member?.id));
  const primaryGroupColor = joinedGroups.length > 0 ? getGroupMetadata(joinedGroups[0].name).color : colors.border;

  useEffect(() => {
    let active = true;
    const fetchMember = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const service = new AuthService();
        const res = await service.getUserProfile(id);
        if (active) {
          if (res.data) {
            setMember(res.data);
          } else {
            setMember(null);
          }
        }
      } catch (err) {
        if (active) setMember(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchMember();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
        <ScreenHeader title="Member Profile" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner size="large" />
        </View>
      </ScreenWrapper>
    );
  }

  if (!member) {
    return (
      <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
        <ScreenHeader title="Member Profile" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.textSecondary, fontFamily: typography.fontFamily.medium, fontSize: 16 }}>
            Member not found
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  const InfoRow = ({ label, value, icon, isLast }: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap; isLast?: boolean }) => (
    <View style={[styles.infoRow, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider }]}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={18} color={colors.textMuted} style={styles.rowIcon} />
        <Text style={{ fontSize: 13, color: colors.textMuted, fontFamily: typography.fontFamily.regular }}>{label}</Text>
      </View>
      <Text style={{ fontSize: 15, color: colors.text, fontFamily: typography.fontFamily.semiBold }}>{value}</Text>
    </View>
  );

  return (
    <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
      <ScreenHeader title="Member Profile" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* ── Profile Header with Wave Bottom Edge ── */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <LinearGradient
            colors={Gradients.profileHero}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.hero}
          >
            {/* Wave shape bottom overlay */}
            <View style={[styles.waveOverlay, { backgroundColor: colors.background }]} />

            <View style={styles.heroContent}>
              <Animated.View entering={ZoomIn.springify().damping(12)}>
                <Avatar
                  name={member.fullName}
                  size={96}
                  ring={primaryGroupColor}
                />
              </Animated.View>
              <Text style={[styles.fullName, { color: '#FFFFFF', fontFamily: typography.fontFamily.bold, marginTop: 14 }]}>
                {member.fullName}
              </Text>
              <View style={styles.badgeRow}>
                <Badge 
                  label={member.status} 
                  variant={member.status === 'Active' ? 'success' : 'warning'} 
                  size="sm" 
                  glow 
                />
                {joinedGroups.map((g) => {
                  const meta = getGroupMetadata(g.name);
                  return (
                    <Badge 
                      key={g.id}
                      label={meta.shortName} 
                      variant="primary" 
                      size="sm" 
                    />
                  );
                })}
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── Quick Actions ── */}
        <Animated.View entering={FadeInDown.delay(100).duration(450)} style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}>
            <Ionicons name="mail-outline" size={20} color={colors.primary} />
            <Text style={[styles.actionBtnText, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>Email</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}>
            <Ionicons name="call-outline" size={20} color={colors.primary} />
            <Text style={[styles.actionBtnText, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
            <Text style={[styles.actionBtnText, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>Message</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Personal Info ── */}
        <Animated.View entering={FadeInDown.delay(180).duration(450)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary, fontFamily: typography.fontFamily.semiBold }]}>
            Personal Details
          </Text>
          <Card elevation="sm" style={{ padding: 0, overflow: 'hidden', borderRadius: radius.lg }}>
            <InfoRow label="Baptismal Name" value={member.baptismalName || 'N/A'} icon="person-outline" />
            <InfoRow label="Email Address" value={member.email} icon="mail-outline" />
            <InfoRow label="Phone Number" value={member.phone} icon="call-outline" isLast />
          </Card>
        </Animated.View>

        {/* ── Parish Life ── */}
        <Animated.View entering={FadeInDown.delay(260).duration(450)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary, fontFamily: typography.fontFamily.semiBold }]}>
            Parish Life
          </Text>
          <Card elevation="sm" style={{ padding: 0, overflow: 'hidden', borderRadius: radius.lg }}>
            <InfoRow label="Parish Group" value={joinedGroups.map((g) => g.name).join(', ') || 'Unassigned'} icon="people-outline" />
            <InfoRow label="Baptism Date" value={member.baptismDate || 'Not recorded'} icon="water-outline" />
            <InfoRow label="Confirmation" value={member.confirmationDate || 'Not recorded'} icon="flame-outline" isLast />
          </Card>
        </Animated.View>

      </ScrollView>

      {/* ── Floating Edit Button ── */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary, borderRadius: radius.xl }]}
        onPress={() => Alert.alert('Coming Soon', 'User editing will be available in the next version.')}
      >
        <Ionicons name="create" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 100 },
  hero: {
    height: 250,
    position: 'relative',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  waveOverlay: {
    position: 'absolute',
    bottom: -30,
    left: -20,
    right: -20,
    height: 60,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    transform: [{ scaleX: 1.2 }],
  },
  heroContent: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  fullName: {
    fontSize: 22,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 10,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
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
    letterSpacing: 1.2,
    marginBottom: 10,
    marginLeft: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    marginRight: 10,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
