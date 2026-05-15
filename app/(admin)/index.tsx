import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { ADMIN_STATS, ADMIN_ACTIVITY } from '@/constants/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AdminDashboard() {
  const { colors, typography, radius } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  return (
    <ScreenWrapper edges={['top', 'left', 'right']}>
      {/* ── Standardized Admin Header ── */}
      <ScreenHeader title="Admin" showGreeting/>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* ── Bento Grid: Primary Metrics ── */}
        <View style={styles.bentoGrid}>
          <Card elevation="sm" style={[styles.metricCard, { borderColor: colors.border }]}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="people-outline" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.metricValue, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
              {ADMIN_STATS.totalParishioners}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
              Parishioners
            </Text>
          </Card>

          <Card elevation="sm" style={[styles.metricCard, { borderColor: colors.border }]}>
            <View style={[styles.iconCircle, { backgroundColor: colors.accentLight }]}>
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.accent} />
            </View>
            <View style={styles.badgeRow}>
              <Text style={[styles.metricValue, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
                {ADMIN_STATS.pendingApprovals}
              </Text>
              <View style={[styles.alertBadge, { backgroundColor: colors.danger }]}>
                <Text style={{ fontSize: 10, color: '#FFFFFF', fontFamily: typography.fontFamily.bold }}>NEW</Text>
              </View>
            </View>
            <Text style={[styles.metricLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
              Pending Approvals
            </Text>
          </Card>
        </View>

        {/* ── Weekly Collection Chart ── */}
        <Card elevation="sm" style={[styles.chartCard, { borderColor: colors.border }]}>
          <View style={styles.chartHeader}>
            <Text style={{ fontSize: 14, fontFamily: typography.fontFamily.bold, color: colors.text }}>
              Weekly Collection
            </Text>
            <Text style={{ fontSize: 12, fontFamily: typography.fontFamily.semiBold, color: colors.success }}>
              +12.5% vs LW
            </Text>
          </View>
          
          <View style={styles.barContainer}>
            {ADMIN_STATS.weeklyCollection.map((item, index) => {
              const maxHeight = 80;
              const maxAmount = Math.max(...ADMIN_STATS.weeklyCollection.map(d => d.amount));
              const barHeight = (item.amount / maxAmount) * maxHeight;
              const isSun = item.day === 'Sun';

              return (
                <View key={item.day} style={styles.barColumn}>
                  <View style={[
                    styles.bar, 
                    { 
                      height: barHeight, 
                      backgroundColor: isSun ? colors.primary : colors.primaryLight,
                      borderRadius: 4
                    }
                  ]} />
                  <Text style={[styles.barDay, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                    {item.day}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* ── Recent Activity Feed ── */}
        <View style={styles.activitySection}>
          <View style={styles.sectionHeader}>
            <Text style={{ fontSize: 16, fontFamily: typography.fontFamily.bold, color: colors.text }}>
              Recent Activity
            </Text>
            <TouchableOpacity>
              <Text style={{ fontSize: 12, fontFamily: typography.fontFamily.medium, color: colors.primary }}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {ADMIN_ACTIVITY.map((activity, index) => (
            <TouchableOpacity 
              key={activity.id} 
              style={[
                styles.activityItem, 
                { borderBottomColor: colors.divider, borderBottomWidth: index === ADMIN_ACTIVITY.length - 1 ? 0 : StyleSheet.hairlineWidth }
              ]}
              activeOpacity={0.7}
            >
              <View style={[styles.activityDot, { backgroundColor: activity.type === 'transition' ? colors.accent : colors.primary }]} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontFamily: typography.fontFamily.semiBold, color: colors.text }}>
                  {activity.user} <Text style={{ fontFamily: typography.fontFamily.regular, color: colors.textSecondary }}>{activity.details}</Text>
                </Text>
                <Text style={{ fontSize: 11, fontFamily: typography.fontFamily.medium, color: colors.textMuted, marginTop: 2 }}>
                  {activity.timestamp}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.border} />
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  addBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  bentoGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
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
});
