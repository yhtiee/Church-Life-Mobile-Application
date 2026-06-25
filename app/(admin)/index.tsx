import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Gradients } from '@/constants/theme';
import GlobalLoader from '@/components/ui/GlobalLoader';
import AnnouncementCarousel from '@/components/ui/AnnouncementCarousel';
import { useProfilesByParishQuery } from '@/hooks/queries/useProfiles';
import { useGroupRequestsByParishQuery } from '@/hooks/queries/useGroups';
import { useDonationsByParishQuery } from '@/hooks/queries/useFinance';
import { useAllActivitiesQuery } from '@/hooks/queries/useActivities';
import { AnnoucementService } from '@/lib/supabase/services/announcements';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const QUICK_ACTIONS = [
  {
    icon: 'cash-outline' as const,
    label: 'Log Gift',
    bg: '#E8F0FE',
    iconColor: '#2A6FDB',
    gradient: Gradients.heroBlue,
    route: '/(modals)/log-donation',
  },
  {
    icon: 'calendar-outline' as const,
    label: 'Bookings',
    bg: '#D1FAE5',
    iconColor: '#059669',
    gradient: Gradients.cardGreen,
    route: '/(modals)/admin-mass-bookings',
  },
  {
    icon: 'megaphone-outline' as const,
    label: 'Announcement',
    bg: '#FEF3C7',
    iconColor: '#D97706',
    gradient: Gradients.cardGold,
    route: '/(modals)/admin-announcements',
  },
  {
    icon: 'image-outline' as const,
    label: 'Ads',
    bg: '#EDE9FE',
    iconColor: '#7C3AED',
    gradient: Gradients.cardPurple,
    route: '/(modals)/admin-ads',
  },
] as const;

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AdminDashboard() {
  const { colors, typography, isDark } = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  const { data: profiles = [], isLoading: loadingProfiles } = useProfilesByParishQuery(user?.parishId as string);
  const { data: groupRequests = [], isLoading: loadingRequests } = useGroupRequestsByParishQuery(user?.parishId as string);
  const { data: donations = [], isLoading: loadingDonations } = useDonationsByParishQuery(user?.parishId as string);
  const { data: activities = [], isLoading: loadingActivities } = useAllActivitiesQuery(10, 0);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementLoading, setAnnouncementLoading] = useState(false);

  const loading = loadingProfiles || loadingRequests || loadingDonations || announcementLoading || loadingActivities;

  // Fetch announcements for carousel
  useEffect(() => {
    const fetchAnnouncements = async () => {
      setAnnouncementLoading(true);
      try {
        const announcementService = new AnnoucementService();
        const { data: announcementData, error } = await announcementService.fetchAnnouncements(user?.parishId);
        if (!error && announcementData) {
          setAnnouncements(announcementData);
        }
      } catch (err) {
        console.error('Failed to load announcements:', err);
      } finally {
        setAnnouncementLoading(false);
      }
    };
    fetchAnnouncements();
  }, [user?.parishId]);

  const weeklyCollection = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    return WEEK_DAYS.map((day, idx) => {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + idx);
      const dayStr = dayDate.toISOString().split('T')[0];
      const amount = donations
        .filter((d) => d.date === dayStr)
        .reduce((sum, d) => sum + Number(d.amount), 0);
      return { day, amount };
    });
  }, [donations]);

  const weeklyTotal = useMemo(
    () => weeklyCollection.reduce((sum, d) => sum + d.amount, 0),
    [weeklyCollection]
  );

  const recentActivity = useMemo(() => {
    if (!activities || activities.length === 0) return [];
    
    // Create a map of profiles by user_id for quick lookup
    const profilesMap = new Map(profiles.map((p: any) => [p.id, p]));

    return activities.slice(0, 6).map((activity) => {
      const typeIcons: { [key: string]: string } = {
        group_join_request: 'person-add-outline',
        group_transition_request: 'arrow-forward-outline',
        donation: 'gift-outline',
        booking_request: 'calendar-outline',
      };

      const typeLabels: { [key: string]: string } = {
        group_join_request: 'Group Join',
        group_transition_request: 'Group Transition',
        donation: 'Donation',
        booking_request: 'Mass Booking',
      };

      const actionVerbs: { [key: string]: string } = {
        group_join_request: 'requested to join',
        group_transition_request: 'requested to transition',
        donation: 'donated',
        booking_request: 'booked',
      };

      const userProfile = profilesMap.get(activity.user_id);
      const userName = userProfile?.fullName || 'User';
      const actionVerb = actionVerbs[activity.activity_type] || 'performed';
      const userDisplayTitle = `${userName} ${actionVerb}`;

      return {
        id: activity.id,
        type: activity.activity_type,
        icon: typeIcons[activity.activity_type] || 'activity-outline',
        title: userDisplayTitle,
        description: activity.description,
        timestamp: new Date(activity.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        status: activity.status,
        typeLabel: typeLabels[activity.activity_type],
      };
    });
  }, [activities, profiles]);

  const maxAmount = Math.max(...weeklyCollection.map((d) => d.amount), 1);
  const todayName = WEEK_DAYS[new Date().getDay()];

  return (
    <ScreenWrapper edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Greeting Header ── */}
        <ScreenHeader showGreeting />

        {/* ── Quick Actions ── */}
        <Animated.View entering={FadeInDown.delay(80).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
            Quick Actions
          </Text>
          <View style={styles.quickRow}>
            {QUICK_ACTIONS.map((qa, i) => (
              <Animated.View key={qa.label} entering={ZoomIn.delay(i * 50 + 140).duration(350)}>
                <TouchableOpacity
                  style={styles.quickTile}
                  activeOpacity={0.8}
                  onPress={() => router.push(qa.route as any)}
                >
                  <View
                    style={[
                      styles.quickIconBox,
                      { backgroundColor: isDark ? colors.surface : qa.bg, borderColor: colors.border },
                    ]}
                  >
                    <Ionicons name={qa.icon} size={24} color={isDark ? colors.primary : qa.iconColor} />
                  </View>
                  <Text
                    style={[
                      styles.quickLabel,
                      { color: colors.textSecondary, fontFamily: typography.fontFamily.semiBold },
                    ]}
                    numberOfLines={1}
                  >
                    {qa.label}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* ── Announcements Carousel ── */}
        <AnnouncementCarousel
          data={announcements}
          heroImages={[
            require('@/assets/images/church_exterior_hero.png'),
            require('@/assets/images/church_interior_hero.png'),
            require('@/assets/images/church_community_hero.png'),
          ]}
          onSelect={(item: any) => {
            router.push({
              pathname: '/(modals)/announcement-detail',
              params: { id: item.id },
            });
          }}
          loading={announcementLoading}
          showHeader={true}
          headerTitle="Parish Announcements"
          onSeeAll={() => router.push('/(modals)/announcements')}
          animationDelay={160}
          isFeatures={false}
        />

        {/* ── Bento Grid: Primary Metrics ── */}
        <View style={styles.bentoGrid}>
          <Animated.View entering={ZoomIn.delay(160).duration(350)} style={{ flex: 1 }}>
            <Card elevation="sm" style={[styles.metricCard, { borderColor: colors.border }]}>
              <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="people-outline" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.metricValue, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
                {profiles.length}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                Parishioners
              </Text>
            </Card>
          </Animated.View>

          <Animated.View entering={ZoomIn.delay(210).duration(350)} style={{ flex: 1 }}>
            <Card elevation="sm" style={[styles.metricCard, { borderColor: colors.border }]}>
              <View style={[styles.iconCircle, { backgroundColor: colors.accentLight }]}>
                <Ionicons name="checkmark-circle-outline" size={20} color={colors.accent} />
              </View>
              <View style={styles.badgeRow}>
                <Text style={[styles.metricValue, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
                  {groupRequests.length}
                </Text>
                {groupRequests.length > 0 && (
                  <View style={[styles.alertBadge, { backgroundColor: colors.danger }]}>
                    <Text style={{ fontSize: 10, color: '#FFFFFF', fontFamily: typography.fontFamily.bold }}>NEW</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.metricLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                Pending Approvals
              </Text>
            </Card>
          </Animated.View>
        </View>

        {/* ── Weekly Collection Chart ── */}
        <Animated.View entering={FadeInDown.delay(260).duration(450)}>
          <Card elevation="sm" style={[styles.chartCard, { borderColor: colors.border }]}>
            <View style={styles.chartHeader}>
              <Text style={{ fontSize: 14, fontFamily: typography.fontFamily.bold, color: colors.text }}>
                Weekly Collection
              </Text>
              <Text style={{ fontSize: 12, fontFamily: typography.fontFamily.semiBold, color: colors.success }}>
                ₦{weeklyTotal.toLocaleString()}
              </Text>
            </View>

            <View style={styles.barContainer}>
              {weeklyCollection.map((item) => {
                const maxHeight = 80;
                const barHeight = Math.max((item.amount / maxAmount) * maxHeight, 2);
                const isToday = item.day === todayName;

                return (
                  <View key={item.day} style={styles.barColumn}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                          backgroundColor: isToday ? colors.primary : colors.primaryLight,
                          borderRadius: 4,
                        },
                      ]}
                    />
                    <Text style={[styles.barDay, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                      {item.day}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Card>
        </Animated.View>

        {/* ── Recent Activity Feed ── */}
        <Animated.View entering={FadeInDown.delay(320).duration(450)} style={styles.activitySection}>
          <View style={styles.sectionHeader}>
            <Text style={{ fontSize: 16, fontFamily: typography.fontFamily.bold, color: colors.text }}>
              Recent Activity
            </Text>
            <TouchableOpacity onPress={() => router.push('/(admin)/groups')}>
              <Text style={{ fontSize: 12, fontFamily: typography.fontFamily.medium, color: colors.primary }}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {recentActivity.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="information-circle-outline" size={40} color={colors.textMuted} style={{ marginBottom: 12 }} />
              <Text style={{ color: colors.textMuted, fontFamily: typography.fontFamily.medium, fontSize: 13, textAlign: 'center' }}>
                No recent activity yet.{'\n'}Start by approving group requests or logging donations
              </Text>
            </View>
          ) : (
            recentActivity.map((activity, index) => (
              <View
                key={activity.id}
                style={[
                  styles.activityItem,
                  { borderBottomColor: colors.divider, borderBottomWidth: index === recentActivity.length - 1 ? 0 : StyleSheet.hairlineWidth },
                ]}
              >
                <View style={[styles.activityDot, { backgroundColor: activity.status === 'pending' ? colors.warning : colors.success }]} />
                <Ionicons name={activity.icon as any} size={16} color={colors.textMuted} style={{ marginHorizontal: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontFamily: typography.fontFamily.semiBold, color: colors.text }}>
                    {activity.title}
                  </Text>
                  {activity.description && (
                    <Text style={{ fontSize: 12, fontFamily: typography.fontFamily.regular, color: colors.textSecondary, marginTop: 2 }}>
                      {activity.description}
                    </Text>
                  )}
                  <Text style={{ fontSize: 11, fontFamily: typography.fontFamily.medium, color: colors.textMuted, marginTop: 2 }}>
                    {activity.timestamp} • {activity.typeLabel}
                  </Text>
                </View>
                {activity.status === 'pending' && (
                  <View style={[styles.statusBadge, { backgroundColor: colors.warningBg }]}>
                    <Text style={{ fontSize: 10, fontFamily: typography.fontFamily.bold, color: colors.warning }}>
                      PENDING
                    </Text>
                  </View>
                )}
              </View>
            ))
          )}
        </Animated.View>
      </ScrollView>
      <GlobalLoader visible={loading} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 17,
    letterSpacing: -0.2,
    paddingHorizontal: 20,
    marginBottom: 12,
  },

  // Quick actions
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 4,
    marginBottom: 20,
  },
  quickTile: {
    alignItems: 'center',
    width: 70,
  },
  quickIconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
    borderWidth: 1,
  },
  quickLabel: {
    fontSize: 11,
    letterSpacing: 0.1,
    textAlign: 'center',
  },

  bentoGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  metricCard: {
    padding: 16,
    borderWidth: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 22,
  },
  metricLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  chartCard: {
    padding: 16,
    marginBottom: 24,
    marginHorizontal: 20,
    borderWidth: 1,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  barContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
    paddingBottom: 4,
  },
  barColumn: {
    alignItems: 'center',
    width: (SCREEN_WIDTH - 100) / 7,
  },
  bar: {
    width: 12,
  },
  barDay: {
    fontSize: 10,
    marginTop: 8,
  },
  activitySection: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
});
